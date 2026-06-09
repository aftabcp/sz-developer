import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const offset = (page - 1) * limit;

    let query = `SELECT * FROM blogs WHERE status = 'published'`;
    let countQuery = `SELECT COUNT(*) as count FROM blogs WHERE status = 'published'`;
    const args: any[] = [];
    const countArgs: any[] = [];

    if (category && category !== 'all' && category !== 'All') {
      query += ` AND category = ?`;
      countQuery += ` AND category = ?`;
      args.push(category);
      countArgs.push(category);
    }

    if (search) {
      query += ` AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR tags LIKE ?)`;
      countQuery += ` AND (title LIKE ? OR excerpt LIKE ? OR content LIKE ? OR tags LIKE ?)`;
      const searchPattern = `%${search}%`;
      args.push(searchPattern, searchPattern, searchPattern, searchPattern);
      countArgs.push(searchPattern, searchPattern, searchPattern, searchPattern);
    }

    query += ` ORDER BY published_at DESC LIMIT ? OFFSET ?`;
    args.push(limit, offset);

    const postsResult = await db.execute({ sql: query, args });
    const countResult = await db.execute({ sql: countQuery, args: countArgs });

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      posts: postsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching blog posts:', error);
    return NextResponse.json({ error: 'Failed to fetch posts', details: error.message }, { status: 500 });
  }
}
