'use server';

import { auth } from '@clerk/nextjs/server';
import { getWorkoutsByDate } from '@/data/workouts';

export async function getWorkoutsForDate(dateString: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Convert the ISO string back to a Date object
  const date = new Date(dateString);

  return await getWorkoutsByDate(userId, date);
}
