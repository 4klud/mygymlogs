import { auth } from '@clerk/nextjs/server';
import { redirect, notFound } from 'next/navigation';
import { getWorkout } from '@/data/workouts';
import EditWorkoutForm from './edit-workout-form';

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

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit Workout</h1>
        <p className="text-muted-foreground mt-2">
          Update the details for this workout session.
        </p>
      </div>
      <EditWorkoutForm
        workoutId={workout.id}
        defaultName={workout.name}
        defaultStartedAt={new Date(workout.startedAt)}
      />
    </div>
  );
}
