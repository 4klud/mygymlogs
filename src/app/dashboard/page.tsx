import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getWorkoutsByDate } from '@/data/workouts';
import DashboardClient from '@/components/dashboard-client';

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/');
  }

  const params = await searchParams;

  // Parse date from query param or use today
  let targetDate: Date;
  if (params.date) {
    // Try to parse the date from query param
    const parsedDate = new Date(params.date);
    if (!isNaN(parsedDate.getTime())) {
      // Valid date - normalize to UTC midnight
      targetDate = new Date(Date.UTC(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      ));
    } else {
      // Invalid date - fall back to today
      const now = new Date();
      targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    }
  } else {
    // No date param - use today
    const now = new Date();
    targetDate = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  }

  const workouts = await getWorkoutsByDate(userId, targetDate);

  return <DashboardClient initialWorkouts={workouts} initialDateString={targetDate.toISOString()} />;
}
