# Authentication

## Rule: Clerk Only

All authentication in this app **must** use [Clerk](https://clerk.com/). Do not implement custom auth, use NextAuth, or reach for any other authentication library.

This is a hard rule with no exceptions.

## Rule: Get the User ID from `auth()` on the Server

To identify the current user in a Server Component or data helper, always call `auth()` from `@clerk/nextjs/server`. Never read a user ID from a cookie, query parameter, request body, or any client-supplied source.

```tsx
// app/dashboard/page.tsx (Server Component)
import { auth } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const { userId } = await auth();
  // pass userId to /data helpers
}
```

## Rule: Protect Routes via Middleware

Route protection is handled globally by `clerkMiddleware()` in `src/proxy.ts`. Do not add per-route auth guards inside page files — rely on the middleware matcher to decide which routes require authentication.

```ts
// src/proxy.ts
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware();
```

To make a route public, configure the middleware — do not skip the `auth()` call inside the page.

## Rule: UI Auth Components from `@clerk/nextjs`

Use Clerk's pre-built components for all sign-in, sign-up, and user management UI. Do not build custom auth forms.

| Use case | Component |
|---|---|
| Sign-in button | `<SignInButton mode="modal" />` |
| Sign-up button | `<SignUpButton mode="modal" />` |
| User avatar / account menu | `<UserButton />` |
| Conditional rendering by auth state | `<Show when="signed-in">` / `<Show when="signed-out">` |

These components are already wired up in `src/app/layout.tsx` inside `<ClerkProvider>`.

## Rule: Wrap the App in `<ClerkProvider>`

The root layout must wrap all children in `<ClerkProvider>`. This is already done in `src/app/layout.tsx` — do not move or remove it.

## What is not allowed

| Pattern | Instead |
|---|---|
| Custom sign-in/sign-up forms | `<SignInButton>` / `<SignUpButton>` from `@clerk/nextjs` |
| Reading `userId` from query params or cookies | `auth()` from `@clerk/nextjs/server` |
| NextAuth, Lucia, Auth.js, or any other auth library | Clerk |
| Per-page route guards | Middleware via `clerkMiddleware()` |
| Storing passwords or session tokens manually | Clerk manages sessions entirely |
