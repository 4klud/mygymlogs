# Server Components Standards

## ⚠️ CRITICAL RULES

### 1. `params` and `searchParams` MUST Be Awaited

**This is a Next.js 16 project. `params` and `searchParams` are Promises — they MUST be awaited before accessing their values.**

❌ **NEVER access params directly (will throw at runtime):**

```tsx
// ❌ WRONG: params is a Promise — destructuring without await will fail
export default async function WorkoutPage({
  params,
}: {
  params: { workoutId: string };
}) {
  const { workoutId } = params; // BROKEN — params is a Promise in Next.js 16
}
```

✅ **ALWAYS await params before destructuring:**

```tsx
// ✅ CORRECT: params typed as Promise and awaited
export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { workoutId } = await params;
}
```

The same rule applies to `searchParams`:

```tsx
// ✅ CORRECT: searchParams typed as Promise and awaited
export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
}
```

### 2. Always Type `params` and `searchParams` as Promises

The TypeScript type for route props must reflect that these are Promises:

```tsx
// ✅ CORRECT type signatures
type PageProps = {
  params: Promise<{ workoutId: string }>;
  searchParams: Promise<{ tab?: string; page?: string }>;
};
```

### 3. Server Components Are Async

All Server Components that access route data must be `async` functions so they can `await` params:

```tsx
// ✅ CORRECT
export default async function MyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  // ...
}
```

## Complete Example

```tsx
// app/dashboard/workout/[workoutId]/page.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getWorkout } from '@/data/workouts';

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ workoutId: string }>;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const { workoutId } = await params;
  const workout = await getWorkout(workoutId, userId);

  if (!workout) {
    notFound();
  }

  return <div>{workout.name}</div>;
}
```

## Checklist

Before committing any Server Component with dynamic route params, verify:

- [ ] `params` is typed as `Promise<{ ... }>`
- [ ] `searchParams` is typed as `Promise<{ ... }>` (if used)
- [ ] Both are awaited before any property is accessed
- [ ] The component function is `async`
