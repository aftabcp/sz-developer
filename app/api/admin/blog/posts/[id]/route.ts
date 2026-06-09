import { db } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      slug,
      excerpt,
      content,
      cover_image_url,
      author,
      category,
      tags,
      meta_title,
      meta_description,
      og_image_url,
      status,
      featured,
      reading_time,
      published_at,
    } = body;

    // Fetch existing post
    const checkResult = await db.execute({
      sql: 'SELECT id, status, published_at FROM blogs WHERE id = ?',
      args: [id],
    });
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const currentPost = checkResult.rows[0];

    // Slug validation (must be unique)
    let finalSlug = slug;
    if (finalSlug) {
      const slugCheck = await db.execute({
        sql: 'SELECT id FROM blogs WHERE slug = ? AND id != ?',
        args: [finalSlug, id],
      });
      if (slugCheck.rows.length > 0) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }

    // Auto-calculate reading time if not provided
    let finalReadingTime = reading_time;
    if (finalReadingTime === undefined || finalReadingTime === null) {
      const wordsCount = content ? content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length : 0;
      finalReadingTime = Math.max(1, Math.ceil(wordsCount / 200));
    }

    // Determine published_at value
    let finalPublishedAt = published_at;
    if (status === 'published') {
      if (!currentPost.published_at && !finalPublishedAt) {
        finalPublishedAt = new Date().toISOString();
      } else {
        finalPublishedAt = finalPublishedAt || currentPost.published_at;
      }
    } else if (status === 'draft') {
      finalPublishedAt = null;
    }

    const now = new Date().toISOString();

    await db.execute({
      sql: `UPDATE blogs SET 
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        excerpt = COALESCE(?, excerpt),
        content = COALESCE(?, content),
        cover_image_url = COALESCE(?, cover_image_url),
        author = COALESCE(?, author),
        category = COALESCE(?, category),
        tags = COALESCE(?, tags),
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        og_image_url = COALESCE(?, og_image_url),
        status = COALESCE(?, status),
        featured = COALESCE(?, featured),
        reading_time = COALESCE(?, reading_time),
        published_at = ?,
        updated_at = ?
      WHERE id = ?`,
      args: [
        title,
        finalSlug,
        excerpt,
        content,
        cover_image_url,
        author,
        category,
        tags,
        meta_title,
        meta_description,
        og_image_url,
        status,
        featured !== undefined ? (featured ? 1 : 0) : undefined,
        finalReadingTime,
        finalPublishedAt,
        now,
        id,
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Failed to update post', details: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await db.execute({
      sql: 'DELETE FROM blogs WHERE id = ?',
      args: [id],
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Failed to delete post', details: error.message }, { status: 500 });
  }
}
