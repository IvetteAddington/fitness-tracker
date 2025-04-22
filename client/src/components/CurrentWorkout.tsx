import { useQuery, useMutation } from "@tanstack/react-query";
import { useWorkout } from "@/lib/workoutContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Check, Dumbbell, Forward } from "lucide-react";

export default function CurrentWorkout() {
  const { activePlan, activeDay, setActiveDay } = useWorkout();
  const { toast } = useToast();
  
  const { data, isLoading } = useQuery({
    queryKey: [`/api/workout-plans/${activePlan?.id}/workouts/day/${activeDay}`],
    enabled: !!activePlan && !!activeDay
  });
  
  const completeExerciseMutation = useMutation({
    mutationFn: async (exerciseId: number) => {
      const response = await apiRequest("PUT", `/api/exercises/${exerciseId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/workout-plans/${activePlan?.id}/workouts/day/${activeDay}`]
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark exercise as completed",
        variant: "destructive"
      });
    }
  });
  
  const completeWorkoutMutation = useMutation({
    mutationFn: async (workoutId: number) => {
      const response = await apiRequest("PUT", `/api/workouts/${workoutId}/complete`, {});
      return response.json();
    },
    onSuccess: () => {
      // Invalidate both the current workout and progress data
      queryClient.invalidateQueries({ 
        queryKey: [`/api/workout-plans/${activePlan?.id}/workouts/day/${activeDay}`]
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/workout-plans/${activePlan?.id}/progress`]
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/workout-plans/${activePlan?.id}/workouts`]
      });
      
      toast({
        title: "Success!",
        description: "Workout completed successfully!"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to mark workout as completed",
        variant: "destructive"
      });
    }
  });
  
  const markExerciseComplete = (exerciseId: number) => {
    completeExerciseMutation.mutate(exerciseId);
  };
  
  const markAllComplete = () => {
    if (data?.workout) {
      completeWorkoutMutation.mutate(data.workout.id);
    }
  };
  
  const goToNextWorkout = () => {
    if (!activePlan || !activeDay) return;
    
    // Find workouts again from cache
    const workoutsData = queryClient.getQueryData([`/api/workout-plans/${activePlan.id}/workouts`]) as any[];
    
    if (!workoutsData) return;
    
    const currentIndex = workoutsData.findIndex(w => w.day === activeDay);
    if (currentIndex < workoutsData.length - 1) {
      setActiveDay(workoutsData[currentIndex + 1].day);
    }
  };
  
  if (!activePlan || !activeDay) {
    return (
      <div 
        className="mb-8 p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #A9C0A6",
          boxShadow: "3px 3px 0 #F4B942",
          position: "relative"
        }}
      >
        <div className="text-center font-['Courier_Prime'] py-4">
          No active workout selected. Please select a workout day from the calendar.
        </div>
      </div>
    );
  }
  
  if (isLoading) {
    return (
      <div 
        className="mb-8 p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #A9C0A6",
          boxShadow: "3px 3px 0 #F4B942",
          position: "relative"
        }}
      >
        <div className="text-center font-['Courier_Prime'] py-4">Loading workout details...</div>
      </div>
    );
  }
  
  if (!data || !data.workout) {
    return (
      <div 
        className="mb-8 p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #A9C0A6",
          boxShadow: "3px 3px 0 #F4B942",
          position: "relative"
        }}
      >
        <div className="text-center font-['Courier_Prime'] py-4">No workout data available for this day.</div>
      </div>
    );
  }
  
  const { workout, exercises } = data;
  const isWorkoutCompleted = workout.isCompleted;
  
  return (
    <div 
      className="mb-8 p-5"
      style={{
        backgroundColor: "#FFF8DC",
        border: "2px solid #A9C0A6",
        boxShadow: "3px 3px 0 #F4B942",
        position: "relative"
      }}
    >
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#A9C0A6] tracking-wider">
          DAY {workout.day}: {workout.name}
        </h2>
        <span className="bg-[#EE6C4D] text-white font-['Bebas_Neue'] px-3 py-1 rounded-lg text-sm">
          {isWorkoutCompleted ? "COMPLETED" : "CURRENT DAY"}
        </span>
      </div>
      
      <div className="mb-6">
        <p className="font-['Courier_Prime'] text-[#F4B942]">{workout.notes}</p>
      </div>
      
      {/* Exercise List */}
      <div className="space-y-4 mb-8">
        {exercises.map((exercise) => (
          <div 
            key={exercise.id}
            className="bg-[#FFF8DC] p-4"
            style={{
              borderLeft: exercise.isCompleted 
                ? "5px solid #556B2F" 
                : "5px solid #CD5C5C"
            }}
          >
            <div className="flex flex-wrap justify-between items-center mb-2">
              <h3 className="font-['Bebas_Neue'] text-xl text-[#EE6C4D]">{exercise.name}</h3>
              <span className="font-['Courier_Prime'] text-sm">{exercise.sets} sets × {exercise.reps}</span>
            </div>
            <p className="font-['Courier_Prime'] text-sm mb-3">{exercise.notes}</p>
            <div className="flex justify-end">
              <button 
                className={`bg-${exercise.isCompleted ? '[#556B2F]' : '[#8B4513]'} text-[#FFF8DC] font-['Bebas_Neue'] px-3 py-1 text-sm rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out`}
                style={{
                  transition: "all 0.1s ease-in-out"
                }}
                onClick={() => markExerciseComplete(exercise.id)}
                disabled={exercise.isCompleted || isWorkoutCompleted}
              >
                <Check className="inline w-4 h-4 mr-1" /> 
                {exercise.isCompleted ? "COMPLETED" : "MARK COMPLETE"}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between items-center">
        <button 
          className="bg-[#A9C0A6] text-[#FFF8DC] font-['Bebas_Neue'] px-5 py-2 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
          onClick={markAllComplete}
          disabled={isWorkoutCompleted}
        >
          <Dumbbell className="inline w-4 h-4 mr-2" /> MARK ALL COMPLETE
        </button>
        
        <button 
          className="bg-[#CD5C5C] text-[#FFF8DC] font-['Bebas_Neue'] px-5 py-2 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
          onClick={goToNextWorkout}
        >
          <Forward className="inline w-4 h-4 mr-2" /> NEXT WORKOUT
        </button>
      </div>
    </div>
  );
}
