import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/products - list all products
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const featured = searchParams.get('featured');
    const published = searchParams.get('published');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));

    const where: Record<string, unknown> = {};

    if (categoryId) {
      where.categoryId = parseInt(categoryId, 10);
    }

    if (search) {
      where.OR = [
        { nameZh: { contains: search } },
        { nameEn: { contains: search } },
        { nameDe: { contains: search } },
        { slug: { contains: search } },
      ];
    }

    if (featured === 'true') {
      where.featured = true;
    } else if (featured === 'false') {
      where.featured = false;
    }

    if (published === 'true') {
      where.published = true;
    } else if (published === 'false') {
      where.published = false;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { order: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.product.count({ where }),
    ]);

    return Response.json({
      products,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('GET /api/products error:', error);
    return Response.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// POST /api/products - create new product
export async function POST(request: NextRequest) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      slug,
      nameZh,
      nameEn,
      nameDe,
      subtitleZh,
      subtitleEn,
      subtitleDe,
      descZh,
      descEn,
      descDe,
      specsZh,
      specsEn,
      specsDe,
      images,
      categoryId,
      featured,
      order,
      published,
    } = body;

    if (!slug || !nameZh || !nameEn || !nameDe) {
      return Response.json(
        { error: 'Missing required fields: slug, nameZh, nameEn, nameDe' },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return Response.json({ error: 'Slug already exists' }, { status: 409 });
    }

    const product = await prisma.product.create({
      data: {
        slug,
        nameZh,
        nameEn,
        nameDe,
        subtitleZh: subtitleZh ?? null,
        subtitleEn: subtitleEn ?? null,
        subtitleDe: subtitleDe ?? null,
        descZh: descZh ?? null,
        descEn: descEn ?? null,
        descDe: descDe ?? null,
        specsZh: specsZh ?? null,
        specsEn: specsEn ?? null,
        specsDe: specsDe ?? null,
        images: images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null,
        categoryId: categoryId ? parseInt(categoryId, 10) : null,
        featured: featured ?? false,
        order: order ?? 0,
        published: published ?? true,
      },
      include: { category: true },
    });

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error('POST /api/products error:', error);
    return Response.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
