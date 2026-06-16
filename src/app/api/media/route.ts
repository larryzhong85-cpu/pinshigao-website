import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { unlink } from 'node:fs/promises';
import path from 'node:path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

export async function GET() {
  try {
    const media = await prisma.media.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const items = media.map((m) => ({
      id: m.id,
      filename: m.filename,
      url: `/uploads/${m.filename}`,
      thumbUrl: `/uploads/${m.filename}`,
      size: m.size,
      type: m.mimetype,
      createdAt: m.createdAt.toISOString(),
    }));

    return Response.json(items);
  } catch (error) {
    console.error('GET /api/media error:', error);
    return Response.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return Response.json({ error: 'Missing media id' }, { status: 400 });
    }

    const existing = await prisma.media.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return Response.json({ error: 'Media not found' }, { status: 404 });
    }

    // Delete file from disk
    const filePath = path.join(UPLOAD_DIR, existing.filename);
    try {
      await unlink(filePath);
    } catch {
      // File may not exist on disk, that's OK
    }

    await prisma.media.delete({ where: { id: Number(id) } });
    return Response.json({ message: 'Media deleted' });
  } catch (error) {
    console.error('DELETE /api/media error:', error);
    return Response.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
