import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";

interface ProgressTrackerProps {
  planId: number;
}

export default function ProgressTracker({ planId }: ProgressTrackerProps) {
  const { data, isLoading } = useQuery({
    queryKey: [`/api/workout-plans/${planId}/progress`],
  });

  if (isLoading) {
    return (
      <div 
        className="p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #8B4513",
          boxShadow: "3px 3px 0 #8B4513",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#8B4513] text-center mb-4 tracking-wider">PROGRESS TRACKER</h2>
        <div className="text-center font-['Courier_Prime'] py-4">Loading progress data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div 
        className="p-5"
        style={{
          backgroundColor: "#FFF8DC",
          border: "2px solid #8B4513",
          boxShadow: "3px 3px 0 #8B4513",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#8B4513] text-center mb-4 tracking-wider">PROGRESS TRACKER</h2>
        <div className="text-center font-['Courier_Prime'] py-4">No progress data available</div>
      </div>
    );
  }

  const { progress, completionPercentage, totalDays, recentCompletedWorkouts } = data;

  return (
    <div 
      className="p-5"
      style={{
        backgroundColor: "#FFF8DC",
        border: "2px solid #8B4513",
        boxShadow: "3px 3px 0 #8B4513",
        position: "relative"
      }}
    >
      <h2 className="text-2xl font-['Bebas_Neue'] text-[#8B4513] text-center mb-4 tracking-wider">PROGRESS TRACKER</h2>
      
      <div className="mb-4">
        <div className="flex justify-between font-['Courier_Prime'] text-sm text-[#8B4513] mb-1">
          <span>DAY 1</span>
          <span>{progress.completedDays}/{totalDays} DAYS ({completionPercentage}%)</span>
          <span>DAY {totalDays}</span>
        </div>
        <div 
          className="rounded-full overflow-hidden"
          style={{
            height: "20px",
            backgroundColor: "#D2B48C",
            border: "2px solid #8B4513",
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)"
          }}
        >
          <div 
            className="h-full"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: "#556B2F"
            }}
          ></div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="font-['Bebas_Neue'] text-xl text-[#8B4513] mb-2">WORKOUT STATS</h3>
        <div className="bg-[#FFF8DC] p-4 font-['Courier_Prime'] text-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex justify-between">
              <span>Current Streak:</span>
              <span className="font-bold">{progress.currentStreak} days</span>
            </div>
            <div className="flex justify-between">
              <span>Longest Streak:</span>
              <span className="font-bold">{progress.longestStreak} days</span>
            </div>
            <div className="flex justify-between">
              <span>Completion Rate:</span>
              <span className="font-bold">{completionPercentage}%</span>
            </div>
            <div className="flex justify-between">
              <span>Days Remaining:</span>
              <span className="font-bold">{totalDays - progress.completedDays}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h3 className="font-['Bebas_Neue'] text-xl text-[#8B4513] mb-2">RECENT ACTIVITY</h3>
        <div className="bg-[#FFF8DC] p-3 font-['Courier_Prime'] text-sm">
          {recentCompletedWorkouts.length > 0 ? (
            recentCompletedWorkouts.map((workout) => (
              <div 
                key={workout.id}
                className="mb-2 pb-2 border-b border-[#D2B48C] last:border-b-0 last:mb-0 last:pb-0"
              >
                <div className="flex justify-between">
                  <span className="font-bold">Day {workout.day} - {workout.name}</span>
                  <span>
                    {workout.completedAt 
                      ? formatDistanceToNow(new Date(workout.completedAt), { addSuffix: true }) 
                      : 'Unknown date'}
                  </span>
                </div>
                <p className="text-xs opacity-75">Completed workout</p>
              </div>
            ))
          ) : (
            <div className="text-center py-2 italic opacity-75">
              No completed workouts yet. Get started!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
