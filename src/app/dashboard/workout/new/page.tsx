import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import WorkoutForm from './workout-form';

export default async function NewWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Create New Workout</h1>
        <p className="text-muted-foreground mt-2">
          Start a new workout session by entering the details below.
        </p>
      </div>
      <WorkoutForm />
    </div>
  );
}
