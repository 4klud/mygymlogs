'use server';

import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export async function createWorkout(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const workoutName = formData.get('workoutName') as string;

  if (!workoutName || workoutName.trim() === '') {
    throw new Error('Workout name is required');
  }

  // For now, we'll create a simple workout object
  // In a real app, this would save to a database
  const workout = {
    id: crypto.randomUUID(),
    name: workoutName.trim(),
    userId,
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    exercises: [],
  };

  // TODO: Save to database using Drizzle ORM
  console.log('Creating workout:', workout);

  // Redirect to the workout page (to be created later)
  redirect(`/workouts/${workout.id}`);
}
