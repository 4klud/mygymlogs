"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { createWorkout } from '@/data/workouts';

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(100, 'Workout name must be 100 characters or less'),
  startedAt: z.date(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(data: CreateWorkoutInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const validated = createWorkoutSchema.parse(data);

    const workout = await createWorkout({
      userId,
      name: validated.name,
      startedAt: validated.startedAt,
    });

    revalidatePath('/dashboard');

    return {
      success: true,
      workout,
      redirectUrl: `/dashboard?date=${validated.startedAt.toISOString()}`
    };
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
