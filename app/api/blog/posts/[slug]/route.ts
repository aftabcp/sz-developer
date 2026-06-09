import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 });
    }

    const result = await db.execute({
      sql: `SELECT * FROM blogs WHERE slug = ? AND status = 'published'`,
      args: [slug],
    });

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const post = result.rows[0];

    // Fetch related posts (same category, different id, status = 'published', max 3)
    const relatedResult = await db.execute({
      sql: `SELECT id, title, slug, excerpt, cover_image_url, reading_time, published_at, category FROM blogs 
            WHERE category = ? AND id != ? AND status = 'published' 
            ORDER BY published_at DESC LIMIT 3`,
      args: [post.category || '', post.id],
    });

    return NextResponse.json({
      post,
      related: relatedResult.rows,
    });
  } catch (error: any) {
    console.error('Error fetching blog post by slug:', error);
    return NextResponse.json({ error: 'Failed to fetch post', details: error.message }, { status: 500 });
  }
}
