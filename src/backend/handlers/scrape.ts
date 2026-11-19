import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsite } from '@/backend/services/crawler';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: 'Missing website URL' }, { status: 400 });
    }

    const data = await crawlWebsite(url);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scraping failed' }, { status: 500 });
  }
}

