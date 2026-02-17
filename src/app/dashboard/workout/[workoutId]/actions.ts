"use server";

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { auth } from '@clerk/nextjs/server';
import { updateWorkout } from '@/data/workouts';

const updateWorkoutSchema = z.object({
  workoutId: z.string().min(1),
  name: z.string().min(1, 'Workout name is required').max(100, 'Workout name must be 100 characters or less'),
  startedAt: z.date(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(data: UpdateWorkoutInput) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return {
        success: false,
        error: 'Unauthorized'
      };
    }

    const validated = updateWorkoutSchema.parse(data);
    const { workoutId, ...updateData } = validated;

    const workout = await updateWorkout(workoutId, userId, updateData);

    if (!workout) {
      return {
        success: false,
        error: 'Workout not found'
      };
    }

    revalidatePath('/dashboard');
    revalidatePath(`/dashboard/workout/${workoutId}`);

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
    return { success: false, error: 'Failed to update workout' };
  }
}
