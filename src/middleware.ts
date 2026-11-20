import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('auth_token')?.value;

    const isAuthPage = pathname.startsWith('/login');
    const isProtectedPage =
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/machines') ||
        pathname.startsWith('/reports') ||
        pathname === '/';

    const verified = token ? await verifyToken(token) : null;

    // Jika sudah terautentikasi dan membuka halaman login, arahkan ke /dashboard
    if (isAuthPage && verified) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Jika belum terautentikasi dan mencoba akses area privat, arahkan ke /login
    if (isProtectedPage && !verified) {
        const loginUrl = new URL('/login', request.url);
        if (pathname !== '/') {
            loginUrl.searchParams.set('callbackUrl', pathname);
        }
        return NextResponse.redirect(loginUrl);
    }

    // Jika sudah login dan mengakses root '/', arahkan ke /dashboard
    if (pathname === '/' && verified) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/dashboard/:path*',
        '/machines/:path*',
        '/reports/:path*',
    ],
};