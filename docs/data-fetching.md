# Data Fetching Standards

## ⚠️ CRITICAL RULES

### 1. Server Components ONLY

**ALL data fetching MUST be done via Server Components.**

❌ **NEVER fetch data via:**
- Route handlers (`app/api/*`)
- Client components (`'use client'`)
- Client-side fetch/axios calls
- Any other method

✅ **ALWAYS fetch data in:**
- Server Components (default in App Router)
- Server Actions (for mutations)

### 2. Database Queries via Helper Functions

**ALL database queries MUST:**
- Be placed in helper functions within the `/data` directory
- Use Drizzle ORM exclusively
- **NEVER use raw SQL queries**

### 3. User Data Isolation

**🚨 CRITICAL SECURITY REQUIREMENT:**

Every data helper function MUST enforce user data isolation:
- A logged-in user can ONLY access their own data
- Users MUST NOT be able to access any other user's data
- All queries MUST include a user ID filter

## Implementation Guidelines

### Server Component Data Fetching

```tsx
// ✅ CORRECT: Server Component with data fetching
import { getWorkouts } from '@/data/workouts';
import { auth } from '@/lib/auth'; // or your auth solution

export default async function WorkoutsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const workouts = await getWorkouts(session.user.id);

  return (
    <div>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  );
}
```

```tsx
// ❌ WRONG: Client component with data fetching
'use client';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch('/api/workouts') // NEVER DO THIS
      .then(r => r.json())
      .then(setWorkouts);
  }, []);

  return <div>...</div>;
}
```

### Data Helper Functions

All helper functions should be organized in `/data` directory:

```
data/
  workouts.ts
  exercises.ts
  sets.ts
  users.ts
```

#### Example Helper Function

```typescript
// data/workouts.ts
import { db } from '@/lib/db';
import { workouts } from '@/lib/schema';
import { eq } from 'drizzle-orm';

/**
 * Get all workouts for a specific user
 * @param userId - The authenticated user's ID
 * @returns Array of workouts belonging to the user
 */
export async function getWorkouts(userId: string) {
  // 🚨 CRITICAL: Always filter by userId
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}

/**
 * Get a single workout by ID
 * @param workoutId - The workout ID
 * @param userId - The authenticated user's ID (for security)
 * @returns Workout if found and belongs to user, null otherwise
 */
export async function getWorkout(workoutId: string, userId: string) {
  const [workout] = await db
    .select()
    .from(workouts)
    .where(
      // 🚨 CRITICAL: Filter by BOTH workoutId AND userId
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      )
    );

  return workout ?? null;
}

// ❌ WRONG: No user ID filter
export async function getAllWorkouts() {
  return await db.select().from(workouts); // DANGEROUS!
}
```

### Data Mutations with Server Actions

For creating, updating, or deleting data, use Server Actions:

```typescript
// app/workouts/actions.ts
'use server';

import { db } from '@/lib/db';
import { workouts } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;

  await db.insert(workouts).values({
    name,
    userId: session.user.id, // 🚨 CRITICAL: Always set userId
  });

  revalidatePath('/workouts');
}

export async function deleteWorkout(workoutId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  // 🚨 CRITICAL: Filter by BOTH workoutId AND userId
  await db
    .delete(workouts)
    .where(
      and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, session.user.id)
      )
    );

  revalidatePath('/workouts');
}
```

## Security Checklist

Before committing any data fetching code, verify:

- [ ] Data is fetched in a Server Component or Server Action
- [ ] Database query uses a helper function from `/data` directory
- [ ] Helper function uses Drizzle ORM (no raw SQL)
- [ ] Query includes userId filter
- [ ] User authentication is checked before fetching data
- [ ] No route handlers are used for data fetching
- [ ] No client-side fetch/axios calls are present

## Common Patterns

### Pattern: List View with Details

```tsx
// app/workouts/page.tsx (Server Component)
import { getWorkouts } from '@/data/workouts';
import { auth } from '@/lib/auth';

export default async function WorkoutsPage() {
  const session = await auth();
  const workouts = await getWorkouts(session.user.id);

  return <WorkoutList workouts={workouts} />;
}

// app/workouts/[id]/page.tsx (Server Component)
import { getWorkout } from '@/data/workouts';
import { auth } from '@/lib/auth';
import { notFound } from 'next/navigation';

export default async function WorkoutDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const workout = await getWorkout(id, session.user.id);

  if (!workout) {
    notFound();
  }

  return <WorkoutDetails workout={workout} />;
}
```

### Pattern: Real-time Updates

For interactive UI that needs to update, use Server Actions with revalidation:

```tsx
// components/workout-form.tsx (Client Component)
'use client';

import { createWorkout } from '@/app/workouts/actions';

export function WorkoutForm() {
  return (
    <form action={createWorkout}>
      <input name="name" required />
      <button type="submit">Create Workout</button>
    </form>
  );
}
```

## Why These Rules?

1. **Server Components**: Better performance, security, and SEO
2. **Helper Functions**: Centralized logic, easier testing, reusability
3. **Drizzle ORM**: Type safety, SQL injection prevention, maintainability
4. **User Isolation**: Security, privacy, compliance with data protection laws

## Enforcement

Any PR that violates these rules will be rejected. No exceptions.
