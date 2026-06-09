import { db } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await db.execute('SELECT * FROM blogs ORDER BY created_at DESC');
    return NextResponse.json({ posts: result.rows });
  } catch (error: any) {
    console.error('Error fetching admin blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      author = 'Admin',
      category,
      tags = '',
      meta_title,
      meta_description,
      og_image_url,
      status = 'draft',
      featured = 0,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Generate slug if not provided
    let finalSlug = slug || title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    
    if (!finalSlug) {
      finalSlug = `post-${Date.now()}`;
    }

    // Verify slug uniqueness
    const slugCheck = await db.execute({
      sql: 'SELECT id FROM blogs WHERE slug = ?',
      args: [finalSlug],
    });
    if (slugCheck.rows.length > 0) {
      finalSlug = `${finalSlug}-${crypto.randomBytes(3).toString('hex')}`;
    }

    // Calculate reading time based on content
    const wordsCount = content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;
    const readingTime = Math.max(1, Math.ceil(wordsCount / 200));

    const id = `post_${crypto.randomUUID()}`;
    const publishedAt = status === 'published' ? new Date().toISOString() : null;
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO blogs (
        id, title, slug, excerpt, content, cover_image_url, author, category, 
        tags, meta_title, meta_description, og_image_url, status, featured, 
        reading_time, published_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        title,
        finalSlug,
        excerpt || '',
        content || '',
        cover_image_url || '',
        author || 'Admin',
        category || '',
        tags || '',
        meta_title || title,
        meta_description || excerpt || '',
        og_image_url || cover_image_url || '',
        status,
        featured ? 1 : 0,
        readingTime,
        publishedAt,
        now,
        now,
      ],
    });

    return NextResponse.json({ success: true, id, slug: finalSlug });
  } catch (error: any) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Failed to create post', details: error.message }, { status: 500 });
  }
}
