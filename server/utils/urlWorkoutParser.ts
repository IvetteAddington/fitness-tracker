import { workoutPlanFileSchema, WorkoutPlanFile } from "@shared/schema";
import { load } from "cheerio";

/**
 * Fetch a remote URL (video page or article) and attempt to parse a workout routine
 * from its textual content. The algorithm is intentionally simple – it looks for
 * lines that start with "Day X" (where X is a number) to denote workout days
 * and then treats the subsequent non-empty lines as exercise descriptions until
 * the next "Day X" marker (or end of file).
 *
 * Each exercise description may optionally include the number of sets and reps
 * (e.g. "Bench Press – 3 sets, 8-10 reps"). If that information is missing we
 * fall back to sensible defaults (3 sets, "10" reps).
 */
export async function parseWorkoutPlanFromURL(url: string): Promise<WorkoutPlanFile> {
  // ---------------------------------------------------------------------------
  // 1. Fetch the remote content
  // ---------------------------------------------------------------------------
  let res: Response;
  try {
    res = await fetch(url, { redirect: "follow" });
  } catch (err) {
    throw new Error(`Network error while fetching URL: ${(err as Error).message}`);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch URL. HTTP ${res.status}: ${res.statusText}`);
  }

  // Limit payload size to ~1 MB to avoid OOM when users pass giant pages
  const maxBytes = 1024 * 1024;
  const reader = res.body?.getReader();
  let rawText = "";
  if (reader) {
    const decoder = new TextDecoder();
    let received = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      received += value.length;
      if (received > maxBytes) {
        reader.cancel();
        throw new Error("Response too large – aborting");
      }
      rawText += decoder.decode(value, { stream: true });
    }
    rawText += decoder.decode();
  } else {
    rawText = await res.text();
  }

  const contentType = (res.headers.get("content-type") ?? "").toLowerCase();

  // ---------------------------------------------------------------------------
  // 2. If the remote resource is JSON, attempt to parse it directly – this lets
  //    the feature support raw JSON files that already match WorkoutPlanFile.
  // ---------------------------------------------------------------------------
  try {
    const data = JSON.parse(rawText);
    return workoutPlanFileSchema.parse(data);
  } catch (_) {
    /* Not JSON – continue with HTML/plain-text parsing */
  }

  // ---------------------------------------------------------------------------
  // 3. For HTML documents extract text content. For everything else just keep
  //    the raw text.
  // ---------------------------------------------------------------------------
  let textContent = rawText;
  if (contentType.includes("html") || url.endsWith(".html") || url.includes("youtube.com")) {
    const $ = load(rawText);
    textContent = $("body").text();
  }
  // Simple CSV detection
  else if (contentType.includes("csv") || url.endsWith(".csv")) {
    // already plain text – keep as is
  }

  // ---------------------------------------------------------------------------
  // 4. Prepare the text: break into trimmed, non-empty lines.
  // ---------------------------------------------------------------------------
  const lines = textContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length === 0) {
    throw new Error("The provided URL does not contain any parsable text content");
  }

  // ---------------------------------------------------------------------------
  // 5. Walk through the lines and build the workout structure.
  // ---------------------------------------------------------------------------
  interface MutableWorkout {
    day: number;
    name: string;
    notes: string;
    exercises: Array<{ name: string; sets: number; reps: string; notes: string }>;
  }

  const workouts: MutableWorkout[] = [];
  let currentWorkout: MutableWorkout | null = null;

  const dayRegex = /day\s*(\d+)\s*[:\-]?\s*(.*)/i;

  for (const line of lines) {
    const dayMatch = line.match(dayRegex);
    if (dayMatch) {
      // Encountered a new day marker – save the previous workout (if any)
      if (currentWorkout) {
        workouts.push(currentWorkout);
      }
      const day = parseInt(dayMatch[1], 10);
      const workoutName = dayMatch[2] ? dayMatch[2].trim() : `Day ${day}`;
      currentWorkout = {
        day,
        name: workoutName,
        notes: "",
        exercises: [],
      };
      continue;
    }

    // Not a new day and we have no active workout – skip until we hit one.
    if (!currentWorkout) {
      continue;
    }

    // Try to parse an exercise line
    const exercise = parseExerciseLine(line);
    if (exercise) {
      currentWorkout.exercises.push(exercise);
    }
  }

  // Push the last workout, if any
  if (currentWorkout) {
    workouts.push(currentWorkout);
  }

  if (workouts.length === 0) {
    throw new Error("Could not locate any workout data in the provided URL");
  }

  // ---------------------------------------------------------------------------
  // 6. Assemble the final plan object and validate with Zod.
  // ---------------------------------------------------------------------------
  const workoutPlan: WorkoutPlanFile = {
    name: derivePlanNameFromURL(url),
    totalDays: workouts.length,
    workouts,
  } as WorkoutPlanFile;

  return workoutPlanFileSchema.parse(workoutPlan);
}

// ───────────────────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────────────────

function derivePlanNameFromURL(url: string): string {
  try {
    const { hostname, pathname } = new URL(url);
    return `Imported from ${hostname}${pathname.split("/").slice(0, 3).join("/")}`;
  } catch {
    return "Imported Workout Plan";
  }
}

function parseExerciseLine(line: string): { name: string; sets: number; reps: string; notes: string } | null {
  // Attempt to capture patterns like:
  //  - "Bench Press – 3 sets, 8-10 reps"
  //  - "Squats - 4x12"
  //  - "Plank 60 seconds"

  // Normalise dashes
  const normalised = line.replace(/[–—]/g, "-");

  // Regex groups:
  // 1. Exercise name (greedy until first dash or comma with digits)
  // 2. Sets (optional)
  // 3. Reps or time (optional)
  const match = normalised.match(/^(.*?)\s*(?:[-|:]\s*)?(?:(\d+)\s*(?:sets?|x))?\s*[,|-]?\s*(?:(\d+(?:-\d+)?\s*(?:reps?|sec|seconds?|min|minutes?)?))?/i);
  if (!match) return null;

  const name = match[1].trim();
  if (name.length === 0) return null;

  const sets = match[2] ? parseInt(match[2], 10) : 3;
  const reps = match[3] ? match[3].replace(/\s*(reps?|seconds?|sec|min|minutes?)\s*/i, "").trim() : "10";

  return {
    name,
    sets: isNaN(sets) ? 3 : sets,
    reps: reps.length > 0 ? reps : "10",
    notes: "",
  };
}