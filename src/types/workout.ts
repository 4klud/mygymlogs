export type WorkoutSet = {
  id: string
  setNumber: number
  reps: number
  weight: string | null
  createdAt: Date
}

export type WorkoutExercise = {
  id: string
  exerciseName: string
  order: number
  createdAt: Date
  sets: WorkoutSet[]
}

export type Workout = {
  id: string
  name: string
  startedAt: Date
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
  exercises: WorkoutExercise[]
}
