import { db } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    // Fetch the category to delete
    const categoryResult = await db.execute({
      sql: 'SELECT slug, name FROM blog_categories WHERE id = ?',
      args: [id],
    });

    if (categoryResult.rows.length === 0) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    const { slug, name } = categoryResult.rows[0];

    // Check if any posts exist in this category
    const postsCheck = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM blogs WHERE category = ?',
      args: [slug as string],
    });

    const postsCount = Number(postsCheck.rows[0].count);
    if (postsCount > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete "${name}". There are ${postsCount} blog post(s) currently assigned to this category. Please update those posts first.` 
        },
        { status: 400 }
      );
    }

    // Safe to delete
    await db.execute({
      sql: 'DELETE FROM blog_categories WHERE id = ?',
      args: [id],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ error: 'Failed to delete category', details: error.message }, { status: 500 });
  }
}
