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
