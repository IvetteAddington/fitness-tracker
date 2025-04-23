import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  IStorage,
  type InsertUser, type User,
  type InsertWorkoutPlan, type WorkoutPlan,
  type InsertWorkout, type Workout,
  type InsertExercise, type Exercise,
  type InsertUserProgress, type UserProgress
} from "./storage";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../data/fitness.db");
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS workout_plans (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    total_days INTEGER,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS workouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_plan_id INTEGER NOT NULL,
    day INTEGER NOT NULL,
    name TEXT NOT NULL,
    notes TEXT,
    is_completed BOOLEAN DEFAULT 0,
    completed_at TEXT,
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id)
  );

  CREATE TABLE IF NOT EXISTS exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    workout_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    sets INTEGER,
    reps TEXT,
    notes TEXT,
    is_completed BOOLEAN DEFAULT 0,
    is_superset BOOLEAN DEFAULT 0,
    superset_with TEXT,
    FOREIGN KEY (workout_id) REFERENCES workouts(id)
  );

  CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    workout_plan_id INTEGER NOT NULL,
    current_day INTEGER,
    completed_days INTEGER,
    current_streak INTEGER,
    longest_streak INTEGER,
    last_completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (workout_plan_id) REFERENCES workout_plans(id)
  );
`);

export class SqliteStorage implements IStorage {
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    console.log("🔍 using SqliteStorage");
    return db.prepare(`SELECT * FROM workout_plans`).all();
  }

  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const stmt = db.prepare(`
      INSERT INTO workout_plans (name, total_days, created_at)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(plan.name, plan.totalDays, new Date().toISOString());
    return { id: result.lastInsertRowid, ...plan, createdAt: new Date() };
  }

  async getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined> {
    return db.prepare(`SELECT * FROM workout_plans WHERE id = ?`).get(id);
  }

  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const stmt = db.prepare(`
      INSERT INTO workouts (workout_plan_id, day, name, notes, is_completed, completed_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      workout.workoutPlanId,
      workout.day,
      workout.name,
      workout.notes,
      workout.isCompleted || 0,
      workout.isCompleted ? new Date().toISOString() : null
    );
    return { id: result.lastInsertRowid, ...workout };
  }

  async getWorkout(id: number): Promise<Workout | undefined> {
    return db.prepare(`SELECT * FROM workouts WHERE id = ?`).get(id);
  }

  async getWorkoutsByPlanId(planId: number): Promise<Workout[]> {
    return db.prepare(`
      SELECT * FROM workouts WHERE workout_plan_id = ? ORDER BY day ASC
    `).all(planId);
  }

  async getWorkoutByPlanIdAndDay(planId: number, day: number): Promise<Workout | undefined> {
    return db.prepare(`
      SELECT * FROM workouts WHERE workout_plan_id = ? AND day = ?
    `).get(planId, day);
  }

  async updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const fields: string[] = [];
    const values: any[] = [];

    for (const [key, value] of Object.entries(workout)) {
      if (value === undefined) continue;
      fields.push(`${key} = ?`);
      if (typeof value === "boolean") {
        values.push(value ? 1 : 0);
      } else if (value instanceof Date) {
        values.push(value.toISOString());
      } else {
        values.push(value);
      }
    }

    if (fields.length === 0) return this.getWorkout(id);

    values.push(id);
    db.prepare(`UPDATE workouts SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return this.getWorkout(id);
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const stmt = db.prepare(`
      INSERT INTO exercises (workout_id, name, sets, reps, notes, is_completed, is_superset, superset_with)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      exercise.workoutId,
      exercise.name,
      exercise.sets,
      exercise.reps,
      exercise.notes || "",
      exercise.isCompleted || 0,
      exercise.isSuperset || 0,
      exercise.supersetWith || ""
    );
    return { id: result.lastInsertRowid, ...exercise };
  }

  async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    return db.prepare(`SELECT * FROM exercises WHERE workout_id = ?`).all(workoutId);
  }

  async updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(exercise)) {
      if (value === undefined) continue;
      fields.push(`${key} = ?`);

      if (typeof value === "boolean") {
        values.push(value ? 1 : 0);
      } else if (value instanceof Date) {
        values.push(value.toISOString());
      } else {
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return this.getExercise(id);
    }

    values.push(id);
    db.prepare(`UPDATE exercises SET ${fields.join(", ")} WHERE id = ?`).run(...values);

    return this.getExercise(id);
  }

  private getExercise(id: number): Exercise | undefined {
    return db.prepare(`SELECT * FROM exercises WHERE id = ?`).get(id);
  }

  async createUser(user: InsertUser): Promise<User> {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, created_at)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(user.username, user.email, new Date().toISOString());
    return { id: result.lastInsertRowid, ...user };
  }

  async getUser(id: number): Promise<User | undefined> {
    return db.prepare(`SELECT * FROM users WHERE id = ?`).get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return db.prepare(`SELECT * FROM users WHERE username = ?`).get(username);
  }

  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const stmt = db.prepare(`
      INSERT INTO user_progress (user_id, workout_plan_id, current_day, completed_days, current_streak, longest_streak, last_completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(
      progress.userId,
      progress.workoutPlanId,
      progress.currentDay || 1,
      progress.completedDays || 0,
      progress.currentStreak || 0,
      progress.longestStreak || 0,
      null
    );
    return { id: result.lastInsertRowid, ...progress };
  }

  async getUserProgressByPlanId(userId: number, planId: number): Promise<UserProgress | undefined> {
    return db.prepare(`
      SELECT * FROM user_progress WHERE user_id = ? AND workout_plan_id = ?
    `).get(userId, planId);
  }

  async updateUserProgress(id: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined> {
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(progress)) {
      fields.push(`${key} = ?`);
      values.push(value instanceof Date ? value.toISOString() : value);
    }
    values.push(id);
    db.prepare(`UPDATE user_progress SET ${fields.join(", ")} WHERE id = ?`).run(...values);
    return db.prepare(`SELECT * FROM user_progress WHERE id = ?`).get(id);
  }
}
