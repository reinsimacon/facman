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

// GET a single facility by ID
export async function GET(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const facility = await prisma.facility.findUnique({
            where: { id },
            include: { tickets: { where: { status: { not: 'CLOSED' } } } }
        });
        if (!facility) return NextResponse.json({ error: 'Facility not found' }, { status: 404 });
        return NextResponse.json(facility);
    } catch {
        return NextResponse.json({ error: 'Failed to fetch facility' }, { status: 500 });
    }
}

// UPDATE a facility
export async function PUT(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        const data = await req.json();
        const updatedFacility = await prisma.facility.update({
            where: { id },
            data,
        });
        return NextResponse.json(updatedFacility);
    } catch (e) {
        console.error("Facility update error:", e);
        return NextResponse.json({ error: 'Failed to update facility' }, { status: 500 });
    }
}

// DELETE a facility
export async function DELETE(
    req: NextRequest, 
    { params }: { params: Promise<{ id: string }> }
) {
    if (!await verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    try {
        const { id } = await params;
        await prisma.facility.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Failed to delete facility' }, { status: 500 });
    }
} 