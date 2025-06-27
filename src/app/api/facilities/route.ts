import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function verifyAdmin(req: NextRequest) {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return false;
    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        return payload.role === 'ADMIN';
    } catch {
        return false;
    }
}

// Get all facilities
export async function GET() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ facilities });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch facilities' }, { status: 500 });
  }
}

// Create a new facility
export async function POST(req: NextRequest) {
  if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const data = await req.json();
    const { name } = data;
    if (!name) {
      return NextResponse.json({ error: 'Facility name is required' }, { status: 400 });
    }
    const facility = await prisma.facility.create({
      data,
    });
    return NextResponse.json(facility);
  } catch {
    return NextResponse.json({ error: 'Failed to create facility' }, { status: 500 });
  }
} 