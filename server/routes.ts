import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  workoutPlanFileSchema, 
  insertWorkoutPlanSchema,
  insertWorkoutSchema,
  insertExerciseSchema,
  insertUserProgressSchema
} from "@shared/schema";
import { z } from "zod";

// Create a default user for demo purposes
async function setupDefaultUser() {
  // Check if default user already exists
  const existingUser = await storage.getUserByUsername("default");
  if (existingUser) return existingUser;
  
  // Create default user
  return await storage.createUser({
    username: "default",
    password: "password" // In a real app, this would be hashed
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up default user
  const defaultUser = await setupDefaultUser();
  
  // Get all workout plans
  app.get("/api/workout-plans", async (req, res) => {
    const plans = await storage.getWorkoutPlans();
    res.json(plans);
  });
  
  // Get specific workout plan
  app.get("/api/workout-plans/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid workout plan ID" });
    }
    
    const plan = await storage.getWorkoutPlan(id);
    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }
    
    res.json(plan);
  });
  
  // Upload new workout plan
  app.post("/api/workout-plans", async (req, res) => {
    try {
      // Validate the workout plan data
      const workoutPlanData = workoutPlanFileSchema.parse(req.body);
      
      // Create workout plan
      const newPlan = await storage.createWorkoutPlan({
        name: workoutPlanData.name,
        totalDays: workoutPlanData.totalDays,
        userId: defaultUser.id
      });
      
      // Create workouts and exercises
      for (const workoutData of workoutPlanData.workouts) {
        const newWorkout = await storage.createWorkout({
          day: workoutData.day,
          name: workoutData.name,
          notes: workoutData.notes || "",
          workoutPlanId: newPlan.id,
          isCompleted: false
        });
        
        // Create exercises for this workout
        for (const exerciseData of workoutData.exercises) {
          await storage.createExercise({
            name: exerciseData.name,
            sets: exerciseData.sets,
            reps: exerciseData.reps,
            notes: exerciseData.notes || "",
            workoutId: newWorkout.id,
            isCompleted: false
          });
        }
      }
      
      // Initialize user progress
      await storage.createUserProgress({
        userId: defaultUser.id,
        workoutPlanId: newPlan.id,
        currentDay: 1,
        completedDays: 0,
        currentStreak: 0,
        longestStreak: 0
      });
      
      res.status(201).json(newPlan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid workout plan data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to create workout plan" });
    }
  });
  
  // Get workouts for a plan
  app.get("/api/workout-plans/:id/workouts", async (req, res) => {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid workout plan ID" });
    }
    
    const workouts = await storage.getWorkoutsByPlanId(planId);
    res.json(workouts);
  });
  
  // Get a specific workout by plan ID and day
  app.get("/api/workout-plans/:id/workouts/day/:day", async (req, res) => {
    const planId = parseInt(req.params.id);
    const day = parseInt(req.params.day);
    
    if (isNaN(planId) || isNaN(day)) {
      return res.status(400).json({ message: "Invalid plan ID or day" });
    }
    
    const workout = await storage.getWorkoutByPlanIdAndDay(planId, day);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    // Get exercises for this workout
    const exercises = await storage.getExercisesByWorkoutId(workout.id);
    
    res.json({
      workout,
      exercises
    });
  });
  
  // Mark workout as completed
  app.put("/api/workouts/:id/complete", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid workout ID" });
    }
    
    const workout = await storage.getWorkout(id);
    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }
    
    // Mark workout as completed
    const updatedWorkout = await storage.updateWorkout(id, {
      isCompleted: true
    });
    
    // Update user progress
    const userProgress = await storage.getUserProgressByPlanId(defaultUser.id, workout.workoutPlanId);
    if (userProgress) {
      // Check if this is the next day in sequence
      const isNextDay = userProgress.currentDay === workout.day;
      
      // Calculate new streak
      let newStreak = userProgress.currentStreak;
      let lastCompletedDate = userProgress.lastCompletedAt;
      
      // If this is the next day, increment the streak
      if (isNextDay) {
        newStreak++;
      }
      
      await storage.updateUserProgress(userProgress.id, {
        completedDays: userProgress.completedDays + 1,
        currentDay: isNextDay ? workout.day + 1 : userProgress.currentDay,
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, userProgress.longestStreak)
      });
    }
    
    res.json(updatedWorkout);
  });
  
  // Mark exercise as completed
  app.put("/api/exercises/:id/complete", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid exercise ID" });
    }
    
    const updatedExercise = await storage.updateExercise(id, {
      isCompleted: true
    });
    
    if (!updatedExercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }
    
    res.json(updatedExercise);
  });
  
  // Get progress for a workout plan
  app.get("/api/workout-plans/:id/progress", async (req, res) => {
    const planId = parseInt(req.params.id);
    if (isNaN(planId)) {
      return res.status(400).json({ message: "Invalid workout plan ID" });
    }
    
    const progress = await storage.getUserProgressByPlanId(defaultUser.id, planId);
    if (!progress) {
      return res.status(404).json({ message: "Progress not found" });
    }
    
    // Get the workout plan to include total days
    const plan = await storage.getWorkoutPlan(planId);
    if (!plan) {
      return res.status(404).json({ message: "Workout plan not found" });
    }
    
    // Get recent workouts (last 5 completed)
    const allWorkouts = await storage.getWorkoutsByPlanId(planId);
    const completedWorkouts = allWorkouts
      .filter(w => w.isCompleted)
      .sort((a, b) => (b.completedAt?.getTime() || 0) - (a.completedAt?.getTime() || 0))
      .slice(0, 5);
    
    // Calculate completion percentage
    const completionPercentage = plan.totalDays > 0 
      ? Math.round((progress.completedDays / plan.totalDays) * 100) 
      : 0;
    
    res.json({
      progress,
      completionPercentage,
      totalDays: plan.totalDays,
      recentCompletedWorkouts: completedWorkouts
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
