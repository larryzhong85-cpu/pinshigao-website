import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const settings = await prisma.setting.findMany({
    orderBy: { id: 'asc' },
  })
  return Response.json(settings)
}

export async function PUT(request: NextRequest) {
  const user = requireAuth(request)
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()

  // Support both single {key, value} and multi-key object {siteTitle: "...", ...}
  const updates: { key: string; value: string }[] = [];

  if (body.key && body.value !== undefined) {
    updates.push({ key: body.key, value: body.value });
  } else {
    // Assume it's a full settings object
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        updates.push({ key, value });
      }
    }
  }

  if (updates.length === 0) {
    return Response.json({ error: 'No valid settings to update' }, { status: 400 });
  }

  const results = [];
  for (const { key, value } of updates) {
    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
    results.push(setting);
  }

  return Response.json(results);
}
