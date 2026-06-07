import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/news - list news with optional pagination and status filter
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const published = searchParams.get('published');

    const where: { published?: boolean } = {};
    if (published === 'true') where.published = true;
    else if (published === 'false') where.published = false;

    const [items, total] = await Promise.all([
      prisma.news.findMany({
        where,
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.news.count({ where }),
    ]);

    return Response.json({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error listing news:', error);
    return Response.json({ error: 'Failed to fetch news' }, { status: 500 });
  }
}

// POST /api/news - create a news article
export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { slug } = body;
    if (!slug) {
      return Response.json({ error: 'Slug is required' }, { status: 400 });
    }

    // Check for duplicate slug
    const existing = await prisma.news.findUnique({ where: { slug } });
    if (existing) {
      return Response.json({ error: 'A news article with this slug already exists' }, { status: 409 });
    }

    const news = await prisma.news.create({
      data: {
        slug,
        titleZh: body.titleZh || '',
        titleEn: body.titleEn || '',
        titleDe: body.titleDe || '',
        summaryZh: body.summaryZh || null,
        summaryEn: body.summaryEn || null,
        summaryDe: body.summaryDe || null,
        contentZh: body.contentZh || null,
        contentEn: body.contentEn || null,
        contentDe: body.contentDe || null,
        image: body.image || null,
        date: body.date ? new Date(body.date) : new Date(),
        published: body.published !== undefined ? body.published : true,
      },
    });

    return Response.json(news, { status: 201 });
  } catch (error) {
    console.error('Error creating news:', error);
    return Response.json({ error: 'Failed to create news article' }, { status: 500 });
  }
}
