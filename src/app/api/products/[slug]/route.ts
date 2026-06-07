import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

// GET /api/products/[slug] - get single product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: { category: true },
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error('GET /api/products/[slug] error:', error);
    return Response.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// PUT /api/products/[slug] - update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const body = await request.json();

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    // If slug is being changed, check new slug uniqueness
    const newSlug = body.slug;
    if (newSlug && newSlug !== slug) {
      const slugConflict = await prisma.product.findUnique({ where: { slug: newSlug } });
      if (slugConflict) {
        return Response.json({ error: 'Slug already exists' }, { status: 409 });
      }
    }

    const data: Record<string, unknown> = {};
    const mutableFields = [
      'slug', 'nameZh', 'nameEn', 'nameDe',
      'subtitleZh', 'subtitleEn', 'subtitleDe',
      'descZh', 'descEn', 'descDe',
      'specsZh', 'specsEn', 'specsDe',
      'featured', 'order', 'published',
    ] as const;

    for (const field of mutableFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    if (body.images !== undefined) {
      data.images = typeof body.images === 'string'
        ? body.images
        : JSON.stringify(body.images);
    }

    if (body.categoryId !== undefined) {
      data.categoryId = body.categoryId ? parseInt(body.categoryId, 10) : null;
    }

    const product = await prisma.product.update({
      where: { slug },
      data,
      include: { category: true },
    });

    return Response.json(product);
  } catch (error) {
    console.error('PUT /api/products/[slug] error:', error);
    return Response.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

// DELETE /api/products/[slug] - delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAuth(request);
  if (!auth) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { slug } = await params;

    const existing = await prisma.product.findUnique({ where: { slug } });
    if (!existing) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    await prisma.product.delete({ where: { slug } });

    return Response.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('DELETE /api/products/[slug] error:', error);
    return Response.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}
