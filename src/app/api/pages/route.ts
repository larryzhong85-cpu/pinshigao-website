import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const published = searchParams.get('published');
  const search = searchParams.get('search');
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'desc';

  const where: Record<string, unknown> = {};

  if (published === 'true') {
    where.published = true;
  } else if (published === 'false') {
    where.published = false;
  }

  if (search) {
    where.OR = [
      { titleZh: { contains: search } },
      { titleEn: { contains: search } },
      { titleDe: { contains: search } },
      { slug: { contains: search } },
    ];
  }

  const orderBy: Record<string, string> = {};
  const allowedSortFields = ['createdAt', 'updatedAt', 'titleZh', 'titleEn', 'titleDe', 'slug'];
  const field = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  orderBy[field] = sortOrder === 'asc' ? 'asc' : 'desc';

  try {
    const pages = await prisma.page.findMany({
      where,
      orderBy,
    });

    return Response.json({ pages });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch pages';
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = requireAuth(request);
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { slug, titleZh, titleEn, titleDe, contentZh, contentEn, contentDe, published } = body;

  if (!slug || !titleZh || !titleEn || !titleDe) {
    return Response.json(
      { error: 'Missing required fields: slug, titleZh, titleEn, titleDe' },
      { status: 400 }
    );
  }

  if (typeof slug !== 'string' || typeof titleZh !== 'string' || typeof titleEn !== 'string' || typeof titleDe !== 'string') {
    return Response.json({ error: 'slug, titleZh, titleEn, titleDe must be strings' }, { status: 400 });
  }

  try {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) {
      return Response.json({ error: 'A page with this slug already exists' }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        slug,
        titleZh,
        titleEn,
        titleDe,
        contentZh: typeof contentZh === 'string' ? contentZh : null,
        contentEn: typeof contentEn === 'string' ? contentEn : null,
        contentDe: typeof contentDe === 'string' ? contentDe : null,
        published: typeof published === 'boolean' ? published : true,
      },
    });

    return Response.json({ page }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create page';
    return Response.json({ error: message }, { status: 500 });
  }
}
