import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
    include: {
      _count: {
        select: { products: true },
      },
    },
  })

  return Response.json(categories)
}

export async function POST(request: NextRequest) {
  const user = requireAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { nameZh, nameEn, nameDe, slug, image, order } = body

  if (!nameZh || !nameEn || !nameDe || !slug) {
    return Response.json(
      { error: 'Missing required fields: nameZh, nameEn, nameDe, slug' },
      { status: 400 }
    )
  }

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (existing) {
    return Response.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const category = await prisma.category.create({
    data: {
      nameZh,
      nameEn,
      nameDe,
      slug,
      image: image ?? null,
      order: order ?? 0,
    },
  })

  return Response.json(category, { status: 201 })
}

export async function PUT(request: NextRequest) {
  const user = requireAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { id, nameZh, nameEn, nameDe, slug, image, order } = body

  if (!id) {
    return Response.json({ error: 'Missing category id' }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { id: Number(id) } })
  if (!existing) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const data: Record<string, any> = {}
  if (nameZh !== undefined) data.nameZh = nameZh
  if (nameEn !== undefined) data.nameEn = nameEn
  if (nameDe !== undefined) data.nameDe = nameDe
  if (image !== undefined) data.image = image
  if (order !== undefined) data.order = order
  if (slug && slug !== existing.slug) {
    const conflict = await prisma.category.findUnique({ where: { slug } })
    if (conflict) {
      return Response.json({ error: 'Slug already exists' }, { status: 409 })
    }
    data.slug = slug
  }

  const category = await prisma.category.update({
    where: { id: Number(id) },
    data,
  })

  return Response.json(category)
}

export async function DELETE(request: NextRequest) {
  const user = requireAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return Response.json({ error: 'Missing category id' }, { status: 400 })
  }

  const existing = await prisma.category.findUnique({ where: { id: Number(id) } })
  if (!existing) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  const productCount = await prisma.product.count({ where: { categoryId: existing.id } })
  if (productCount > 0) {
    return Response.json({
      error: `Cannot delete category with ${productCount} product(s).`
    }, { status: 409 })
  }

  await prisma.category.delete({ where: { id: Number(id) } })
  return Response.json({ message: 'Category deleted' })
}
