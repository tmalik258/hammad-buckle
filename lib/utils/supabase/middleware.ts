import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public routes that don't require authentication
  const publicRoutes = [
    "/",                    // Home page
    "/products",           // Products page
    "/categories",         // Categories page
    "/contact",            // Contact page
    "/auth",               // Authentication pages
    "/error",              // Error pages
    "/unauthorized",       // Unauthorized page
  ];

  // Define public API routes that don't require authentication
  const publicApiRoutes = [
    "/api/products",       // Product listings and details
    "/api/categories",     // Category listings
    "/api/reviews",        // Product reviews (read-only)
  ];

  // Define private routes that require authentication
  const privateRoutes = [
    "/my-account",         // User account management
    "/checkout",           // Checkout process
    "/cart",               // Shopping cart
    "/wishlist",           // User wishlist
    "/track-order",        // Order tracking
    "/order-confirmed",    // Order confirmation
    "/admin",              // Admin panel
  ];

  // Define private API routes that require authentication
  const privateApiRoutes = [
    "/api/cart",           // Cart operations
    "/api/orders",         // Order management
    "/api/users",          // User management
    "/api/addresses",      // User addresses
    "/api/wishlist",       // Wishlist operations
    "/api/variants",       // Product variants (admin)
  ];

  const pathname = request.nextUrl.pathname;

  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  const isPublicApiRoute = publicApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  const isPrivateRoute = privateRoutes.some(route => 
    pathname === route || pathname.startsWith(route + "/")
  );

  const isPrivateApiRoute = privateApiRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Define auth-only routes that should redirect authenticated users
  const authOnlyRoutes = ["/auth/login", "/auth/signup"];
  const isAuthOnlyRoute = authOnlyRoutes.includes(pathname);

  // If user is authenticated and trying to access auth-only routes (login/signup)
  if (user && isAuthOnlyRoute) {
    const url = request.nextUrl.clone();
    // Redirect to home page or dashboard based on user role
    const userRole = user.user_metadata?.role;
    url.pathname = userRole === 'admin' ? "/admin" : "/";
    return NextResponse.redirect(url);
  }

  // If user is not authenticated and trying to access private routes
  if (!user && (isPrivateRoute || isPrivateApiRoute)) {
    const redirectUrl = new URL("/auth/login", request.url);
    // Add the current path as 'next' parameter to redirect back after login
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Allow access to public routes and public API routes
  if (isPublicRoute || isPublicApiRoute) {
    return supabaseResponse;
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}
