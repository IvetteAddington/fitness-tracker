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
    queryKey: [`/api/workout-plans/${planId}/workouts`] 
  });
  
  const { activeDay, setActiveDay } = useWorkout();
  
  const handlePrevious = () => {
    if (!workouts || workouts.length === 0 || !activeDay) return;
    
    const currentIndex = workouts.findIndex((w: Workout) => w.day === activeDay);
    if (currentIndex > 0) {
      setActiveDay(workouts[currentIndex - 1].day);
    }
  };
  
  const handleNext = () => {
    if (!workouts || workouts.length === 0 || !activeDay) return;
    
    const currentIndex = workouts.findIndex((w: Workout) => w.day === activeDay);
    if (currentIndex < workouts.length - 1) {
      setActiveDay(workouts[currentIndex + 1].day);
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
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">WORKOUT CALENDAR</h2>
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
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">WORKOUT CALENDAR</h2>
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
      <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">WORKOUT CALENDAR</h2>
      
      <div className="flex justify-center pb-4 overflow-x-auto" style={{ scrollBehavior: "smooth" }}>
        <div className="flex space-x-4 px-4 mx-auto">
          {workouts.map((workout: Workout) => (
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
          disabled={!activeDay || workouts.findIndex((w: Workout) => w.day === activeDay) <= 0}
        >
          <i className="fas fa-chevron-left mr-1"></i> PREVIOUS
        </button>
        
        <button 
          className="bg-[#FFA725] text-[#FFF8DC] font-['Bebas_Neue'] px-4 py-1 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
          onClick={handleNext}
          disabled={!activeDay || workouts.findIndex((w: Workout) => w.day === activeDay) >= workouts.length - 1}
        >
          NEXT <i className="fas fa-chevron-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}
