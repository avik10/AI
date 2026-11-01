import { NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = request.cookies.get('linkedin_oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.json({ error: 'Invalid OAuth callback' }, { status: 400 });
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

  const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    return NextResponse.json({ error: 'Failed to obtain access token' }, { status: 500 });
  }

  // Store token in HttpOnly cookie
  const response = NextResponse.redirect(new URL('/dashboard', request.url).toString());
  response.cookies.set('linkedin_access_token', tokenData.access_token, { httpOnly: true, path: '/' });

  // Optionally, associate with user in database (if user is logged in)
  // const user = await insforge.auth.getCurrentUser();
  // if (user?.data?.user) {
  //   await insforge.database.from('user_integrations').upsert([
  //     { id: `${user.data.user.id}_linkedin`, user_id: user.data.user.id, platform: 'linkedin', status: 'connected' }
  //   ]);
  // }

  return response;
}
