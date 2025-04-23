import { useQuery, useMutation } from "@tanstack/react-query";
import { useWorkout } from "@/lib/workoutContext";
import { apiRequest } from "@/lib/queryClient";
import UploadSection from "./UploadSection";
import ProgressTracker from "./ProgressTracker";
import DaySelector from "./DaySelector";
import CurrentWorkout from "./CurrentWorkout";
import WorkoutTimer from "./WorkoutTimer";
import { useEffect } from "react";

export default function WorkoutApp() {
  const { activePlan, setActivePlan } = useWorkout();

  const { data: plans, refetch } = useQuery({
    queryKey: ["/api/workout-plans"],
    queryFn: () =>
      apiRequest("GET", "/api/workout-plans").then((res) => res.json()),
    staleTime: 0,
  });

  const deletePlanMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/workout-plans/${id}`);
    },
    onSuccess: () => {
      refetch();
      setActivePlan(null);
    },
  });

  useEffect(() => {
    if (!activePlan && plans?.length) {
      setActivePlan(plans[0]);
    }
  }, [plans, activePlan, setActivePlan]);

  return (
    <div
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: "#FFF5E4",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-Bangers text-[#6A9C89] mb-4 tracking-wide">
            WORKOUT TRACKER
          </h1>
          <p className="font-Courier_Prime text-[#6A9C89] text-lg font-bold">
            Track your progress • Build your strength • Achieve your goals
          </p>
          <div className="mt-3 flex justify-center">
            <div className="h-2 w-64 bg-[#FFA725] rounded"></div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-1">
            <UploadSection />

            {plans?.length && activePlan && (
              <div
                className="mb-6 p-4 rounded border-2 shadow"
                style={{
                  backgroundColor: "#FFF5E4",
                  borderColor: "#6A9C89",
                  boxShadow: "3px 3px 0 #FFA725",
                }}
              >
                <label className="block font-Courier_Prime text-[#6A9C89] mb-2 text-sm">
                  Select a Workout Plan:
                </label>
                <div className="flex gap-2 items-center">
                  <select
                    value={activePlan.id}
                    onChange={(e) => {
                      const selectedId = Number(e.target.value);
                      const selectedPlan = plans.find(
                        (plan) => plan.id === selectedId
                      );
                      if (selectedPlan) {
                        setActivePlan(selectedPlan);
                      }
                    }}
                    className="flex-1 p-2 border border-[#A9C0A6] bg-white rounded font-Courier_Prime"
                  >
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this plan?")
                      ) {
                        deletePlanMutation.mutate(activePlan.id);
                      }
                    }}
                    className="px-3 py-1 text-[#FFF5E4] bg-[#EE6C4D] text-sm rounded shadow hover:bg-opacity-90 transition-all font-Courier_Prime"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}

            {activePlan && <ProgressTracker planId={activePlan.id} />}
          </div>

          {/* Right Column */}
          <div className="lg:col-span-2">
            {activePlan ? (
              <>
                <DaySelector planId={activePlan.id} />
                <CurrentWorkout />
                <WorkoutTimer />
              </>
            ) : (
              <div
                className="p-8 rounded-lg shadow-md text-center"
                style={{
                  backgroundColor: "#FFF5E4",
                  border: "2px solid #6A9C89",
                  boxShadow: "3px 3px 0 #FFA725",
                  position: "relative",
                }}
              >
                <div className="font-Pacifico text-[#6A9C89] text-3xl mb-4">
                  Welcome to Workout Tracker!
                </div>
                <p className="font-Courier_Prime text-[#FFA725] mb-6 font-bold">
                  Please upload a workout plan to get started with your fitness
                  journey.
                </p>
                <div className="h-px w-full bg-[#C1D8C3] opacity-40 my-4"></div>
                <p className="font-Courier_Prime text-[#6A9C89] text-sm opacity-75 italic mt-4">
                  "The only bad workout is the one that didn't happen."
                </p>
              </div>
            )}
          </div>
        </div>

        <footer className="mt-12 text-center font-Courier_Prime text-[#6A9C89] text-sm">
          <p>
            © {new Date().getFullYear()} Workout Tracker • Keep pushing, keep
            growing
          </p>
        </footer>
      </div>
    </div>
  );
}
