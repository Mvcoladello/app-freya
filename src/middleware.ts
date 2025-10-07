import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')
  const isConsolePath = request.nextUrl.pathname.startsWith('/console')
  const isLoginPath = request.nextUrl.pathname === '/'

  if (isConsolePath && !token) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (isLoginPath && token) {
    return NextResponse.redirect(new URL('/console', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/console/:path*']
}
