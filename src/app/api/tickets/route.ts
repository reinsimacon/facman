import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, TicketStatus, Priority, ImpactLevel } from '@/generated/prisma';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'comfac123';

type TicketUpdateData = {
  status?: TicketStatus;
  priority?: Priority;
  assignedToId?: string | null;
  scheduledDate?: Date | string | null;
  completionDate?: Date | string | null;
  denialReason?: string | null;
  locationDetail?: string | null;
  impactLevel?: ImpactLevel;
};

async function getUserFromRequest(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '') || req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
    return payload;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let where = {};
  if (user.role === 'USER') {
    where = { userId: user.id };
  } else if (user.role === 'MAINTENANCE') {
    where = { assignedToId: user.id };
  }
  // Admins have no `where` clause, so they get all tickets

  const tickets = await prisma.ticket.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      facility: { select: { name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const data = await req.json();

  // Only extract fields that exist in the Ticket model
  const {
    title,
    description,
    purpose,
    facilityId,
    priority,
    locationDetail,
    impactLevel,
    requestedCompletionDate,
    photoUrl,
    requestOfMaterials,
    // ignore documentUrl, remarks, etc.
  } = data;

  if (!title || !description || !purpose || !facilityId || !priority) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const ticket = await prisma.ticket.create({
    data: {
      title,
      description,
      purpose,
      facilityId,
      priority,
      userId: String(user.id),
      locationDetail,
      impactLevel,
      requestedCompletionDate: requestedCompletionDate ? new Date(requestedCompletionDate) : null,
      photoUrl,
      requestOfMaterials,
    },
    include: { user: { select: { name: true } }, facility: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, ticket });
}

export async function PATCH(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user || !['ADMIN', 'MAINTENANCE'].includes(user.role as string)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { ticketId } = body;

  if (!ticketId) {
    return NextResponse.json({ error: 'Missing ticketId' }, { status: 400 });
  }
  
  let dataToUpdate: TicketUpdateData = {};

  try {
    if (user.role === 'ADMIN') {
      // Admins can update a wider range of fields
      const {
        status,
        denialReason,
        priority,
        assignedToId,
        scheduledDate,
        completionDate,
        locationDetail,
      } = body;
      
      dataToUpdate = {
        status,
        priority,
        assignedToId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        completionDate: completionDate ? new Date(completionDate) : null,
        denialReason: status === 'DENIED' ? denialReason : null,
        locationDetail,
      };

    } else if (user.role === 'MAINTENANCE') {
      // Maintenance can only update status and completion date
      const { status } = body;
      
      if (status) {
         dataToUpdate.status = status;
      }
      if (status === 'RESOLVED') {
        dataToUpdate.completionDate = new Date().toISOString();
      }
    }
    
    // Filter out undefined values so they don't overwrite existing data
    Object.keys(dataToUpdate).forEach((key) => {
      const typedKey = key as keyof TicketUpdateData;
      if (dataToUpdate[typedKey] === undefined) {
        delete dataToUpdate[typedKey];
      }
    });


    const updated = await prisma.ticket.update({
      where: { id: ticketId },
      data: dataToUpdate,
      include: {
        user: { select: { name: true } },
        facility: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error('PATCH /api/tickets error:', err);
    return NextResponse.json({ error: 'Update failed', details: String(err) }, { status: 500 });
  }
} 