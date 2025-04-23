import { 
  users, type User, type InsertUser,
  workoutPlans, type WorkoutPlan, type InsertWorkoutPlan,
  workouts, type Workout, type InsertWorkout,
  exercises, type Exercise, type InsertExercise,
  userProgress, type UserProgress, type InsertUserProgress
} from "@shared/schema";
import { SqliteStorage } from "./sqliteStorage";


export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workout plan operations
  createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan>;
  getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined>;
  getWorkoutPlans(): Promise<WorkoutPlan[]>;
  
  // Workout operations
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkout(id: number): Promise<Workout | undefined>;
  getWorkoutsByPlanId(planId: number): Promise<Workout[]>;
  getWorkoutByPlanIdAndDay(planId: number, day: number): Promise<Workout | undefined>;
  updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined>;
  
  // Exercise operations
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]>;
  updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined>;
  
  // Progress operations
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  getUserProgressByPlanId(userId: number, planId: number): Promise<UserProgress | undefined>;
  updateUserProgress(id: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workoutPlans: Map<number, WorkoutPlan>;
  private workouts: Map<number, Workout>;
  private exercises: Map<number, Exercise>;
  private userProgress: Map<number, UserProgress>;
  
  private userId = 1;
  private planId = 1;
  private workoutId = 1;
  private exerciseId = 1;
  private progressId = 1;

  constructor() {
    this.users = new Map();
    this.workoutPlans = new Map();
    this.workouts = new Map();
    this.exercises = new Map();
    this.userProgress = new Map();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Workout plan operations
  async createWorkoutPlan(plan: InsertWorkoutPlan): Promise<WorkoutPlan> {
    const id = this.planId++;
    const createdAt = new Date();
    const workoutPlan: WorkoutPlan = { ...plan, id, createdAt };
    this.workoutPlans.set(id, workoutPlan);
    return workoutPlan;
  }
  
  async getWorkoutPlan(id: number): Promise<WorkoutPlan | undefined> {
    return this.workoutPlans.get(id);
  }
  
  async getWorkoutPlans(): Promise<WorkoutPlan[]> {
    return Array.from(this.workoutPlans.values());
  }
  
  // Workout operations
  async createWorkout(workout: InsertWorkout): Promise<Workout> {
    const id = this.workoutId++;
    const newWorkout: Workout = { 
      ...workout, 
      id, 
      isCompleted: workout.isCompleted || false,
      completedAt: workout.isCompleted ? new Date() : null
    };
    this.workouts.set(id, newWorkout);
    return newWorkout;
  }
  
  async getWorkout(id: number): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }
  
  async getWorkoutsByPlanId(planId: number): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.workoutPlanId === planId)
      .sort((a, b) => a.day - b.day);
  }
  
  async getWorkoutByPlanIdAndDay(planId: number, day: number): Promise<Workout | undefined> {
    return Array.from(this.workouts.values())
      .find(workout => workout.workoutPlanId === planId && workout.day === day);
  }
  
  async updateWorkout(id: number, workout: Partial<InsertWorkout>): Promise<Workout | undefined> {
    const existingWorkout = this.workouts.get(id);
    if (!existingWorkout) return undefined;
    
    // Update completedAt if isCompleted is being set to true
    let completedAt = existingWorkout.completedAt;
    if (workout.isCompleted === true && !existingWorkout.isCompleted) {
      completedAt = new Date();
    }
    
    const updatedWorkout = { 
      ...existingWorkout, 
      ...workout,
      completedAt
    };
    
    this.workouts.set(id, updatedWorkout);
    return updatedWorkout;
  }
  
  // Exercise operations
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseId++;
    const newExercise: Exercise = { 
      ...exercise, 
      id, 
      isCompleted: exercise.isCompleted || false 
    };
    this.exercises.set(id, newExercise);
    return newExercise;
  }
  
  async getExercisesByWorkoutId(workoutId: number): Promise<Exercise[]> {
    return Array.from(this.exercises.values())
      .filter(exercise => exercise.workoutId === workoutId);
  }
  
  async updateExercise(id: number, exercise: Partial<InsertExercise>): Promise<Exercise | undefined> {
    const existingExercise = this.exercises.get(id);
    if (!existingExercise) return undefined;
    
    const updatedExercise = { ...existingExercise, ...exercise };
    this.exercises.set(id, updatedExercise);
    return updatedExercise;
  }
  
  // Progress operations
  async createUserProgress(progress: InsertUserProgress): Promise<UserProgress> {
    const id = this.progressId++;
    const newProgress: UserProgress = { 
      ...progress, 
      id, 
      currentDay: progress.currentDay || 1,
      completedDays: progress.completedDays || 0,
      currentStreak: progress.currentStreak || 0,
      longestStreak: progress.longestStreak || 0,
      lastCompletedAt: null
    };
    this.userProgress.set(id, newProgress);
    return newProgress;
  }
  
  async getUserProgressByPlanId(userId: number, planId: number): Promise<UserProgress | undefined> {
    return Array.from(this.userProgress.values())
      .find(progress => progress.userId === userId && progress.workoutPlanId === planId);
  }
  
  async updateUserProgress(id: number, progress: Partial<InsertUserProgress>): Promise<UserProgress | undefined> {
    const existingProgress = this.userProgress.get(id);
    if (!existingProgress) return undefined;
    
    // Update lastCompletedAt if completedDays is increasing
    let lastCompletedAt = existingProgress.lastCompletedAt;
    if (progress.completedDays !== undefined && 
        progress.completedDays > existingProgress.completedDays) {
      lastCompletedAt = new Date();
    }
    
    // Update longestStreak if currentStreak is greater
    let longestStreak = existingProgress.longestStreak;
    if (progress.currentStreak !== undefined && 
        progress.currentStreak > existingProgress.longestStreak) {
      longestStreak = progress.currentStreak;
    }
    
    const updatedProgress = { 
      ...existingProgress, 
      ...progress,
      lastCompletedAt,
      longestStreak
    };
    
    this.userProgress.set(id, updatedProgress);
    return updatedProgress;
  }
}

export const storage = new SqliteStorage();




