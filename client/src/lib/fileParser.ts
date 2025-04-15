import { WorkoutPlanFile, workoutPlanFileSchema } from "@shared/schema";
import { ZodError } from "zod";

type CSVRow = string[];

/**
 * Parse a workout plan file (JSON or CSV) and return a structured workout plan
 */
export async function parseWorkoutFile(file: File): Promise<WorkoutPlanFile> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  
  if (extension === 'json') {
    return parseJsonFile(file);
  } else if (extension === 'csv') {
    return parseCsvFile(file);
  } else {
    throw new Error('Unsupported file type. Please upload a JSON or CSV file.');
  }
}

/**
 * Parse a JSON workout plan file
 */
async function parseJsonFile(file: File): Promise<WorkoutPlanFile> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    return workoutPlanFileSchema.parse(data);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Invalid JSON format: ${error.message}`);
    }
    throw new Error('Invalid JSON file. Please check the file format.');
  }
}

/**
 * Parse a CSV workout plan file
 * Expected format:
 * Line 1: Workout Plan Name, Total Days
 * Line 2: Headers
 * Line 3+: Day, Workout Name, Notes, Exercise Name, Sets, Reps, Exercise Notes
 */
async function parseCsvFile(file: File): Promise<WorkoutPlanFile> {
  try {
    const text = await file.text();
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    if (lines.length < 3) {
      throw new Error('CSV file must contain at least 3 lines');
    }
    
    // Parse the workout plan name and total days
    const planInfo = parseCSVLine(lines[0]);
    if (planInfo.length < 2) {
      throw new Error('First line must contain: Workout Plan Name, Total Days');
    }
    
    const name = planInfo[0];
    const totalDays = parseInt(planInfo[1]);
    
    if (isNaN(totalDays)) {
      throw new Error('Total days must be a number');
    }
    
    // Skip the header line (line 2) and parse the workouts
    const workouts: {
      [day: number]: {
        name: string;
        notes: string;
        exercises: Array<{
          name: string;
          sets: number;
          reps: string;
          notes?: string;
        }>;
      };
    } = {};
    
    for (let i = 2; i < lines.length; i++) {
      const row = parseCSVLine(lines[i]);
      if (row.length < 7) {
        throw new Error(`Line ${i+1} has insufficient columns. Expected: Day, Workout Name, Notes, Exercise Name, Sets, Reps, Exercise Notes`);
      }
      
      const day = parseInt(row[0]);
      if (isNaN(day)) {
        throw new Error(`Day in line ${i+1} must be a number`);
      }
      
      const workoutName = row[1];
      const workoutNotes = row[2];
      const exerciseName = row[3];
      const sets = parseInt(row[4]);
      if (isNaN(sets)) {
        throw new Error(`Sets in line ${i+1} must be a number`);
      }
      
      const reps = row[5];
      const exerciseNotes = row[6];
      
      // Create or update the workout for this day
      if (!workouts[day]) {
        workouts[day] = {
          name: workoutName,
          notes: workoutNotes,
          exercises: []
        };
      }
      
      // Add the exercise to the workout
      workouts[day].exercises.push({
        name: exerciseName,
        sets,
        reps,
        notes: exerciseNotes
      });
    }
    
    // Convert the workouts object to the expected format
    const workoutArray = Object.entries(workouts).map(([day, workout]) => ({
      day: parseInt(day),
      name: workout.name,
      notes: workout.notes,
      exercises: workout.exercises
    }));
    
    // Validate the workout plan
    return workoutPlanFileSchema.parse({
      name,
      totalDays,
      workouts: workoutArray
    });
    
  } catch (error) {
    if (error instanceof ZodError) {
      throw new Error(`Invalid CSV format: ${error.message}`);
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse CSV file');
  }
}

/**
 * Parse a CSV line, handling quoted values
 */
function parseCSVLine(line: string): CSVRow {
  const result: CSVRow = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  // Don't forget the last field
  result.push(current);
  
  return result.map(field => {
    // Remove surrounding quotes if present
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.slice(1, -1);
    }
    return field;
  });
}
