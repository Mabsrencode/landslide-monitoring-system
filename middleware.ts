import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

const publicRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const isPublicRoute = publicRoutes.includes(path);

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("bantay-access-tk")?.value;

  if (!isPublicRoute && !accessToken) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }

  if (isPublicRoute && accessToken) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  return NextResponse.next();
}
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
