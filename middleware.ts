import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/auth/login", "/auth/register"];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isPublicRoute = publicRoutes.includes(path);
  const token = request.cookies.get("bantay-access-tk")?.value;

  if (!isPublicRoute && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.nextUrl));
  }
  if (isPublicRoute && token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (!isPublicRoute && token) {
    try {
      const verificationResponse = await fetch(new URL("/api", request.url), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const { valid } = await verificationResponse.json();

      if (!valid) {
        throw new Error("Invalid token");
      }
    } catch (error) {
      const response = NextResponse.redirect(
        new URL("/auth/login", request.url)
      );
      response.cookies.delete("bantay-access-tk");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets|api).*)"],
};
