import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const workoutPlans = pgTable("workout_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  totalDays: integer("total_days").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkoutPlanSchema = createInsertSchema(workoutPlans).pick({
  name: true,
  totalDays: true,
  userId: true,
});

export type InsertWorkoutPlan = z.infer<typeof insertWorkoutPlanSchema>;
export type WorkoutPlan = typeof workoutPlans.$inferSelect;

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  day: integer("day").notNull(),
  name: text("name").notNull(),
  notes: text("notes"),
  workoutPlanId: integer("workout_plan_id").references(() => workoutPlans.id),
  isCompleted: boolean("is_completed").default(false),
  completedAt: timestamp("completed_at"),
});

export const insertWorkoutSchema = createInsertSchema(workouts).pick({
  day: true,
  name: true,
  notes: true,
  workoutPlanId: true,
  isCompleted: true,
});

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sets: integer("sets").notNull(),
  reps: text("reps").notNull(),
  notes: text("notes"),
  workoutId: integer("workout_id").references(() => workouts.id),
  isCompleted: boolean("is_completed").default(false),
});

export const insertExerciseSchema = createInsertSchema(exercises).pick({
  name: true,
  sets: true,
  reps: true,
  notes: true,
  workoutId: true,
  isCompleted: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  workoutPlanId: integer("workout_plan_id").references(() => workoutPlans.id),
  currentDay: integer("current_day").default(1),
  completedDays: integer("completed_days").default(0),
  currentStreak: integer("current_streak").default(0),
  longestStreak: integer("longest_streak").default(0),
  lastCompletedAt: timestamp("last_completed_at"),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).pick({
  userId: true,
  workoutPlanId: true,
  currentDay: true,
  completedDays: true,
  currentStreak: true,
  longestStreak: true,
});

export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;
export type UserProgress = typeof userProgress.$inferSelect;

// Schemas for direct file uploads (without DB)
export const workoutPlanFileSchema = z.object({
  name: z.string(),
  totalDays: z.number(),
  workouts: z.array(
    z.object({
      day: z.number(),
      name: z.string(),
      notes: z.string().optional(),
      exercises: z.array(
        z.object({
          name: z.string(),
          sets: z.number(),
          reps: z.string(),
          notes: z.string().optional(),
        })
      ),
    })
  ),
});

export type WorkoutPlanFile = z.infer<typeof workoutPlanFileSchema>;
