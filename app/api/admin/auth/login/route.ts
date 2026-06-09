import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminSecret = process.env.ADMIN_SECRET_TOKEN;

    if (!adminSecret) {
      return NextResponse.json(
        { error: 'Admin authentication is not configured in the environment variables.' },
        { status: 500 }
      );
    }

    if (username === adminUsername && password === adminSecret) {
      return NextResponse.json({ success: true, token: adminSecret });
    }

    return NextResponse.json({ error: 'Invalid admin username or password' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Invalid request payload', details: error.message }, { status: 400 });
  }
}
