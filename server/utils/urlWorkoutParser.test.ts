import { describe, it, expect, vi } from "vitest";
import { parseWorkoutPlanFromURL } from "./urlWorkoutParser";

// Mock fetch
const globalAny: any = global;

function mockFetch(responseText: string, contentType: string = "text/plain") {
  globalAny.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      statusText: "OK",
      headers: {
        get: () => contentType,
      },
      body: undefined,
      text: () => Promise.resolve(responseText),
    }),
  );
}

describe("parseWorkoutPlanFromURL", () => {
  it("parses simple text format", async () => {
    const sample = `Day 1: Upper Body\nBench Press - 3 sets, 8 reps\nPull Ups 3xMax\n\nDay 2 - Lower Body\nSquats 4x10\nDeadlift - 3 sets, 6 reps`;
    mockFetch(sample);

    const result = await parseWorkoutPlanFromURL("https://example.com/workout.txt");
    expect(result.totalDays).toBe(2);
    expect(result.workouts[0].exercises.length).toBe(2);
    expect(result.workouts[1].exercises[1].name.toLowerCase()).toBe("deadlift");
  });

  it("throws on empty content", async () => {
    mockFetch("");
    await expect(parseWorkoutPlanFromURL("https://example.com/empty"))
      .rejects.toThrowError();
  });
});