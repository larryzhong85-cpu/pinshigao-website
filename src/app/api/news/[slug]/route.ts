import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/news/[slug] - get a single news article by slug
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const news = await prisma.news.findUnique({ where: { slug } });
    if (!news) {
      return Response.json({ error: 'News article not found' }, { status: 404 });
    }

    return Response.json(news);
  } catch (error) {
    console.error('Error fetching news:', error);
    return Response.json({ error: 'Failed to fetch news article' }, { status: 500 });
  }
}

// PUT /api/news/[slug] - update a news article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const existing = await prisma.news.findUnique({ where: { slug } });
    if (!existing) {
      return Response.json({ error: 'News article not found' }, { status: 404 });
    }

    const body = await request.json();

    // If slug is being changed, check for conflicts
    if (body.slug && body.slug !== slug) {
      const duplicate = await prisma.news.findUnique({ where: { slug: body.slug } });
      if (duplicate) {
        return Response.json({ error: 'A news article with this slug already exists' }, { status: 409 });
      }
    }

    const news = await prisma.news.update({
      where: { slug },
      data: {
        ...(body.slug !== undefined && { slug: body.slug }),
        ...(body.titleZh !== undefined && { titleZh: body.titleZh }),
        ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
        ...(body.titleDe !== undefined && { titleDe: body.titleDe }),
        ...(body.summaryZh !== undefined && { summaryZh: body.summaryZh }),
        ...(body.summaryEn !== undefined && { summaryEn: body.summaryEn }),
        ...(body.summaryDe !== undefined && { summaryDe: body.summaryDe }),
        ...(body.contentZh !== undefined && { contentZh: body.contentZh }),
        ...(body.contentEn !== undefined && { contentEn: body.contentEn }),
        ...(body.contentDe !== undefined && { contentDe: body.contentDe }),
        ...(body.image !== undefined && { image: body.image }),
        ...(body.date !== undefined && { date: new Date(body.date) }),
        ...(body.published !== undefined && { published: body.published }),
      },
    });

    return Response.json(news);
  } catch (error) {
    console.error('Error updating news:', error);
    return Response.json({ error: 'Failed to update news article' }, { status: 500 });
  }
}

// DELETE /api/news/[slug] - delete a news article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const existing = await prisma.news.findUnique({ where: { slug } });
    if (!existing) {
      return Response.json({ error: 'News article not found' }, { status: 404 });
    }

    await prisma.news.delete({ where: { slug } });

    return Response.json({ message: 'News article deleted successfully' });
  } catch (error) {
    console.error('Error deleting news:', error);
    return Response.json({ error: 'Failed to delete news article' }, { status: 500 });
  }
}
