# Data Mutations Standards

This document defines the **MANDATORY** standards for all data mutations in this application.

## ⚠️ CRITICAL RULES

All data mutations in this application **MUST** follow these standards. No exceptions.

---

## 1. Data Layer Architecture

### Database Access via Helper Functions

**All database operations MUST be wrapped in helper functions within the `src/data` directory.**

```typescript
// ✅ CORRECT: src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createWorkout(data: {
  userId: string;
  name: string;
  date: Date;
}) {
  const [workout] = await db
    .insert(workouts)
    .values(data)
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: string) {
  await db
    .delete(workouts)
    .where(eq(workouts.id, workoutId));
}

export async function updateWorkout(
  workoutId: string,
  data: { name?: string; date?: Date }
) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(eq(workouts.id, workoutId))
    .returning();

  return workout;
}
```

**❌ WRONG: Direct database calls in server actions or components**

```typescript
// ❌ NEVER do this in a server action
export async function createWorkoutAction(name: string) {
  await db.insert(workouts).values({ name }); // WRONG!
}
```

---

## 2. Server Actions

### Location and Naming

**All server actions MUST:**
- Be defined in files named `actions.ts`
- Be colocated with the components/routes that use them
- Use the `"use server"` directive

```typescript
// ✅ CORRECT: src/app/workouts/actions.ts
"use server";

import { createWorkout } from '@/data/workouts';

export async function createWorkoutAction(data: CreateWorkoutInput) {
  // Implementation here
}
```

**File structure:**
```
src/
  app/
    workouts/
      page.tsx
      actions.ts          ✅ Server actions for this route
    dashboard/
      page.tsx
      actions.ts          ✅ Server actions for this route
```

---

## 3. Parameter Typing

### Strongly Typed Parameters

**Server actions MUST:**
- Have explicitly typed parameters
- **NEVER** use `FormData` as a parameter type
- Use proper TypeScript interfaces or types

```typescript
// ✅ CORRECT: Typed parameters
export async function createWorkoutAction(data: {
  name: string;
  date: Date;
  exercises: string[];
}) {
  // Implementation
}

// ✅ CORRECT: Using a defined type
type CreateWorkoutInput = {
  name: string;
  date: Date;
  exercises: string[];
};

export async function createWorkoutAction(data: CreateWorkoutInput) {
  // Implementation
}
```

**❌ WRONG: FormData parameter**

```typescript
// ❌ NEVER do this
export async function createWorkoutAction(formData: FormData) {
  const name = formData.get('name'); // WRONG!
}
```

---

## 4. Validation with Zod

### Mandatory Validation

**ALL server actions MUST validate their arguments using Zod schemas.**

```typescript
// ✅ CORRECT: Complete validation pattern
"use server";

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date: z.date(),
  exercises: z.array(z.string()).min(1, 'At least one exercise required'),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(data: CreateWorkoutInput) {
  // Validate input
  const validated = createWorkoutSchema.parse(data);

  // Call data layer helper
  const workout = await createWorkout(validated);

  return { success: true, workout };
}
```

### Error Handling

**Handle validation errors appropriately:**

```typescript
// ✅ CORRECT: Error handling
export async function createWorkoutAction(data: CreateWorkoutInput) {
  try {
    const validated = createWorkoutSchema.parse(data);
    const workout = await createWorkout(validated);
    return { success: true, workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        issues: error.issues
      };
    }
    return { success: false, error: 'Failed to create workout' };
  }
}
```

---

## 5. Complete Example

### Full Pattern Implementation

```typescript
// src/data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function createWorkout(data: {
  userId: string;
  name: string;
  date: Date;
  notes?: string;
}) {
  const [workout] = await db
    .insert(workouts)
    .values(data)
    .returning();

  return workout;
}

export async function updateWorkout(
  workoutId: string,
  data: { name?: string; date?: Date; notes?: string }
) {
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(eq(workouts.id, workoutId))
    .returning();

  return workout;
}

export async function deleteWorkout(workoutId: string) {
  await db
    .delete(workouts)
    .where(eq(workouts.id, workoutId));
}
```

```typescript
// src/app/workouts/actions.ts
"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { createWorkout, updateWorkout, deleteWorkout } from '@/data/workouts';

// Validation schemas
const createWorkoutSchema = z.object({
  userId: z.string(),
  name: z.string().min(1).max(100),
  date: z.date(),
  notes: z.string().optional(),
});

const updateWorkoutSchema = z.object({
  workoutId: z.string(),
  name: z.string().min(1).max(100).optional(),
  date: z.date().optional(),
  notes: z.string().optional(),
});

const deleteWorkoutSchema = z.object({
  workoutId: z.string(),
});

// Inferred types
type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
type DeleteWorkoutInput = z.infer<typeof deleteWorkoutSchema>;

// Server actions
export async function createWorkoutAction(data: CreateWorkoutInput) {
  try {
    const validated = createWorkoutSchema.parse(data);
    const workout = await createWorkout(validated);

    revalidatePath('/workouts');
    return { success: true, workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        issues: error.issues
      };
    }
    return { success: false, error: 'Failed to create workout' };
  }
}

export async function updateWorkoutAction(data: UpdateWorkoutInput) {
  try {
    const validated = updateWorkoutSchema.parse(data);
    const { workoutId, ...updateData } = validated;
    const workout = await updateWorkout(workoutId, updateData);

    revalidatePath('/workouts');
    return { success: true, workout };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        issues: error.issues
      };
    }
    return { success: false, error: 'Failed to update workout' };
  }
}

export async function deleteWorkoutAction(data: DeleteWorkoutInput) {
  try {
    const validated = deleteWorkoutSchema.parse(data);
    await deleteWorkout(validated.workoutId);

    revalidatePath('/workouts');
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        issues: error.issues
      };
    }
    return { success: false, error: 'Failed to delete workout' };
  }
}
```

---

## 6. Navigation and Redirects

### Client-Side Redirects Only

**CRITICAL: Server actions MUST NOT use the `redirect()` function.**

Redirects should be handled client-side after the server action resolves.

```typescript
// ❌ WRONG: Server-side redirect
"use server";

import { redirect } from 'next/navigation';

export async function createItemAction(data: CreateItemInput) {
  const validated = schema.parse(data);
  const item = await createItem(validated);

  redirect('/dashboard'); // WRONG!
}
```

```typescript
// ✅ CORRECT: Return redirect URL, handle client-side
"use server";

import { revalidatePath } from 'next/cache';

export async function createItemAction(data: CreateItemInput) {
  try {
    const validated = schema.parse(data);
    const item = await createItem(validated);

    revalidatePath('/dashboard');

    return {
      success: true,
      item,
      redirectUrl: '/dashboard' // Return URL for client to handle
    };
  } catch (error) {
    // Handle errors
  }
}
```

```typescript
// ✅ CORRECT: Client-side redirect handling
"use client";

const onSubmit = async (data: FormData) => {
  const result = await createItemAction(data);

  if (result.success && result.redirectUrl) {
    window.location.href = result.redirectUrl; // Client-side redirect
  } else if (!result.success) {
    setError(result.error);
  }
};
```

**Why?**
- Server actions should return data, not control navigation
- Client-side redirects provide better error handling
- Separates concerns: server handles data, client handles UI/navigation
- Avoids confusion with error handling (redirect throws an error)

---

## 7. Key Principles Summary

1. **Data Layer Separation**: All database operations in `src/data` directory helpers
2. **Server Actions Location**: Colocated `actions.ts` files with `"use server"` directive
3. **Type Safety**: Explicitly typed parameters, NO FormData types
4. **Validation**: ALL inputs validated with Zod schemas
5. **Error Handling**: Proper try/catch with Zod error differentiation
6. **Cache Revalidation**: Use `revalidatePath()` or `revalidateTag()` after mutations
7. **Client-Side Redirects**: Return redirect URLs, never use `redirect()` in server actions

---

## ❌ Common Mistakes to Avoid

1. Direct database calls in server actions
2. Using FormData as parameter type
3. Missing Zod validation
4. Skipping error handling
5. Forgetting cache revalidation
6. Putting server actions in random files instead of `actions.ts`
7. Using `redirect()` function in server actions (use client-side redirects instead)

---

**Remember: These standards are MANDATORY. All data mutations must follow this pattern.**
