import { db } from '@/db';
import { workouts, workoutExercises, sets } from '@/db/schema';
import { eq, and, gte, lte, desc, asc } from 'drizzle-orm';
import type { Workout } from '@/types/workout';

/**
 * Get all workouts for a specific user on a specific date
 * @param userId - The authenticated user's ID
 * @param date - The date to filter workouts by
 * @returns Array of workouts with exercises and sets for the given date
 */
export async function getWorkoutsByDate(userId: string, date: Date): Promise<Workout[]> {
  // Set time to start of day (00:00:00) in UTC
  const startOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    0, 0, 0, 0
  ));

  // Set time to end of day (23:59:59.999) in UTC
  const endOfDay = new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    23, 59, 59, 999
  ));

  // 🚨 CRITICAL: Filter by userId AND date range
  const userWorkouts = await db.query.workouts.findMany({
    where: and(
      eq(workouts.userId, userId),
      gte(workouts.startedAt, startOfDay),
      lte(workouts.startedAt, endOfDay),
    ),
    orderBy: [desc(workouts.startedAt)],
    with: {
      exercises: {
        orderBy: [asc(workoutExercises.order)],
        with: {
          sets: {
            orderBy: [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  return userWorkouts as Workout[];
}

/**
 * Get a single workout by ID
 * @param workoutId - The workout ID
 * @param userId - The authenticated user's ID (for security)
 * @returns Workout if found and belongs to user, null otherwise
 */
export async function getWorkout(workoutId: string, userId: string) {
  // 🚨 CRITICAL: Filter by BOTH workoutId AND userId
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)
    ),
    with: {
      exercises: {
        orderBy: [asc(workoutExercises.order)],
        with: {
          sets: {
            orderBy: [asc(sets.setNumber)],
          },
        },
      },
    },
  });

  return workout ?? null;
}

/**
 * Get all workouts for a specific user
 * @param userId - The authenticated user's ID
 * @returns Array of workouts belonging to the user
 */
export async function getWorkouts(userId: string) {
  // 🚨 CRITICAL: Always filter by userId
  return await db.query.workouts.findMany({
    where: eq(workouts.userId, userId),
    orderBy: [desc(workouts.startedAt)],
    with: {
      exercises: {
        orderBy: [asc(workoutExercises.order)],
        with: {
          sets: {
            orderBy: [asc(sets.setNumber)],
          },
        },
      },
    },
  });
}
