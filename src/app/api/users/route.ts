import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Role } from '@/generated/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

function isAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return false;
  try {
    const token = auth.replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme') as { role: string };
    return decoded.role === 'ADMIN';
  } catch {
    return false;
  }
}

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');

  const where = role ? { role: role as Role } : {};

  const users = await prisma.user.findMany({ 
    where,
    select: { id: true, name: true, email: true, role: true } 
  });
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password || !role) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role },
  });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id, name, email, password, role }: { id: string, name: string, email: string, password?: string, role: Role } = await req.json();
  if (!id || !name || !email || !role) {
    return NextResponse.json({ error: 'All fields except password are required' }, { status: 400 });
  }
  const data: { name: string; email: string; role: Role; password?: string } = { name, email, role };
  if (password) data.password = await bcrypt.hash(password, 10);
  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ id: user.id, email: user.email, name: user.name, role: user.role });
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'User id required' }, { status: 400 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
} 