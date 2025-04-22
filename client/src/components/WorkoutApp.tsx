import UploadSection from "./UploadSection";
import ProgressTracker from "./ProgressTracker";
import DaySelector from "./DaySelector";
import CurrentWorkout from "./CurrentWorkout";
import WorkoutTimer from "./WorkoutTimer";
import { useWorkout } from "@/lib/workoutContext";

export default function WorkoutApp() {
  const { activePlan } = useWorkout();

  return (
    <div 
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "#FF8282",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center"
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-['Bungee_Shade'] text-[#73E2D6] mb-4 tracking-wide">FIT TRACKER</h1>
          <p className="font-['Courier_Prime'] text-[#ffffff] text-lg font-bold">Track your progress • Build your strength • Achieve your goals</p>
          <div className="mt-3 flex justify-center">
            <div className="h-2 w-64 bg-[#EE6C4D] rounded"></div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Upload and Progress */}
          <div className="lg:col-span-1">
            <UploadSection />
            
            {activePlan && (
              <ProgressTracker planId={activePlan.id} />
            )}
          </div>
          
          {/* Right Column - Daily Workout View */}
          <div className="lg:col-span-2">
            {activePlan && (
              <>
                <DaySelector planId={activePlan.id} />
                <CurrentWorkout />
                <WorkoutTimer />
              </>
            )}
            
            {!activePlan && (
              <div 
                className="p-8 rounded-lg shadow-md text-center"
                style={{
                  backgroundColor: "#F5F5DC",
                  border: "2px solid #73E2D6",
                  boxShadow: "3px 3px 0 #F4B942",
                  position: "relative"
                }}
              >
                <div className="font-['Pacifico'] text-[#73E2D6] text-3xl mb-4">
                  Welcome to Fit Tracker!
                </div>
                <p className="font-['Courier_Prime'] text-[#F4B942] mb-6 font-bold">
                  Please upload a workout plan to get started with your fitness journey.
                </p>
                <div className="h-px w-full bg-[#EE6C4D] opacity-40 my-4"></div>
                <p className="font-['Courier_Prime'] text-[#F4B942] text-sm opacity-75 italic mt-4">
                  "The only bad workout is the one that didn't happen."
                </p>
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-12 text-center font-['Courier_Prime'] text-[#ffffff] text-sm">
          <p>© {new Date().getFullYear()} Fit Tracker • Keep pushing, keep growing</p>
        </footer>
      </div>
    </div>
  );
}
