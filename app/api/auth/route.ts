import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    
    if (!password) {
      return NextResponse.json(
        { success: false, error: 'Password is required' },
        { status: 400 }
      );
    }

    const appPassword = process.env.APP_PASSWORD;
    
    if (!appPassword) {
      console.error('APP_PASSWORD environment variable is not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (password === appPassword) {
      // Create response with authentication cookie
      const response = NextResponse.json({ success: true });
      
      // Set HTTP-only cookie for authentication
      response.cookies.set('app-authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Optional: Add logout functionality
export async function DELETE() {
  const response = NextResponse.json({ success: true });
  
  // Clear the authentication cookie
  response.cookies.delete('app-authenticated');
  
  return response;
}