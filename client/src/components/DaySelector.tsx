import { useQuery } from "@tanstack/react-query";
import { useWorkout } from "@/lib/workoutContext";

interface DaySelectorProps {
  planId: number;
}

export default function DaySelector({ planId }: DaySelectorProps) {
  const { data: workouts, isLoading } = useQuery({ 
    queryKey: [`/api/workout-plans/${planId}/workouts`] 
  });
  
  const { activeDay, setActiveDay } = useWorkout();
  
  const handlePrevious = () => {
    if (!workouts || workouts.length === 0 || !activeDay) return;
    
    const currentIndex = workouts.findIndex(w => w.day === activeDay);
    if (currentIndex > 0) {
      setActiveDay(workouts[currentIndex - 1].day);
    }
  };
  
  const handleNext = () => {
    if (!workouts || workouts.length === 0 || !activeDay) return;
    
    const currentIndex = workouts.findIndex(w => w.day === activeDay);
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
          border: "2px solid #8B4513",
          boxShadow: "3px 3px 0 #8B4513",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#8B4513] text-center mb-4 tracking-wider">WORKOUT CALENDAR</h2>
        <div className="text-center font-['Courier_Prime'] py-4">Loading workout days...</div>
      </div>
    );
  }
  
  if (!workouts || workouts.length === 0) {
    return (
      <div 
        className="mb-8 p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #8B4513",
          boxShadow: "3px 3px 0 #8B4513",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#8B4513] text-center mb-4 tracking-wider">WORKOUT CALENDAR</h2>
        <div className="text-center font-['Courier_Prime'] py-4">No workout days available</div>
      </div>
    );
  }
  
  return (
    <div 
      className="mb-8 p-5 overflow-hidden"
      style={{
        backgroundColor: "#FFF8DC",
        border: "2px solid #8B4513",
        boxShadow: "3px 3px 0 #8B4513",
        position: "relative"
      }}
    >
      <h2 className="text-2xl font-['Bebas_Neue'] text-[#8B4513] text-center mb-4 tracking-wider">WORKOUT CALENDAR</h2>
      
      <div className="flex overflow-x-auto pb-4" style={{ scrollBehavior: "smooth" }}>
        {workouts.map((workout) => (
          <div 
            key={workout.id}
            className={`flex-shrink-0 mx-1 first:ml-0 last:mr-0 cursor-pointer`}
            style={{
              transition: "all 0.2s ease",
              transform: activeDay === workout.day ? "scale(1.1)" : "scale(1)"
            }}
            onClick={() => setActiveDay(workout.day)}
          >
            <div 
              className={`px-4 py-2 rounded-full font-['Bebas_Neue'] text-center min-w-[70px] text-sm ${
                activeDay === workout.day 
                  ? "bg-[#8B4513] text-[#FFF8DC]" 
                  : "bg-[#D2B48C] hover:bg-[#8B4513] hover:text-[#FFF8DC]"
              } ${workout.isCompleted ? "" : "opacity-50"}`}
            >
              <div>{activeDay === workout.day ? "TODAY" : "DAY"}</div>
              <div className="text-xl">{workout.day}</div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex justify-between mt-4">
        <button 
          className="bg-[#8B4513] text-[#FFF8DC] font-['Bebas_Neue'] px-4 py-1 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
          onClick={handlePrevious}
          disabled={!activeDay || workouts.findIndex(w => w.day === activeDay) <= 0}
        >
          <i className="fas fa-chevron-left mr-1"></i> PREVIOUS
        </button>
        
        <button 
          className="bg-[#8B4513] text-[#FFF8DC] font-['Bebas_Neue'] px-4 py-1 rounded shadow-md hover:bg-opacity-90 transition-all duration-100 ease-in-out"
          style={{
            transition: "all 0.1s ease-in-out"
          }}
          onClick={handleNext}
          disabled={!activeDay || workouts.findIndex(w => w.day === activeDay) >= workouts.length - 1}
        >
          NEXT <i className="fas fa-chevron-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}
