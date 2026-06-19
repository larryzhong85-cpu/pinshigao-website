import { NextRequest } from 'next/server';

// Free translation via MyMemory API (no API key needed for basic use)
async function translate(text: string, source: string, target: string): Promise<string> {
  if (!text || text.trim().length === 0) return '';

  // Don't translate if it's HTML - extract text content between tags
  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isHtml) {
    // For HTML content, just return a note
    // Users can translate section by section with the visual editor
    return text;
  }

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=${source}|${target}`,
      { signal: AbortSignal.timeout(5000) },
    );
    const data = await res.json();
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return text; // fallback: return original
  } catch {
    return text; // fallback on error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, source = 'zh-CN', targets = ['en', 'de'] } = body;

    if (!text) {
      return Response.json({ error: 'Missing text' }, { status: 400 });
    }

    const results: Record<string, string> = {};
    for (const target of targets) {
      results[target] = await translate(text, source, target);
    }

    return Response.json(results);
  } catch (error) {
    console.error('Translate error:', error);
    return Response.json({ error: 'Translation failed' }, { status: 500 });
  }
}
