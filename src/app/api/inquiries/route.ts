import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/inquiries - list all inquiries (admin only)
export async function GET(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

    const [items, total] = await Promise.all([
      prisma.inquiry.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.inquiry.count(),
    ]);

    return Response.json({
      items,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    });
  } catch (error) {
    console.error('GET /api/inquiries error:', error);
    return Response.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
  }
}

// POST /api/inquiries - submit a contact form (public)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    if (!name || !email || !message) {
      return Response.json({ error: 'Name, email, and message are required' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.create({
      data: {
        name,
        email,
        phone: phone || null,
        message,
      },
    });

    return Response.json({ message: 'Inquiry submitted successfully', id: inquiry.id }, { status: 201 });
  } catch (error) {
    console.error('POST /api/inquiries error:', error);
    return Response.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

// PATCH /api/inquiries - mark as read (admin only)
export async function PATCH(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, read } = body;
    if (!id) {
      return Response.json({ error: 'Missing inquiry id' }, { status: 400 });
    }

    const inquiry = await prisma.inquiry.update({
      where: { id: Number(id) },
      data: { read: read ?? true },
    });

    return Response.json(inquiry);
  } catch (error) {
    console.error('PATCH /api/inquiries error:', error);
    return Response.json({ error: 'Failed to update inquiry' }, { status: 500 });
  }
}

// DELETE /api/inquiries - delete inquiry (admin only)
export async function DELETE(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'Missing inquiry id' }, { status: 400 });
    }

    await prisma.inquiry.delete({ where: { id: Number(id) } });
    return Response.json({ message: 'Inquiry deleted' });
  } catch (error) {
    console.error('DELETE /api/inquiries error:', error);
    return Response.json({ error: 'Failed to delete inquiry' }, { status: 500 });
  }
}
