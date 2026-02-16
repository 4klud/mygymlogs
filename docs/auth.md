# Authentication Standards

This document outlines the authentication standards and practices for this application.

## ⚠️ CRITICAL: Authentication Provider

**This application uses [Clerk](https://clerk.com) for authentication.**

All authentication-related code MUST use Clerk's SDK and follow Clerk's best practices.

## Installation

Clerk is installed via npm:

```bash
npm install @clerk/nextjs
```

## Core Principles

1. **Use Clerk exclusively** - Do not implement custom authentication logic
2. **Follow Clerk's Next.js App Router patterns** - Use server-side and client-side hooks as appropriate
3. **Leverage Clerk's built-in UI components** - Use `<SignIn>`, `<SignUp>`, `<UserButton>`, etc.
4. **Respect authentication boundaries** - Protect routes and API endpoints appropriately

## Environment Variables

Required environment variables (add to `.env.local`):

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Optional configuration:

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Setup

### Middleware Configuration

Create or update `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
])

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) {
    auth().protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
```

### Root Layout Wrapper

Wrap your app with `<ClerkProvider>` in `src/app/layout.tsx`:

```typescript
import { ClerkProvider } from '@clerk/nextjs'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

## Server-Side Authentication

### Server Components

Use `auth()` to get authentication state in Server Components:

```typescript
import { auth } from '@clerk/nextjs/server'

export default async function Page() {
  const { userId } = await auth()

  if (!userId) {
    // Handle unauthenticated state
    return <div>Please sign in</div>
  }

  // Use userId for data fetching
  return <div>Welcome, user {userId}</div>
}
```

### Getting User Information

Use `currentUser()` to get full user details:

```typescript
import { currentUser } from '@clerk/nextjs/server'

export default async function Page() {
  const user = await currentUser()

  if (!user) {
    return <div>Not signed in</div>
  }

  return (
    <div>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
      <p>Name: {user.firstName} {user.lastName}</p>
    </div>
  )
}
```

### Server Actions

Protect Server Actions with authentication:

```typescript
'use server'

import { auth } from '@clerk/nextjs/server'

export async function createWorkout(data: FormData) {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Proceed with authenticated logic
}
```

### API Routes

Protect API routes in `src/app/api`:

```typescript
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Return protected data
  return NextResponse.json({ data: 'Protected data' })
}
```

## Client-Side Authentication

### Client Components

Use Clerk hooks in Client Components:

```typescript
'use client'

import { useUser } from '@clerk/nextjs'

export default function ProfileComponent() {
  const { user, isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <div>Please sign in</div>
  }

  return <div>Hello, {user.firstName}</div>
}
```

### Auth State Hook

Use `useAuth()` for authentication state and session management:

```typescript
'use client'

import { useAuth } from '@clerk/nextjs'

export default function Component() {
  const { isLoaded, userId, sessionId, getToken } = useAuth()

  // Get custom JWT token for external API calls
  const token = await getToken()

  return <div>User ID: {userId}</div>
}
```

## UI Components

### Sign In / Sign Up Pages

Create dedicated auth pages using Clerk's pre-built components:

```typescript
// src/app/sign-in/[[...sign-in]]/page.tsx
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  )
}
```

```typescript
// src/app/sign-up/[[...sign-up]]/page.tsx
import { SignUp } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  )
}
```

### User Button

Use `<UserButton>` for user profile management:

```typescript
'use client'

import { UserButton } from '@clerk/nextjs'

export default function Header() {
  return (
    <header>
      <UserButton afterSignOutUrl="/" />
    </header>
  )
}
```

### Sign In Button

Use `<SignInButton>` for triggering sign in:

```typescript
'use client'

import { SignInButton } from '@clerk/nextjs'

export default function LandingPage() {
  return (
    <SignInButton mode="modal">
      <button>Sign In</button>
    </SignInButton>
  )
}
```

## Route Protection

### Public Routes

Routes that should be accessible without authentication:
- `/` - Landing page
- `/sign-in` - Sign in page
- `/sign-up` - Sign up page
- Public API routes

### Protected Routes

All other routes require authentication by default (configured in middleware).

For specific route protection in Server Components:

```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return <div>Protected content</div>
}
```

## Database Integration

### User ID Storage

- **Always use Clerk's `userId`** as the foreign key in your database
- Store `userId` as a string (e.g., `user_xxxxxx`)
- Do NOT store user emails or other PII as primary identifiers

Example schema:

```typescript
// Drizzle ORM example
export const workouts = pgTable('workouts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Clerk user ID
  name: text('name').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
})
```

### Webhooks for User Sync

For advanced use cases, set up Clerk webhooks to sync user data:

```typescript
// src/app/api/webhooks/clerk/route.ts
import { Webhook } from 'svix'
import { headers } from 'next/headers'

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    })
  } catch (err) {
    return new Response('Error', { status: 400 })
  }

  const eventType = evt.type

  if (eventType === 'user.created') {
    // Sync user to database
  }

  return new Response('Success', { status: 200 })
}
```

## Best Practices

### DO:
- ✅ Use `auth()` in Server Components and Server Actions
- ✅ Use `useAuth()` and `useUser()` in Client Components
- ✅ Store Clerk's `userId` in your database
- ✅ Use Clerk's pre-built UI components for consistency
- ✅ Protect API routes and Server Actions
- ✅ Handle loading and unauthenticated states gracefully

### DON'T:
- ❌ Implement custom JWT verification (Clerk handles this)
- ❌ Store passwords or sensitive auth data in your database
- ❌ Use client-side auth checks as the only protection (always validate server-side)
- ❌ Expose `CLERK_SECRET_KEY` in client-side code
- ❌ Skip middleware protection for sensitive routes

## Testing

For local development and testing:

1. Sign up for a free Clerk account at https://clerk.com
2. Create a new application in the Clerk dashboard
3. Copy the API keys to your `.env.local`
4. Use Clerk's test mode for development

## Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk Next.js Quickstart](https://clerk.com/docs/quickstarts/nextjs)
- [Clerk App Router Guide](https://clerk.com/docs/references/nextjs/overview)
