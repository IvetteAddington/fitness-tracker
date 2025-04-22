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
    // Sample workout plan data
    const samplePlan: WorkoutPlanFile = {
      name: "6-Week Strength Builder",
      totalDays: 30,
      workouts: [
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
          backgroundColor: "#F5F5DC",
          border: "2px solid #73E2D6",
          boxShadow: "3px 3px 0 #F4B942",
          position: "relative"
        }}
      >
        <div className="clipboard-top relative" style={{
          height: "30px",
          backgroundColor: "#73E2D6",
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
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#73E2D6] text-center mb-4 tracking-wider">WORKOUT PLAN</h2>
        
        <div className="upload-area bg-[#F5F5DC] p-6 text-center border-2 border-dashed border-[#F4D35E]">
          <p className="font-['Courier_Prime'] text-[#F4B942] font-bold mb-4">UPLOAD YOUR 6-8 WEEK WORKOUT ROUTINE</p>
          <label 
            htmlFor="workout-file" 
            className="cursor-pointer inline-block bg-[#73E2D6] text-white font-['Bebas_Neue'] text-xl px-6 py-2 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
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
          <p className="text-sm font-['Courier_Prime'] mt-3 text-[#F4B942] opacity-75">Accepts CSV or JSON format</p>
          
          {file && (
            <div className="mt-4">
              <p className="font-bold text-[#EE6C4D] font-['Courier_Prime']">
                {file.name}
              </p>
              <button
                onClick={handleUpload}
                className="mt-3 bg-[#EE6C4D] text-white font-['Bebas_Neue'] px-4 py-1 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
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
            className="text-[#EE6C4D] underline font-['Courier_Prime'] text-sm"
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
