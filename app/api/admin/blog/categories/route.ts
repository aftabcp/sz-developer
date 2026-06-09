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
    const result = await db.execute('SELECT * FROM blog_categories ORDER BY name ASC');
    return NextResponse.json({ categories: result.rows });
  } catch (error: any) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories', details: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    const slug = name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    if (!slug) {
      return NextResponse.json({ error: 'Invalid category name' }, { status: 400 });
    }

    // Check slug uniqueness
    const checkResult = await db.execute({
      sql: 'SELECT id FROM blog_categories WHERE slug = ?',
      args: [slug],
    });

    if (checkResult.rows.length > 0) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }

    const id = `cat_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await db.execute({
      sql: 'INSERT INTO blog_categories (id, name, slug, created_at) VALUES (?, ?, ?, ?)',
      args: [id, name, slug, now],
    });

    return NextResponse.json({ success: true, category: { id, name, slug } });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category', details: error.message }, { status: 500 });
  }
}
