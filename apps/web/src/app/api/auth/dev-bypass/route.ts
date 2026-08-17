import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const email = searchParams.get('email');
  const secret = searchParams.get('secret');

  // Removed production block to allow testing on Vercel
  // Make sure your DEV_BYPASS_SECRET is strong!

  if (secret !== process.env.DEV_BYPASS_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
  }

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  // Use the service role key to generate the magic link
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data?.properties?.action_link) {
    // Redirect the user directly to the magic link URL
    // This will hit the callback route, exchange the token, and log them in!
    return NextResponse.redirect(data.properties.action_link);
  }

  return NextResponse.json({ error: 'Failed to generate link' }, { status: 500 });
}
