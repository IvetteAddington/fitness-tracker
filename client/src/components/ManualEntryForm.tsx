import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { WorkoutPlanFile } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useWorkout } from "@/lib/workoutContext";
import { Plus, Minus, Save } from "lucide-react";

interface Exercise {
  name: string;
  sets: number;
  reps: string;
  notes: string;
  isSuperset?: boolean;
  supersetWith?: string;
}

interface Workout {
  day: number;
  name: string;
  notes: string;
  exercises: Exercise[];
}

export default function ManualEntryForm() {
  const { toast } = useToast();
  const { setActivePlan } = useWorkout();
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [planName, setPlanName] = useState("");
  const [totalDays, setTotalDays] = useState(7);
  const [workouts, setWorkouts] = useState<Workout[]>([
    {
      day: 1,
      name: "",
      notes: "",
      exercises: [{ name: "", sets: 3, reps: "", notes: "", isSuperset: false, supersetWith: "" }]
    }
  ]);

  const uploadMutation = useMutation({
    mutationFn: async (workoutPlan: WorkoutPlanFile) => {
      const response = await apiRequest("POST", "/api/workout-plans", workoutPlan);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your workout plan has been created.",
      });
      setShowForm(false);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ["/api/workout-plans"] });
      setActivePlan(data);
    },
    onError: (error) => {
      toast({
        title: "Creation failed",
        description: error.message || "There was an error creating your workout plan.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setPlanName("");
    setTotalDays(7);
    setWorkouts([
      {
        day: 1,
        name: "",
        notes: "",
        exercises: [{ name: "", sets: 3, reps: "", notes: "", isSuperset: false, supersetWith: "" }]
      }
    ]);
  };

  const handleWorkoutNameChange = (index: number, value: string) => {
    const newWorkouts = [...workouts];
    newWorkouts[index].name = value;
    setWorkouts(newWorkouts);
  };

  const handleWorkoutNotesChange = (index: number, value: string) => {
    const newWorkouts = [...workouts];
    newWorkouts[index].notes = value;
    setWorkouts(newWorkouts);
  };

  const handleExerciseChange = (workoutIndex: number, exerciseIndex: number, field: keyof Exercise, value: string | number | boolean) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex].exercises[exerciseIndex] = {
      ...newWorkouts[workoutIndex].exercises[exerciseIndex],
      [field]: value
    };
    setWorkouts(newWorkouts);
  };

  const addExercise = (workoutIndex: number) => {
    const newWorkouts = [...workouts];
    newWorkouts[workoutIndex].exercises.push({ name: "", sets: 3, reps: "", notes: "", isSuperset: false, supersetWith: "" });
    setWorkouts(newWorkouts);
  };

  const removeExercise = (workoutIndex: number, exerciseIndex: number) => {
    const newWorkouts = [...workouts];
    if (newWorkouts[workoutIndex].exercises.length > 1) {
      newWorkouts[workoutIndex].exercises.splice(exerciseIndex, 1);
      setWorkouts(newWorkouts);
    }
  };

  const addWorkout = () => {
    const newDay = workouts.length + 1;
    setWorkouts([
      ...workouts,
      {
        day: newDay,
        name: "",
        notes: "",
        exercises: [{ name: "", sets: 3, reps: "", notes: "", isSuperset: false, supersetWith: "" }]
      }
    ]);
  };

  const removeWorkout = (index: number) => {
    if (workouts.length > 1) {
      const newWorkouts = workouts.filter((_, i) => i !== index);
      // Update day numbers
      newWorkouts.forEach((workout, i) => {
        workout.day = i + 1;
      });
      setWorkouts(newWorkouts);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!planName.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a plan name",
        variant: "destructive",
      });
      return;
    }

    // Validate workouts
    for (let i = 0; i < workouts.length; i++) {
      if (!workouts[i].name.trim()) {
        toast({
          title: "Missing information",
          description: `Workout day ${workouts[i].day} is missing a name`,
          variant: "destructive",
        });
        return;
      }

      // Check exercises
      for (let j = 0; j < workouts[i].exercises.length; j++) {
        const exercise = workouts[i].exercises[j];
        if (!exercise.name.trim() || !exercise.reps.trim()) {
          toast({
            title: "Missing information",
            description: `Exercise ${j + 1} in workout day ${workouts[i].day} is missing required information`,
            variant: "destructive",
          });
          return;
        }
      }
    }

    const workoutPlan: WorkoutPlanFile = {
      name: planName,
      totalDays,
      workouts
    };

    uploadMutation.mutate(workoutPlan);
  };

  return (
    <div 
      className="mb-6 p-4"
      style={{
        backgroundColor: "#F5F5DC",
        border: "2px solid #A9C0A6",
        boxShadow: "3px 3px 0 #F4B942",
        borderRadius: "5px"
      }}
    >
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full text-center bg-[#A9C0A6] text-white font-['Bebas_Neue'] text-xl px-4 py-2 rounded shadow hover:bg-opacity-90 transition-all"
      >
        {showForm ? "HIDE MANUAL ENTRY FORM" : "CREATE WORKOUT PLAN MANUALLY"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="mb-4">
            <label className="block font-['Courier_Prime'] text-[#F4B942] mb-1">Plan Name:</label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-2 border border-[#A9C0A6] bg-white rounded"
              placeholder="e.g., Strength Builder Workout"
            />
          </div>

          <div className="mb-4">
            <label className="block font-['Courier_Prime'] text-[#F4B942] mb-1">Total Days:</label>
            <input
              type="number"
              min="1"
              max="60"
              value={totalDays}
              onChange={(e) => setTotalDays(parseInt(e.target.value) || 1)}
              className="w-full p-2 border border-[#A9C0A6] bg-white rounded"
            />
          </div>

          <div className="my-6">
            <h3 className="font-['Bebas_Neue'] text-[#A9C0A6] text-xl border-b border-[#F4B942] pb-1 mb-4">
              WORKOUTS
            </h3>

            {workouts.map((workout, workoutIndex) => (
              <div 
                key={workoutIndex} 
                className="mb-6 p-4 border border-dashed border-[#F4D35E] rounded"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-['Bebas_Neue'] text-[#EE6C4D]">
                    DAY {workout.day}
                  </h4>
                  <button 
                    type="button"
                    className="text-[#EE6C4D] bg-white border border-[#EE6C4D] rounded-full h-6 w-6 flex items-center justify-center"
                    onClick={() => removeWorkout(workoutIndex)}
                    disabled={workouts.length <= 1}
                  >
                    <Minus size={14} />
                  </button>
                </div>

                <div className="mb-3">
                  <label className="block font-['Courier_Prime'] text-[#F4B942] text-sm mb-1">
                    Workout Name:
                  </label>
                  <input
                    type="text"
                    value={workout.name}
                    onChange={(e) => handleWorkoutNameChange(workoutIndex, e.target.value)}
                    className="w-full p-2 border border-[#A9C0A6] bg-white rounded"
                    placeholder="e.g., Upper Body Strength"
                  />
                </div>

                <div className="mb-3">
                  <label className="block font-['Courier_Prime'] text-[#F4B942] text-sm mb-1">
                    Notes (optional):
                  </label>
                  <textarea
                    value={workout.notes}
                    onChange={(e) => handleWorkoutNotesChange(workoutIndex, e.target.value)}
                    className="w-full p-2 border border-[#A9C0A6] bg-white rounded"
                    placeholder="Any notes for this workout day"
                    rows={2}
                  />
                </div>

                <h5 className="font-['Bebas_Neue'] text-[#A9C0A6] mt-4 mb-2">
                  EXERCISES
                </h5>

                {workout.exercises.map((exercise, exerciseIndex) => (
                  <div 
                    key={exerciseIndex} 
                    className="mb-3 p-2 bg-white rounded border border-[#A9C0A6] border-opacity-70"
                  >
                    <div className="flex justify-between">
                      <h6 className="font-['Courier_Prime'] text-[#EE6C4D] text-sm">
                        Exercise {exerciseIndex + 1}
                      </h6>
                      <button 
                        type="button"
                        className="text-[#EE6C4D] bg-white border border-[#EE6C4D] rounded-full h-5 w-5 flex items-center justify-center"
                        onClick={() => removeExercise(workoutIndex, exerciseIndex)}
                        disabled={workout.exercises.length <= 1}
                      >
                        <Minus size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                      <div>
                        <label className="block font-['Courier_Prime'] text-[#F4B942] text-xs mb-1">
                          Exercise Name:
                        </label>
                        <input
                          type="text"
                          value={exercise.name}
                          onChange={(e) => handleExerciseChange(workoutIndex, exerciseIndex, 'name', e.target.value)}
                          className="w-full p-1 border border-[#A9C0A6] border-opacity-70 rounded text-sm"
                          placeholder="e.g., Bench Press"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-['Courier_Prime'] text-[#F4B942] text-xs mb-1">
                            Sets:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={exercise.sets}
                            onChange={(e) => handleExerciseChange(workoutIndex, exerciseIndex, 'sets', parseInt(e.target.value) || 1)}
                            className="w-full p-1 border border-[#A9C0A6] border-opacity-70 rounded text-sm"
                          />
                        </div>
                        <div>
                          <label className="block font-['Courier_Prime'] text-[#F4B942] text-xs mb-1">
                            Reps:
                          </label>
                          <input
                            type="text"
                            value={exercise.reps}
                            onChange={(e) => handleExerciseChange(workoutIndex, exerciseIndex, 'reps', e.target.value)}
                            className="w-full p-1 border border-[#A9C0A6] border-opacity-70 rounded text-sm"
                            placeholder="e.g., 8-10 or 30 sec"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <label className="block font-['Courier_Prime'] text-[#F4B942] text-xs mb-1">
                        Notes (optional):
                      </label>
                      <input
                        type="text"
                        value={exercise.notes}
                        onChange={(e) => handleExerciseChange(workoutIndex, exerciseIndex, 'notes', e.target.value)}
                        className="w-full p-1 border border-[#A9C0A6] border-opacity-70 rounded text-sm"
                        placeholder="e.g., Keep back straight"
                      />
                    </div>
                    
                    <div className="mt-2 border-t border-dashed border-[#F4B942] pt-2">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id={`superset-${workoutIndex}-${exerciseIndex}`}
                          checked={exercise.isSuperset || false}
                          onChange={(e) => handleExerciseChange(workoutIndex, exerciseIndex, 'isSuperset', e.target.checked)}
                          className="mr-2"
                        />
                        <label 
                          htmlFor={`superset-${workoutIndex}-${exerciseIndex}`}
                          className="font-['Courier_Prime'] text-[#EE6C4D] text-xs"
                        >
                          This is a superset
                        </label>
                      </div>
                      
                      {exercise.isSuperset && (
                        <div className="mt-1">
                          <label className="block font-['Courier_Prime'] text-[#F4B942] text-xs mb-1">
                            Superset With:
                          </label>
                          <input
                            type="text"
                            value={exercise.supersetWith || ""}
                            onChange={(e) => handleExerciseChange(workoutIndex, exerciseIndex, 'supersetWith', e.target.value)}
                            className="w-full p-1 border border-[#A9C0A6] border-opacity-70 rounded text-sm"
                            placeholder="e.g., Tricep Pushdowns"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  className="mt-2 flex items-center text-[#A9C0A6] bg-white border border-[#A9C0A6] text-sm rounded px-2 py-1"
                  onClick={() => addExercise(workoutIndex)}
                >
                  <Plus size={14} className="mr-1" /> Add Exercise
                </button>
              </div>
            ))}

            <button
              type="button"
              className="flex items-center justify-center w-full bg-[#A9C0A6] bg-opacity-20 text-[#A9C0A6] border border-dashed border-[#A9C0A6] rounded px-4 py-2 hover:bg-opacity-30 transition-all"
              onClick={addWorkout}
            >
              <Plus size={16} className="mr-2" /> Add Another Workout Day
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="mr-3 px-4 py-2 border border-[#EE6C4D] text-[#EE6C4D] rounded"
              onClick={resetForm}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#EE6C4D] text-white rounded flex items-center font-['Bebas_Neue'] text-lg"
              disabled={uploadMutation.isPending}
            >
              {uploadMutation.isPending ? "SAVING..." : (
                <>
                  <Save size={18} className="mr-2" /> SAVE WORKOUT PLAN
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}