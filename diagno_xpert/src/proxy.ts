import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
  const token = await getToken({
    req: request,
    cookieName: "userLogin",
    secret: process.env.NEXTAUTH_SECRET
  })

  const path = request.nextUrl.pathname

  if (!token && (path === '/home' || path === '/doctors')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (token && (path === '/' || path === '/signin' || path === '/sign-up')) {
    if (token.role === 'doctor') {
      return NextResponse.redirect(new URL('/doctors', request.url))
    }
    return NextResponse.redirect(new URL('/home', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/signin', '/sign-up', '/home', '/doctors']
}
