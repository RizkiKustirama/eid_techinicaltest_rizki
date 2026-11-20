import { NextResponse } from 'next/server';
import { authService } from '@/services/auth.service';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    const { token, user } = await authService.login(email, password);

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      data: { user },
    });

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // Berlaku 1 hari (detik)
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Terjadi kesalahan pada server.',
      },
      { status: 400 }
    );
  }
}