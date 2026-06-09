import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await db.execute({
      sql: `SELECT id, title, slug, excerpt, cover_image_url, reading_time, published_at, category FROM blogs 
            WHERE status = 'published' AND featured = 1 
            ORDER BY published_at DESC LIMIT 3`,
    });
    return NextResponse.json({ posts: result.rows });
  } catch (error: any) {
    console.error('Error fetching featured posts:', error);
    return NextResponse.json({ error: 'Failed to fetch featured posts', details: error.message }, { status: 500 });
  }
}
