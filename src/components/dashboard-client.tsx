"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format, differenceInMinutes } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { getWorkoutsForDate } from "@/app/dashboard/actions"
import type { Workout } from "@/types/workout"

interface DashboardClientProps {
  initialWorkouts: Workout[]
  initialDateString: string
}

export default function DashboardClient({ initialWorkouts, initialDateString }: DashboardClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(initialDateString))
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts)
  const [isLoading, setIsLoading] = useState(false)

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return

    setSelectedDate(date)

    // Update URL with selected date
    const dateString = format(date, 'yyyy-MM-dd')
    router.push(`/dashboard?date=${dateString}`, { scroll: false })
  }

  useEffect(() => {
    async function fetchWorkouts() {
      setIsLoading(true)
      try {
        // Normalize to midnight UTC to avoid timezone issues during serialization
        const normalizedDate = new Date(Date.UTC(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        ))
        const data = await getWorkoutsForDate(normalizedDate.toISOString())
        setWorkouts(data)
      } catch (error) {
        console.error('Failed to fetch workouts:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkouts()
  }, [selectedDate])

  const calculateDuration = (startedAt: Date, completedAt: Date | null) => {
    if (!completedAt) return 'In progress'
    const minutes = differenceInMinutes(completedAt, startedAt)
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }

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
        <div className="mb-8" suppressHydrationWarning>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full sm:w-auto justify-start text-left font-normal"
                suppressHydrationWarning
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
                onSelect={handleDateSelect}
                autoFocus
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
              {isLoading ? (
                "Loading..."
              ) : (
                <>
                  {workouts.length} {workouts.length === 1 ? "workout" : "workouts"}
                </>
              )}
            </div>
          </div>

          {/* Workout List */}
          {isLoading ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">Loading workouts...</p>
                </div>
              </CardContent>
            </Card>
          ) : workouts.length > 0 ? (
            <div className="grid gap-4">
              {workouts.map((workout) => {
                const duration = calculateDuration(workout.startedAt, workout.completedAt)
                const completedTime = workout.completedAt
                  ? format(workout.completedAt, "h:mm a")
                  : "In progress"

                return (
                  <Card key={workout.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-xl">{workout.name}</CardTitle>
                          <CardDescription>
                            Completed at {completedTime} • {duration}
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
                          {workout.exercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-md"
                            >
                              <span className="font-medium">{exercise.exerciseName}</span>
                              <span className="text-sm text-muted-foreground">
                                {exercise.sets.length} {exercise.sets.length === 1 ? "set" : "sets"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
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
