# Routing Standards

## Route Structure

All application routes must live under `/dashboard`. There are no top-level feature routes — everything is a sub-route of `/dashboard`.

```
/dashboard              → main dashboard page
/dashboard/[feature]    → feature sub-pages
```

## Route Protection

All `/dashboard` routes are protected and require the user to be authenticated.

Protection is implemented via **Next.js Middleware** (`middleware.ts` at the project root), not inside individual page components or layouts.

```ts
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
```

## Rules

- **Never** use `auth()` checks or redirect logic inside `page.tsx` or `layout.tsx` to guard routes — middleware handles this.
- **Never** create feature routes outside of `/dashboard`. If a new feature needs a page, it goes under `/dashboard/[feature]`.
- Public routes (landing page, sign-in, sign-up) must **not** be added to `isProtectedRoute`.
- The middleware matcher must exclude static assets (`_next`, file extensions) to avoid intercepting them.

## Adding a New Protected Route

1. Create the page at `src/app/dashboard/[your-feature]/page.tsx`.
2. No additional auth configuration is needed — the middleware already protects all `/dashboard/*` routes.
