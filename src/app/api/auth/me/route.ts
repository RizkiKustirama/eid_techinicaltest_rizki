import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';
import { authService } from '@/services/auth.service';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Tidak terautentikasi.' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, message: 'Token tidak valid atau kedaluwarsa.' },
        { status: 401 }
      );
    }

    const user = await authService.getCurrentUser(payload.userId);

    return NextResponse.json({
      success: true,
      data: { user },
    });
  } catch {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan autentikasi.' },
      { status: 401 }
    );
  }
}