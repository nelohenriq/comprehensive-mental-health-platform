import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Check if there's a session
    const session = await getServerSession(authOptions);

    // Get the base URL from the request
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;

    // Create response that redirects to signin using the correct base URL
    const signinUrl = `${baseUrl}/auth/signin`;
    const response = NextResponse.redirect(signinUrl);

    // Clear the session cookie regardless of whether there was a session
    response.cookies.set('next-auth.session-token', '', {
      expires: new Date(0),
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // Also clear the callback URL cookie if it exists
    response.cookies.set('next-auth.callback-url', '', {
      expires: new Date(0),
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error during signout:', error);
    // Even on error, redirect to signin using the correct base URL
    const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin;
    const signinUrl = `${baseUrl}/auth/signin`;
    return NextResponse.redirect(signinUrl);
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}