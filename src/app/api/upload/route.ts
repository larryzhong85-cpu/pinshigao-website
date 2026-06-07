import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import crypto from 'node:crypto'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_WIDTH = 1920
const MAX_HEIGHT = 1920
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return Response.json({ error: `Unsupported file type: ${file.type}` }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Optimize image with sharp
    let optimized: Buffer
    const ext = 'webp'

    const image = sharp(buffer)
    const metadata = await image.metadata()

    // Resize if exceeding max dimensions
    if (
      (metadata.width && metadata.width > MAX_WIDTH) ||
      (metadata.height && metadata.height > MAX_HEIGHT)
    ) {
      image.resize({
        width: Math.min(metadata.width ?? MAX_WIDTH, MAX_WIDTH),
        height: Math.min(metadata.height ?? MAX_HEIGHT, MAX_HEIGHT),
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Convert non-gif images to webp; keep gif as-is
    if (file.type === 'image/gif') {
      optimized = await image.toBuffer()
    } else {
      optimized = await image.webp({ quality: 80 }).toBuffer()
    }

    const uniqueName = `${crypto.randomUUID()}.${ext}`
    const filePath = path.join(UPLOAD_DIR, uniqueName)

    await mkdir(UPLOAD_DIR, { recursive: true })
    await writeFile(filePath, optimized)

    return Response.json(
      {
        filename: uniqueName,
        original: file.name,
        url: `/uploads/${uniqueName}`,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return Response.json({ error: 'Upload failed' }, { status: 500 })
  }
}
