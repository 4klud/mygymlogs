import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import CreateWorkoutClient from '@/components/create-workout-client';

export default async function CreateWorkoutPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  return <CreateWorkoutClient />;
}
