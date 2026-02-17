# Routing Standards

This document defines the **MANDATORY** routing standards for this application.

## ⚠️ CRITICAL RULES

All routing decisions in this application **MUST** follow these standards. No exceptions.

---

## 1. Route Structure

### All App Routes Live Under `/dashboard`

**Every application route MUST be nested under `/dashboard`.**

```
/dashboard                          ✅ Dashboard home
/dashboard/workout/new              ✅ Create workout
/dashboard/workout/[workoutId]      ✅ Edit workout
```

**❌ DO NOT create top-level application routes:**

```
/workouts         ❌ WRONG
/profile          ❌ WRONG
/settings         ❌ WRONG
```

### Public Routes

Only the following routes are public (accessible without authentication):

- `/` — Landing/home page
- `/sign-in` and `/sign-in/(.*)` — Clerk sign-in
- `/sign-up` and `/sign-up/(.*)` — Clerk sign-up

Everything else — including all `/dashboard` routes — **requires authentication**.

---

## 2. Route Protection via Middleware

**ALL route protection MUST be implemented in `src/middleware.ts` using Clerk's `clerkMiddleware`.**

Do **not** rely solely on per-page auth checks as the primary protection mechanism.

### Middleware Setup

```typescript
// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
]);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

### Rules

- ✅ **DO**: Define public routes explicitly in `createRouteMatcher`
- ✅ **DO**: Call `auth().protect()` for all non-public routes
- ❌ **DO NOT**: Protect routes only at the page/component level
- ❌ **DO NOT**: Use custom session/cookie logic — Clerk handles this

---

## 3. File System Conventions

Follow Next.js App Router conventions. All routes are file-system based under `src/app/`.

```
src/app/
  page.tsx                                    → /           (public)
  sign-in/[[...sign-in]]/page.tsx             → /sign-in    (public)
  sign-up/[[...sign-up]]/page.tsx             → /sign-up    (public)
  dashboard/
    page.tsx                                  → /dashboard
    workout/
      new/
        page.tsx                              → /dashboard/workout/new
      [workoutId]/
        page.tsx                              → /dashboard/workout/[workoutId]
```

### Dynamic Segments

Use Next.js dynamic segments for resource IDs:

```
[workoutId]     → single dynamic segment
[[...slug]]     → optional catch-all (used for Clerk auth pages)
```

---

## 4. Navigation

### Linking Between Routes

Use Next.js `<Link>` for all internal navigation:

```tsx
import Link from 'next/link';

// ✅ CORRECT
<Link href="/dashboard">Dashboard</Link>
<Link href="/dashboard/workout/new">New Workout</Link>
<Link href={`/dashboard/workout/${workout.id}`}>Edit</Link>
```

```tsx
// ❌ WRONG: plain anchor tags for internal links
<a href="/dashboard">Dashboard</a>
```

### Programmatic Navigation

For client-side redirects after mutations (e.g., form submissions), use `window.location.href` as per the data-mutations standards:

```typescript
// ✅ CORRECT: client-side redirect after server action
if (result.success && result.redirectUrl) {
  window.location.href = result.redirectUrl;
}
```

For server-side redirects (e.g., unauthenticated users in Server Components), use Next.js `redirect()`:

```typescript
import { redirect } from 'next/navigation';

// ✅ CORRECT: server-side redirect for unauthenticated users
if (!userId) {
  redirect('/');
}
```

---

## 5. Key Principles Summary

1. **All app routes under `/dashboard`** — no top-level application routes
2. **Middleware is the primary protection layer** — use `clerkMiddleware` in `src/middleware.ts`
3. **Public routes are explicitly listed** — everything else is protected by default
4. **Use `<Link>` for navigation** — not plain `<a>` tags
5. **Client-side redirects after mutations** — server-side `redirect()` only for auth guards in Server Components

---

## ❌ Common Mistakes to Avoid

1. Creating routes outside of `/dashboard` (e.g., `/workouts`, `/exercises`)
2. Relying only on page-level `auth()` checks without middleware protection
3. Using `<a href>` instead of `<Link>` for internal navigation
4. Using `redirect()` inside server actions (use client-side redirects instead — see `data-mutations.md`)

---

**Remember: These standards are MANDATORY. All routing must follow this pattern.**
