import { NextResponse } from 'next/server';

const RAPID_API_URL = 'https://article-extractor-and-summarizer.p.rapidapi.com/summarize';
const RAPID_API_HOST = 'article-extractor-and-summarizer.p.rapidapi.com';

export async function GET(request) {
  const apiKey = process.env.RAPID_API_KEY;
  const articleUrl = request.nextUrl.searchParams.get('url');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'The summarization service is not configured.' },
      { status: 503 }
    );
  }

  try {
    const parsedUrl = new URL(articleUrl);
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Unsupported URL protocol');
    }
  } catch {
    return NextResponse.json(
      { error: 'Enter a valid HTTP or HTTPS article URL.' },
      { status: 400 }
    );
  }

  try {
    const upstreamUrl = new URL(RAPID_API_URL);
    upstreamUrl.searchParams.set('url', articleUrl);
    upstreamUrl.searchParams.set('length', '3');

    const response = await fetch(upstreamUrl, {
      headers: {
        'X-RapidAPI-Key': apiKey,
        'X-RapidAPI-Host': RAPID_API_HOST,
      },
      cache: 'no-store',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || 'The summarization provider could not process this URL.' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: 'The summarization service is temporarily unavailable.' },
      { status: 502 }
    );
  }
}
