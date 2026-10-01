import { revalidateTag } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

// Called by the backend (server-to-server, fire-and-forget) right after a
// product is created, updated, or its status changes, so a publish is
// visible well inside the ISR revalidate window instead of waiting it out.
// REVALIDATE_SECRET is a plain (non-NEXT_PUBLIC_) env var — never sent to
// the browser — shared only between this route and the backend.
export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-revalidate-secret');
  const expected = process.env.REVALIDATE_SECRET;

  if (!expected || secret !== expected) {
    return NextResponse.json(
      { success: false, message: 'Invalid revalidation secret' },
      { status: 401 },
    );
  }

  const body = await request.json().catch(() => null);
  const tags = Array.isArray(body?.tags) ? body.tags : [];
  if (tags.length === 0) {
    return NextResponse.json(
      { success: false, message: 'No tags provided' },
      { status: 400 },
    );
  }

  for (const tag of tags) {
    // { expire: 0 } (not the "max" profile) because this is a webhook from
    // our own backend after a write — the whole point is immediate
    // expiration, not next-visit stale-while-revalidate. Per Next's own
    // revalidateTag docs: "necessary when external systems call your Route
    // Handlers and require data to expire immediately."
    if (typeof tag === 'string') revalidateTag(tag, { expire: 0 });
  }

  return NextResponse.json({ success: true, revalidated: tags });
}
