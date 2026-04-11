# Supabase Auth in Next.js App Router

## What It Is

Supabase Auth provides user authentication (signup, login, OAuth) backed by PostgreSQL. In Next.js App Router, it uses the `@supabase/ssr` package for cookie-based session management.

## Why Cookies (Not localStorage)

In the Pages Router era, auth tokens were stored in localStorage. This doesn't work with App Router because:

- **Server Components** can't access localStorage (they run on the server)
- **Middleware** can't access localStorage (it runs on the edge)
- **SSR** needs the token before the page renders

Cookies solve all three — they're sent with every HTTP request automatically.

## Three Supabase Clients

### 1. Browser Client (`lib/supabase/client.js`)
- Used in Client Components (`"use client"`)
- Created with `createBrowserClient()` from `@supabase/ssr`
- Reads/writes cookies automatically
- Use for: real-time subscriptions, client-side data fetching, auth state listeners

### 2. Server Client (`lib/supabase/server.js`)
- Used in Server Components, Server Actions, Route Handlers
- Created with `createServerClient()` from `@supabase/ssr`
- Reads cookies via `next/headers`
- Use for: server-side data fetching, auth verification, mutations

### 3. Middleware Client (`lib/supabase/middleware.js`)
- Used in `middleware.js`
- Refreshes expired tokens before they reach routes
- Critical for keeping sessions alive
- Use for: route protection, token refresh

## Auth Patterns

### Server Action (Login/Signup)
```js
"use server";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (error) return { error: error.message };
  redirect("/dashboard");
}
```

### Reading User in Server Component
```js
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  // user is available, no hooks needed
}
```

### Reading User in Client Component
```js
"use client";
import { useAuth } from "@/features/auth/AuthProvider";

export default function Profile() {
  const { user, loading } = useAuth();
  if (loading) return <Skeleton />;
  return <p>{user.email}</p>;
}
```

## OAuth Flow (Google)

```
User clicks "Continue with Google"
  → Server action calls supabase.auth.signInWithOAuth({ provider: "google" })
  → Returns OAuth URL → redirect to Google consent screen
  → User approves → Google redirects to /auth/callback?code=xxx
  → Callback route exchanges code for session
  → Redirect to /dashboard
```

## Route Protection via Middleware

```
Request → middleware.js
  → Create Supabase client with request cookies
  → Call supabase.auth.getUser() (refreshes token if expired)
  → If no user + protected route → redirect to /login
  → If user + auth route → redirect to /dashboard
  → Otherwise → pass through
```

## Common Interview Questions

**Q: What's the difference between getSession() and getUser()?**
A: `getSession()` reads the JWT from cookies without verification — fast but can be spoofed. `getUser()` makes a round-trip to Supabase to verify the token is valid. Always use `getUser()` for security-critical operations.

**Q: Why do you need three different Supabase clients?**
A: Each runs in a different environment with different cookie access patterns. Browser clients use document.cookie, server clients use next/headers, and middleware clients need to both read and write cookies on the request/response pair.

**Q: How do you handle expired tokens?**
A: The middleware runs on every request and calls `getUser()`, which automatically refreshes expired tokens. The refreshed cookie is set on the response, keeping the session alive transparently.
