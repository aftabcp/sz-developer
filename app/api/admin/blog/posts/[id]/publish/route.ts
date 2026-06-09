import { db } from '@/lib/db';
import { isAuthorized } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const now = new Date().toISOString();
    await db.execute({
      sql: `UPDATE blogs SET status = 'published', published_at = COALESCE(published_at, ?), updated_at = ? WHERE id = ?`,
      args: [now, now, id],
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error publishing blog post:', error);
    return NextResponse.json({ error: 'Failed to publish post', details: error.message }, { status: 500 });
  }
}
