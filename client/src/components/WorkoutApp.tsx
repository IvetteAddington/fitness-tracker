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
        backgroundColor: "#FFF5E4",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center"
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-['Bangers'] text-[#6A9C89] mb-4 tracking-wide">WORKOUT TRACKER</h1>
          <p className="font-['Courier_Prime'] text-[#6A9C89] text-lg font-bold">Track your progress • Build your strength • Achieve your goals</p>
          <div className="mt-3 flex justify-center">
            <div className="h-2 w-64 bg-[#FFA725] rounded"></div>
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
                  backgroundColor: "#FFF5E4",
                  border: "2px solid #6A9C89",
                  boxShadow: "3px 3px 0 #FFA725",
                  position: "relative"
                }}
              >
                <div className="font-['Pacifico'] text-[#6A9C89] text-3xl mb-4">
                  Welcome to Workout Tracker!
                </div>
                <p className="font-['Courier_Prime'] text-[#FFA725] mb-6 font-bold">
                  Please upload a workout plan to get started with your fitness journey.
                </p>
                <div className="h-px w-full bg-[#C1D8C3] opacity-40 my-4"></div>
                <p className="font-['Courier_Prime'] text-[#6A9C89] text-sm opacity-75 italic mt-4">
                  "The only bad workout is the one that didn't happen."
                </p>
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-12 text-center font-['Courier_Prime'] text-[#6A9C89] text-sm">
          <p>© {new Date().getFullYear()} Workout Tracker • Keep pushing, keep growing</p>
        </footer>
      </div>
    </div>
  );
}
