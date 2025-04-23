import { useQuery } from "@tanstack/react-query";
import { useWorkout } from "@/lib/workoutContext";

// Array of weekday names - starting with Monday as day 1
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface DaySelectorProps {
  planId: number;
}

interface Workout {
  id: number;
  day: number;
  name: string;
  isCompleted?: boolean;
}

export default function DaySelector({ planId }: DaySelectorProps) {
  const { data: workouts, isLoading } = useQuery<Workout[]>({ 
    queryKey: [`/api/workout-plans/${planId}/workouts`],
    onSuccess: (data) => {
      // If we have workouts but no active day is set, set it to the first day
      if (data?.length > 0 && !activeDay) {
        setActiveDay(data[0].day);
      }
    }
  });
  
  const { activeDay, setActiveDay } = useWorkout();
  
  // Function to get week number (1-indexed)
  const getCurrentWeek = (): number => {
    if (!activeDay) return 1;
    return Math.ceil(activeDay / 7);
  };
  
  // Function to get total weeks in program
  const getTotalWeeks = (): number => {
    if (!workouts || workouts.length === 0) return 1;
    const maxDay = Math.max(...workouts.map(w => w.day));
    return Math.ceil(maxDay / 7);
  };
  
  // Get the days for the current week
  const getCurrentWeekWorkouts = (): Workout[] => {
    if (!workouts || workouts.length === 0) return [];
    
    const currentWeek = getCurrentWeek();
    const startDay = (currentWeek - 1) * 7 + 1;
    const endDay = currentWeek * 7;
    
    return workouts.filter(w => w.day >= startDay && w.day <= endDay);
  };
  
  const handlePrevious = () => {
    if (!workouts || workouts.length === 0 || !activeDay) return;
    
    const currentWeek = getCurrentWeek();
    // If we're at the first day of the week and not in the first week, go to previous week
    if (activeDay % 7 === 1 && currentWeek > 1) {
      // Go to the last day of the previous week
      const prevWeekLastDay = (currentWeek - 1) * 7;
      const workout = workouts.find(w => w.day === prevWeekLastDay);
      if (workout) {
        setActiveDay(workout.day);
      }
    } else if (activeDay % 7 === 1) {
      // If it's Monday but there are previous days, go to the previous day
      const currentIndex = workouts.findIndex((w: Workout) => w.day === activeDay);
      if (currentIndex > 0) {
        setActiveDay(workouts[currentIndex - 1].day);
      }
    } else {
      // Otherwise just go to the previous day
      const currentIndex = workouts.findIndex((w: Workout) => w.day === activeDay);
      if (currentIndex > 0) {
        setActiveDay(workouts[currentIndex - 1].day);
      }
    }
  };
  
  const handleNext = () => {
    if (!workouts || workouts.length === 0 || !activeDay) return;
    
    const currentWeek = getCurrentWeek();
    const totalWeeks = getTotalWeeks();
    
    // If we're at the last day of the week and not in the last week, go to next week
    if (activeDay % 7 === 0 && currentWeek < totalWeeks) {
      // Go to the first day of the next week
      const nextWeekFirstDay = currentWeek * 7 + 1;
      const workout = workouts.find(w => w.day === nextWeekFirstDay);
      if (workout) {
        setActiveDay(workout.day);
      }
    } else if (activeDay % 7 === 0) {
      // If it's Sunday but there's still more days, go to the next day
      const currentIndex = workouts.findIndex((w: Workout) => w.day === activeDay);
      if (currentIndex < workouts.length - 1) {
        setActiveDay(workouts[currentIndex + 1].day);
      }
    } else {
      // Otherwise just go to the next day
      const currentIndex = workouts.findIndex((w: Workout) => w.day === activeDay);
      if (currentIndex < workouts.length - 1) {
        setActiveDay(workouts[currentIndex + 1].day);
      }
    }
  };
  
  if (isLoading) {
    return (
      <div 
        className="mb-8 p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #6A9C89",
          boxShadow: "3px 3px 0 #FFA725",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">
          WEEK 1 <span className="text-lg opacity-70">of 6</span>
        </h2>
        <div className="text-center font-['Courier_Prime'] py-4 text-[#6A9C89]">Loading workout days...</div>
      </div>
    );
  }
  
  if (!workouts || workouts.length === 0) {
    return (
      <div 
        className="mb-8 p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #6A9C89",
          boxShadow: "3px 3px 0 #FFA725",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">
          WEEK 1 <span className="text-lg opacity-70">of 6</span>
        </h2>
        <div className="text-center font-['Courier_Prime'] py-4 text-[#6A9C89]">No workout days available</div>
      </div>
    );
  }
  
  return (
    <div 
      className="mb-8 p-5 overflow-hidden"
      style={{
        backgroundColor: "#FFF8DC",
        border: "2px solid #6A9C89",
        boxShadow: "3px 3px 0 #FFA725",
        position: "relative"
      }}
    >
      <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">
        WEEK {getCurrentWeek()} <span className="text-lg opacity-70">of {getTotalWeeks()}</span>
      </h2>
      
      <div className="flex justify-center pb-4 overflow-x-auto" style={{ scrollBehavior: "smooth" }}>
        <div className="flex space-x-4 px-4 mx-auto">
          {getCurrentWeekWorkouts().map((workout: Workout) => (
            <div 
              key={workout.id}
              className={`flex-shrink-0 cursor-pointer`}
              style={{
                transition: "all 0.2s ease",
                transform: activeDay === workout.day ? "scale(1.1)" : "scale(1)"
              }}
              onClick={() => setActiveDay(workout.day)}
            >
              <div 
                className={`px-4 py-3 rounded-full font-['Bebas_Neue'] text-center min-w-[60px] text-sm ${
                  activeDay === workout.day 
                    ? "bg-[#6A9C89] text-[#FFF8DC]" 
                    : "bg-[#C1D8C3] hover:bg-[#6A9C89] hover:text-[#FFF8DC]"
                } ${workout.isCompleted ? "" : "opacity-50"}`}
              >
                <div className="text-xl">
                  {WEEKDAYS[(workout.day - 1) % 7]}
                  {activeDay === workout.day && <div className="h-1 w-10 bg-[#FFF8DC] rounded-full mx-auto mt-1"></div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-between mt-4">
        <button 
          className="bg-[#FFA725] text-[#FFF8DC] font-['Bebas_Neue'] px-4 py-1 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
          onClick={handlePrevious}
          disabled={!activeDay || activeDay <= 1}
        >
          <i className="fas fa-chevron-left mr-1"></i> {activeDay && activeDay % 7 === 1 && getCurrentWeek() > 1 ? "PREVIOUS WEEK" : "PREVIOUS"}
        </button>
        
        <button 
          className="bg-[#FFA725] text-[#FFF8DC] font-['Bebas_Neue'] px-4 py-1 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
          onClick={handleNext}
          disabled={!activeDay || activeDay >= workouts[workouts.length - 1].day}
        >
          {activeDay && activeDay % 7 === 0 && getCurrentWeek() < getTotalWeeks() ? "NEXT WEEK" : "NEXT"} <i className="fas fa-chevron-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}
