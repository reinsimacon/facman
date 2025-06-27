import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function isAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as { role: string, id: string };
    return decoded.role === 'ADMIN' ? decoded : false;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const admin = isAdmin(req);
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { title, content } = await req.json();
  if (!title || !content) return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
  try {
    const announcement = await prisma.announcement.create({ data: { title, content, authorId: admin.id } });
    return NextResponse.json({ id: announcement.id, title: announcement.title, content: announcement.content });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, content: true, createdAt: true }
    });
    return NextResponse.json({ announcements });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 