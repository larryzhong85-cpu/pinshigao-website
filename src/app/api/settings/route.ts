import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  const settings = await prisma.setting.findMany({
    orderBy: { id: 'asc' },
  })
  return Response.json(settings)
}

export async function PUT(request: NextRequest) {
  const body = await request.json()
  const { key, value } = body

  if (!key || value === undefined) {
    return Response.json({ error: 'key and value are required' }, { status: 400 })
  }

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })

  return Response.json(setting)
}
