'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorkout } from '@/app/workouts/create/actions';

export default function CreateWorkoutClient() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    try {
      await createWorkout(formData);
    } catch (error) {
      setIsSubmitting(false);
      console.error('Error creating workout:', error);
      // TODO: Show error toast
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Workout</CardTitle>
          <CardDescription>
            Start a new workout session by giving it a name
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="workoutName">Workout Name</Label>
              <Input
                id="workoutName"
                name="workoutName"
                type="text"
                placeholder="e.g., Upper Body Push Day"
                required
                disabled={isSubmitting}
                autoFocus
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Workout'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => window.history.back()}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
