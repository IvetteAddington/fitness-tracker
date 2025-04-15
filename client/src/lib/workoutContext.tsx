import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { WorkoutPlan } from "@shared/schema";

interface WorkoutContextType {
  activePlan: WorkoutPlan | null;
  setActivePlan: (plan: WorkoutPlan | null) => void;
  activeDay: number | null;
  setActiveDay: (day: number | null) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

export function WorkoutProvider({ children }: { children: ReactNode }) {
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  
  // Load workout plans and auto-select the first one if available
  const { data: plans } = useQuery({
    queryKey: ["/api/workout-plans"],
    onSuccess: (data) => {
      // If we have plans but no active plan selected, select the first one
      if (data?.length > 0 && !activePlan) {
        setActivePlan(data[0]);
        setActiveDay(1); // Default to day 1
      }
    }
  });

  return (
    <WorkoutContext.Provider value={{ 
      activePlan, 
      setActivePlan, 
      activeDay, 
      setActiveDay 
    }}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error("useWorkout must be used within a WorkoutProvider");
  }
  return context;
}
