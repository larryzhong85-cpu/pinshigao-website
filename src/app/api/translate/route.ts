import { NextRequest } from 'next/server';

// Free translation via MyMemory API (no API key needed for basic use)
async function translate(text: string, source: string, target: string): Promise<string> {
  if (!text || text.trim().length === 0) return '';

  // If text is HTML, strip all tags to get plain text for translation
  let plainText = text;
  const isHtml = /<[a-z][\s\S]*>/i.test(text);
  if (isHtml) {
    plainText = text
      .replace(/<[^>]*>/g, ' ')   // strip tags
      .replace(/&nbsp;/g, ' ')    // decode &nbsp;
      .replace(/&amp;/g, '&')     // decode &amp;
      .replace(/&lt;/g, '<')      // decode &lt;
      .replace(/&gt;/g, '>')      // decode &gt;
      .replace(/&quot;/g, '"')    // decode &quot;
      .replace(/\s+/g, ' ')       // collapse whitespace
      .trim();
  }

  const textToTranslate = plainText.slice(0, 2000); // character limit
  if (!textToTranslate) return text; // if stripping left nothing, return original

  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(textToTranslate)}&langpair=${source}|${target}`,
      { signal: AbortSignal.timeout(8000) },
    );
    const data = await res.json();
    if (data?.responseStatus === 200 && data?.responseData?.translatedText) {
      return data.responseData.translatedText;
    }
    return isHtml ? plainText : text; // fallback: return plain text for HTML, original for plain
  } catch {
    return isHtml ? plainText : text; // fallback on error
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
