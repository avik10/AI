import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI;
  const state = Math.random().toString(36).substring(2);
  const scope = encodeURIComponent('r_liteprofile r_emailaddress');
  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${scope}`;
  const response = NextResponse.redirect(authUrl);
  response.cookies.set('linkedin_oauth_state', state, { httpOnly: true, path: '/' });
  return response;
}
