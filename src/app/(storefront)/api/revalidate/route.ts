import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * Triggers a Vercel redeploy via deploy hook. This is called from the admin
 * panel's "Publish changes" button. The entire site rebuilds with fresh data
 * from Supabase in ~60 seconds.
 *
 * Set VERCEL_DEPLOY_HOOK in your env vars to enable this.
 * Get the hook URL from: Vercel Dashboard → Project → Settings → Git → Deploy Hooks
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { secret } = body;

    // Auth check
    const expectedSecret = process.env.SUPABASE_SERVICE_ROLE_KEY?.slice(-12) || "revalidate";
    if (secret !== expectedSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
    }

    const deployHook = process.env.VERCEL_DEPLOY_HOOK;

    if (!deployHook) {
      return NextResponse.json({
        revalidated: false,
        message: "VERCEL_DEPLOY_HOOK not configured. Changes will appear after next git push.",
      });
    }

    // Trigger Vercel rebuild
    const response = await fetch(deployHook, { method: "POST" });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Deploy hook failed", status: response.status },
        { status: 500 },
      );
    }

    return NextResponse.json({
      revalidated: true,
      message: "Deploy triggered. Changes will be live in ~60 seconds.",
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to trigger deploy" }, { status: 500 });
  }
}
