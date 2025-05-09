import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isPast, isSameDay } from "date-fns";
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface ProgressTrackerProps {
  planId: number;
}

interface Workout {
  id: number;
  day: number;
  name: string;
  completedAt?: string;
}

interface Progress {
  userId: number;
  workoutPlanId: number;
  completedDays: number;
  completedWorkoutIds: number[];
  currentStreak: number;
  longestStreak: number;
  id: number;
}

interface ProgressData {
  progress: Progress;
  completionPercentage: number;
  totalDays: number;
  recentCompletedWorkouts: Workout[];
}

export default function ProgressTracker({ planId }: ProgressTrackerProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [showMonthView, setShowMonthView] = useState(false);
  
  const { data, isLoading } = useQuery<ProgressData>({
    queryKey: [`/api/workout-plans/${planId}/progress`],
  });

  if (isLoading) {
    return (
      <div 
        className="p-5"
        style={{
          backgroundColor: "#FFF5E4",
          border: "2px solid #6A9C89",
          boxShadow: "3px 3px 0 #FFA725",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">PROGRESS TRACKER</h2>
        <div className="text-center font-['Courier_Prime'] py-4">Loading progress data...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div 
        className="p-5"
        style={{
          backgroundColor: "#FFF5E4",
          border: "2px solid #6A9C89",
          boxShadow: "3px 3px 0 #FFA725",
          position: "relative"
        }}
      >
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] text-center mb-4 tracking-wider">PROGRESS TRACKER</h2>
        <div className="text-center font-['Courier_Prime'] py-4">No progress data available</div>
      </div>
    );
  }

  const { progress, completionPercentage, totalDays, recentCompletedWorkouts } = data;
  
  // Function to check if a date has a completed workout
  const hasCompletedWorkout = (day: Date) => {
    return recentCompletedWorkouts.some(workout => 
      workout.completedAt && isSameDay(new Date(workout.completedAt), day)
    );
  };

  return (
    <div 
      className="p-5"
      style={{
        backgroundColor: "#FFF5E4",
        border: "2px solid #6A9C89",
        boxShadow: "3px 3px 0 #FFA725",
        position: "relative"
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-['Bebas_Neue'] text-[#6A9C89] tracking-wider">PROGRESS TRACKER</h2>
        <button 
          onClick={() => setShowMonthView(!showMonthView)}
          className="font-['Bebas_Neue'] text-sm px-3 py-1 rounded"
          style={{
            backgroundColor: showMonthView ? "#FFA725" : "#6A9C89",
            color: "#FFF5E4"
          }}
        >
          {showMonthView ? "SHOW STATS" : "MONTHLY VIEW"}
        </button>
      </div>
      
      {/* Progress Bar - Always visible */}
      <div className="mb-4">
        <div className="flex justify-between font-['Courier_Prime'] text-sm text-[#FFA725] mb-1">
          <span>DAY 1</span>
          <span>{progress.completedDays}/{totalDays} DAYS ({completionPercentage}%)</span>
          <span>DAY {totalDays}</span>
        </div>
        <div 
          className="rounded-full overflow-hidden"
          style={{
            height: "20px",
            backgroundColor: "#FFF8DC",
            border: "2px solid #6A9C89",
            boxShadow: "inset 0 0 5px rgba(0,0,0,0.2)"
          }}
        >
          <div 
            className="h-full"
            style={{
              width: `${completionPercentage}%`,
              backgroundColor: "#C1D8C3"
            }}
          ></div>
        </div>
      </div>
      
      {showMonthView ? (
        // Monthly Calendar View
        <div className="mt-6">
          <h3 className="font-['Bebas_Neue'] text-xl text-[#FFA725] mb-3">MONTHLY VIEW</h3>
          <div className="bg-[#FFF8DC] p-4 font-['Courier_Prime'] rounded">
            <div className="text-center mb-3 font-bold">
              {format(date, 'MMMM yyyy')}
            </div>
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && setDate(newDate)}
              className="w-full bg-[#FFF8DC] border-0 rounded-md"
              components={{
                Day: (props) => {
                  const isCompleted = hasCompletedWorkout(props.date);
                  const isToday = new Date().toDateString() === props.date.toDateString();
                  const isSelected = date.toDateString() === props.date.toDateString();
                  
                  return (
                    <div className="relative w-9 h-9" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {/* Background for completed days */}
                      {isCompleted && !isToday && !isSelected && (
                        <div 
                          className="absolute inset-0 rounded-full" 
                          style={{
                            backgroundColor: "#C1D8C3",
                            zIndex: 0
                          }}
                        ></div>
                      )}
                      
                      {/* Today marker */}
                      {isToday && (
                        <div 
                          className="absolute inset-0 rounded-full" 
                          style={{
                            backgroundColor: "#FFA725",
                            zIndex: 0
                          }}
                        ></div>
                      )}
                      
                      {/* Selected day marker */}
                      {isSelected && !isToday && (
                        <div 
                          className="absolute inset-0 rounded-full" 
                          style={{
                            backgroundColor: "#6A9C89",
                            zIndex: 0
                          }}
                        ></div>
                      )}
                      
                      <div className={`relative z-10 flex items-center justify-center w-full h-full text-center ${
                        (isToday || isSelected) ? "text-[#FFF5E4] font-bold" : 
                        isCompleted ? "font-bold text-[#6A9C89]" : ""
                      }`} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {props.date.getDate()}
                      </div>
                    </div>
                  );
                }
              }}
              classNames={{
                day: cn("h-9 w-9 p-0 font-normal flex items-center justify-center aria-selected:opacity-100"),
                cell: "p-0 relative text-center flex items-center justify-center",
                head_cell: "flex items-center justify-center w-9 font-normal text-[0.8rem]",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-[#6A9C89] font-bold",
                table: "w-full border-collapse space-y-1",
                head_row: "flex justify-center",
                row: "flex w-full mt-2 justify-center",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-[#6A9C89]",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                day_outside: "text-muted-foreground opacity-50",
              }}
            />
            <div className="flex items-center justify-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#C1D8C3" }}></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#FFA725" }}></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#6A9C89" }}></div>
                <span>Selected</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Standard Stats View
        <>
          <div className="mt-6">
            <h3 className="font-['Bebas_Neue'] text-xl text-[#FFA725] mb-2">WORKOUT STATS</h3>
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
            <h3 className="font-['Bebas_Neue'] text-xl text-[#FFA725] mb-2">RECENT ACTIVITY</h3>
            <div className="bg-[#FFF8DC] p-3 font-['Courier_Prime'] text-sm">
              {recentCompletedWorkouts.length > 0 ? (
                recentCompletedWorkouts.map((workout) => (
                  <div 
                    key={workout.id}
                    className="mb-2 pb-2 border-b border-[#C1D8C3] last:border-b-0 last:mb-0 last:pb-0"
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
        </>
      )}
    </div>
  );
}
