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
        backgroundImage: "url('https://images.unsplash.com/photo-1583377997996-9ef7ded719db?auto=format&fit=crop&q=80&w=1200&ixlib=rb-4.0.3')",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center"
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-['Permanent_Marker'] text-[#8B4513] mb-2 tracking-wide">VINTAGE WORKOUT TRACKER</h1>
          <p className="font-['Courier_Prime'] text-[#8B4513] text-lg">Track your progress • Build your strength • Achieve your goals</p>
          <div className="mt-2 flex justify-center">
            <div className="h-1 w-64 bg-[#CD5C5C] rounded"></div>
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
                  backgroundColor: "#FFF8DC",
                  border: "2px solid #8B4513",
                  boxShadow: "3px 3px 0 #8B4513",
                  position: "relative"
                }}
              >
                <div className="font-['Permanent_Marker'] text-[#8B4513] text-2xl mb-4">
                  Welcome to Vintage Workout Tracker!
                </div>
                <p className="font-['Courier_Prime'] text-[#8B4513] mb-6">
                  Please upload a workout plan to get started with your fitness journey.
                </p>
                <div className="h-px w-full bg-[#8B4513] opacity-20 my-4"></div>
                <p className="font-['Courier_Prime'] text-[#8B4513] text-sm opacity-75 italic mt-4">
                  "The only bad workout is the one that didn't happen."
                </p>
              </div>
            )}
          </div>
        </div>
        
        <footer className="mt-12 text-center font-['Courier_Prime'] text-[#8B4513] text-sm">
          <p>© {new Date().getFullYear()} Vintage Workout Tracker • Keep pushing, keep growing</p>
        </footer>
      </div>
    </div>
  );
}
