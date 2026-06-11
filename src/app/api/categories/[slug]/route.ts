import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const category = await prisma.category.findUnique({ where: { slug } })
  if (!category) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }
  return Response.json(category)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = requireAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const body = await request.json()
  const { nameZh, nameEn, nameDe, image, order, slug: newSlug } = body

  const existing = await prisma.category.findUnique({ where: { slug } })
  if (!existing) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  // If slug is being changed, check for conflict
  if (newSlug && newSlug !== slug) {
    const conflict = await prisma.category.findUnique({ where: { slug: newSlug } })
    if (conflict) {
      return Response.json({ error: 'New slug already exists' }, { status: 409 })
    }
  }

  const data: Record<string, any> = {}
  if (nameZh !== undefined) data.nameZh = nameZh
  if (nameEn !== undefined) data.nameEn = nameEn
  if (nameDe !== undefined) data.nameDe = nameDe
  if (image !== undefined) data.image = image
  if (order !== undefined) data.order = order
  if (newSlug && newSlug !== slug) data.slug = newSlug

  const category = await prisma.category.update({
    where: { slug },
    data,
  })

  return Response.json(category)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const user = requireAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { slug } = await params
  const existing = await prisma.category.findUnique({ where: { slug } })
  if (!existing) {
    return Response.json({ error: 'Category not found' }, { status: 404 })
  }

  // Check if category has products
  const productCount = await prisma.product.count({ where: { categoryId: existing.id } })
  if (productCount > 0) {
    return Response.json({
      error: `Cannot delete category with ${productCount} product(s). Move or delete them first.`
    }, { status: 409 })
  }

  await prisma.category.delete({ where: { slug } })
  return Response.json({ message: 'Category deleted' })
}
