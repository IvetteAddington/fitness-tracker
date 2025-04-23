import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { parseWorkoutFile } from "@/lib/fileParser";
import { WorkoutPlanFile } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useWorkout } from "@/lib/workoutContext";
import ManualEntryForm from "./ManualEntryForm";

export default function UploadSection() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const { setActivePlan } = useWorkout();

  const uploadMutation = useMutation({
    mutationFn: async (workoutPlan: WorkoutPlanFile) => {
      const response = await apiRequest("POST", "/api/workout-plans", workoutPlan);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your workout plan has been uploaded.",
      });
      setFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      setActivePlan(data);
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your workout plan.",
        variant: "destructive",
      });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    try {
      const workoutPlan = await parseWorkoutFile(file);
      uploadMutation.mutate(workoutPlan);
    } catch (error) {
      let message = "File parsing failed";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Invalid file format",
        description: message,
        variant: "destructive",
      });
    }
  };

  const loadSampleData = () => {
    // Sample workout plan data - 2-week program
    const samplePlan: WorkoutPlanFile = {
      name: "6-Week Strength Builder",
      totalDays: 42,
      workouts: [
        // Week 1
        {
          day: 1,
          name: "Upper Body Strength",
          notes: "Focus on form over weight. Rest 60-90 seconds between sets. Stay hydrated!",
          exercises: [
            { name: "Bench Press", sets: 3, reps: "8-10", notes: "Keep back flat on bench" },
            { name: "Barbell Rows", sets: 3, reps: "10-12", notes: "Pull to lower chest" },
            { name: "Overhead Press", sets: 3, reps: "8-10", notes: "Don't arch back" },
            { name: "Pull-ups", sets: 3, reps: "Max", notes: "Use assistance if needed" },
            { name: "Tricep Dips", sets: 3, reps: "12-15", notes: "Control the descent" }
          ]
        },
        {
          day: 2,
          name: "Lower Body Power",
          notes: "Warm up thoroughly before squats. Hydrate between exercises.",
          exercises: [
            { name: "Squats", sets: 4, reps: "8-10", notes: "Break parallel" },
            { name: "Deadlifts", sets: 3, reps: "8", notes: "Keep back straight" },
            { name: "Lunges", sets: 3, reps: "10 each leg", notes: "Step forward, lower hips" },
            { name: "Calf Raises", sets: 4, reps: "15", notes: "Full range of motion" }
          ]
        },
        {
          day: 3,
          name: "Core Focus",
          notes: "Breathe through each exercise. Focus on form.",
          exercises: [
            { name: "Plank", sets: 3, reps: "60 seconds", notes: "Keep body straight" },
            { name: "Russian Twists", sets: 3, reps: "20", notes: "Rotate fully" },
            { name: "Leg Raises", sets: 3, reps: "15", notes: "Control the movement" },
            { name: "Mountain Climbers", sets: 3, reps: "30 seconds", notes: "Quick pace" },
            { name: "Bicycle Crunches", sets: 3, reps: "20", notes: "Elbow to opposite knee" }
          ]
        },
        {
          day: 4,
          name: "Rest Day",
          notes: "Active recovery. Light stretching and walking recommended.",
          exercises: [
            { name: "Full Body Stretch", sets: 1, reps: "15 min", notes: "Hold each stretch for 30 seconds" },
            { name: "Light Walk", sets: 1, reps: "20 min", notes: "Casual pace" }
          ]
        },
        {
          day: 5,
          name: "Leg Day",
          notes: "Focus on form over weight. Rest 60-90 seconds between sets. Stay hydrated!",
          exercises: [
            { name: "Squats", sets: 3, reps: "12", notes: "Keep your back straight, feet shoulder-width apart" },
            { name: "Lunges", sets: 3, reps: "10 (each leg)", notes: "Step forward with one leg, lowering your hips" },
            { name: "Leg Press", sets: 4, reps: "10", notes: "Adjust the seat so your knees are at 90 degrees" },
            { name: "Calf Raises", sets: 3, reps: "15", notes: "Stand on the edge of a step. Rise up on your toes" },
            { name: "Hamstring Curls", sets: 3, reps: "12", notes: "Lie face down on the machine, curl legs up" }
          ]
        },
        {
          day: 6,
          name: "Upper/Lower Mix",
          notes: "Complete all exercises with proper form. Rest 90 seconds between sets.",
          exercises: [
            { name: "Pushups", sets: 3, reps: "15", notes: "Keep core tight" },
            { name: "Lat Pulldowns", sets: 3, reps: "12", notes: "Pull to upper chest" },
            { name: "Dumbbell Lunges", sets: 3, reps: "10 each leg", notes: "Hold weights at sides" },
            { name: "Shoulder Press", sets: 3, reps: "10", notes: "Seated or standing" }
          ]
        },
        {
          day: 7,
          name: "Recovery Day",
          notes: "Complete rest day. Hydrate well and focus on nutrition.",
          exercises: [
            { name: "Stretching", sets: 1, reps: "10 min", notes: "Light full-body stretch" },
            { name: "Foam Rolling", sets: 1, reps: "5-10 min", notes: "Focus on tight areas" }
          ]
        },
        
        // Week 2
        {
          day: 8,
          name: "Chest & Triceps",
          notes: "Increase weight slightly from last week. Focus on mind-muscle connection.",
          exercises: [
            { name: "Incline Bench Press", sets: 4, reps: "8", notes: "Control the descent" },
            { name: "Chest Flys", sets: 3, reps: "12", notes: "Keep slight bend in elbows" },
            { name: "Tricep Pushdowns", sets: 3, reps: "12", notes: "Elbows at sides" },
            { name: "Dips", sets: 3, reps: "10", notes: "Lean forward for chest emphasis" }
          ]
        },
        {
          day: 9,
          name: "Back & Biceps",
          notes: "Focus on the squeeze at peak contraction for each exercise.",
          exercises: [
            { name: "Deadlifts", sets: 3, reps: "6-8", notes: "Add weight from last week" },
            { name: "Cable Rows", sets: 3, reps: "10", notes: "Squeeze shoulder blades" },
            { name: "Lat Pulldowns", sets: 3, reps: "12", notes: "Wide grip" },
            { name: "Barbell Curls", sets: 3, reps: "10", notes: "No swinging" }
          ]
        },
        {
          day: 10,
          name: "Core & Cardio",
          notes: "Move quickly between exercises, minimal rest.",
          exercises: [
            { name: "Hanging Leg Raises", sets: 3, reps: "10", notes: "Control the movement" },
            { name: "Cable Woodchoppers", sets: 3, reps: "12 each side", notes: "Rotate from hips" },
            { name: "Planks", sets: 3, reps: "45 seconds", notes: "Keep hips in line with shoulders" },
            { name: "HIIT", sets: 1, reps: "15 minutes", notes: "30s work, 30s rest intervals" }
          ]
        },
        {
          day: 11,
          name: "Shoulders",
          notes: "Maintain good posture throughout all exercises.",
          exercises: [
            { name: "Military Press", sets: 4, reps: "8", notes: "Standing or seated" },
            { name: "Lateral Raises", sets: 3, reps: "12", notes: "Thumbs slightly up" },
            { name: "Face Pulls", sets: 3, reps: "15", notes: "Pull to forehead level" },
            { name: "Shrugs", sets: 3, reps: "12", notes: "Hold at top for 2 seconds" }
          ]
        },
        {
          day: 12,
          name: "Lower Body Focus",
          notes: "Push yourself on leg day! Proper warm-up essential.",
          exercises: [
            { name: "Front Squats", sets: 4, reps: "8", notes: "Keep chest up" },
            { name: "Romanian Deadlifts", sets: 3, reps: "10", notes: "Feel stretch in hamstrings" },
            { name: "Walking Lunges", sets: 3, reps: "20 steps total", notes: "Hold dumbbells" },
            { name: "Leg Extensions", sets: 3, reps: "12", notes: "Squeeze quads at top" }
          ]
        },
        {
          day: 13,
          name: "Upper Body Circuits",
          notes: "Complete exercises as supersets with minimal rest between pairs.",
          exercises: [
            { name: "Pushups + Rows", sets: 3, reps: "12 each", notes: "Superset" },
            { name: "Dips + Curls", sets: 3, reps: "10 each", notes: "Superset" },
            { name: "Overhead Press + Pulldowns", sets: 3, reps: "10 each", notes: "Superset" }
          ]
        },
        {
          day: 14,
          name: "Active Recovery",
          notes: "Low intensity, focus on mobility and recovery.",
          exercises: [
            { name: "Light Cardio", sets: 1, reps: "20 min", notes: "Walking, cycling or swimming" },
            { name: "Yoga Flow", sets: 1, reps: "15 min", notes: "Focus on breathing" },
            { name: "Foam Rolling", sets: 1, reps: "10 min", notes: "Target sore muscles" }
          ]
        }
      ]
    };

    // Upload the sample plan
    uploadMutation.mutate(samplePlan);
  };

  return (
    <div className="space-y-4">
      <div 
        className="mb-8 p-5"
        style={{
          backgroundColor: "#FFF5E4",
          border: "2px solid #6A9C89",
          boxShadow: "3px 3px 0 #FFA725",
          position: "relative"
        }}
      >
        <div className="clipboard-top relative" style={{
          height: "30px",
          backgroundColor: "#6A9C89",
          borderRadius: "5px 5px 0 0",
          margin: "-20px -20px 20px -20px"
        }}>
          <div className="clipboard-clip" style={{
            width: "60px",
            height: "15px",
            backgroundColor: "#555",
            borderRadius: "5px 5px 0 0",
            margin: "0 auto",
            transform: "translateY(-7px)"
          }}></div>
        </div>
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">WORKOUT PLAN</h2>
        
        <div className="upload-area bg-[#FFF5E4] p-6 text-center border-2 border-dashed border-[#FFA725]">
          <p className="font-['Courier_Prime'] text-[#FFA725] font-bold mb-4">UPLOAD YOUR 6-8 WEEK WORKOUT ROUTINE</p>
          <label 
            htmlFor="workout-file" 
            className="cursor-pointer inline-block bg-[#6A9C89] text-white font-['Bebas_Neue'] text-xl px-6 py-2 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
            style={{
              transition: "all 0.1s ease-in-out"
            }}
          >
            <i className="fas fa-upload mr-2"></i> SELECT FILE
          </label>
          <input 
            type="file" 
            id="workout-file" 
            accept=".json,.csv" 
            className="sr-only"
            onChange={handleFileChange}
          />
          <p className="text-sm font-['Courier_Prime'] mt-3 text-[#FFA725] opacity-75">Accepts CSV or JSON format</p>
          
          {file && (
            <div className="mt-4">
              <p className="font-bold text-[#FFA725] font-['Courier_Prime']">
                {file.name}
              </p>
              <button
                onClick={handleUpload}
                className="mt-3 bg-[#FFA725] text-white font-['Bebas_Neue'] px-4 py-1 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
                disabled={uploadMutation.isPending}
              >
                {uploadMutation.isPending ? "UPLOADING..." : "UPLOAD PLAN"}
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-4 text-center">
          <button 
            onClick={loadSampleData}
            className="text-[#6A9C89] underline font-['Courier_Prime'] text-sm"
            disabled={uploadMutation.isPending}
          >
            No file? Try sample workout plan
          </button>
        </div>
      </div>
      
      {/* Manual Entry Form */}
      <ManualEntryForm />
    </div>
  );
}
