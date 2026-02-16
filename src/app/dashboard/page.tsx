"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"

// Mock workout data for UI demonstration
const mockWorkouts = [
  {
    id: 1,
    name: "Morning Chest & Triceps",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10 },
      { name: "Tricep Dips", sets: 3, reps: 12 },
    ],
    duration: "45 min",
    completedAt: "9:30 AM",
  },
  {
    id: 2,
    name: "Evening Cardio",
    exercises: [
      { name: "Treadmill Run", sets: 1, reps: null },
      { name: "Cycling", sets: 1, reps: null },
    ],
    duration: "30 min",
    completedAt: "6:00 PM",
  },
]

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Workout Dashboard</h1>
          <p className="text-muted-foreground">
            Track and review your daily workouts
          </p>
        </div>

        {/* Date Picker */}
        <div className="mb-8">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "do MMM yyyy")
                ) : (
                  <span>Pick a date</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Workouts Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">
              Workouts for {format(selectedDate, "do MMM yyyy")}
            </h2>
            <div className="text-sm text-muted-foreground">
              {mockWorkouts.length} {mockWorkouts.length === 1 ? "workout" : "workouts"}
            </div>
          </div>

          {/* Workout List */}
          {mockWorkouts.length > 0 ? (
            <div className="grid gap-4">
              {mockWorkouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{workout.name}</CardTitle>
                        <CardDescription>
                          Completed at {workout.completedAt} • {workout.duration}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground mb-3">
                        Exercises
                      </p>
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
                          >
                            <span className="font-medium">{exercise.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {exercise.sets} sets
                              {exercise.reps && ` × ${exercise.reps} reps`}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">No workouts logged for this date</p>
                  <p className="text-sm">
                    Select a different date or log a new workout
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
