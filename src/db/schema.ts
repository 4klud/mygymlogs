import { pgTable, text, timestamp, uuid, integer, decimal, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table - synced from Clerk
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Clerk user ID
  name: text('name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Workouts table - stores workout sessions
export const workouts = pgTable('workouts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id').notNull().references(() => users.id),
  name: text('name').notNull(), // e.g., "Chest Day", "Leg Day"
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'), // Null if workout is in progress
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('idx_workouts_user_id').on(table.userId),
  startedAtIdx: index('idx_workouts_started_at').on(table.startedAt.desc()),
}));

// Workout exercises table - stores exercises within a workout
export const workoutExercises = pgTable('workout_exercises', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutId: uuid('workout_id').notNull().references(() => workouts.id, { onDelete: 'cascade' }),
  exerciseName: text('exercise_name').notNull(), // e.g., "Bench Press", "Squat"
  order: integer('order').notNull(), // Order of exercise in workout
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workoutIdIdx: index('idx_workout_exercises_workout_id').on(table.workoutId),
  workoutOrderIdx: index('idx_workout_exercises_workout_order').on(table.workoutId, table.order),
}));

// Sets table - stores individual sets for each exercise
export const sets = pgTable('sets', {
  id: uuid('id').primaryKey().defaultRandom(),
  workoutExerciseId: uuid('workout_exercise_id').notNull().references(() => workoutExercises.id, { onDelete: 'cascade' }),
  setNumber: integer('set_number').notNull(), // 1, 2, 3, etc.
  reps: integer('reps').notNull(), // Number of repetitions
  weight: decimal('weight', { precision: 10, scale: 2 }), // Weight in kg or lbs
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  workoutExerciseIdIdx: index('idx_sets_workout_exercise_id').on(table.workoutExerciseId),
}));

// Relations for better type inference in queries
export const usersRelations = relations(users, ({ many }) => ({
  workouts: many(workouts),
}));

export const workoutsRelations = relations(workouts, ({ one, many }) => ({
  user: one(users, {
    fields: [workouts.userId],
    references: [users.id],
  }),
  exercises: many(workoutExercises),
}));

export const workoutExercisesRelations = relations(workoutExercises, ({ one, many }) => ({
  workout: one(workouts, {
    fields: [workoutExercises.workoutId],
    references: [workouts.id],
  }),
  sets: many(sets),
}));

export const setsRelations = relations(sets, ({ one }) => ({
  workoutExercise: one(workoutExercises, {
    fields: [sets.workoutExerciseId],
    references: [workoutExercises.id],
  }),
}));
