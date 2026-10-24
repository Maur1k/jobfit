import { afterEach, describe, expect, it } from "vitest";
import { db } from "../db/schema";
import {
  defaultOnboarding,
  deleteAllData,
  getGeminiKey,
  getOnboarding,
  removeGeminiKey,
  setGeminiKey,
  setOnboarding,
} from "./store";

afterEach(async () => {
  await deleteAllData();
});

describe("settings store", () => {
  it("gets, sets, and removes the Gemini key", async () => {
    expect(await getGeminiKey()).toBeNull();
    await setGeminiKey("AIzaTEST_FAKE_KEY_0000");
    expect(await getGeminiKey()).toBe("AIzaTEST_FAKE_KEY_0000");
    await removeGeminiKey();
    expect(await getGeminiKey()).toBeNull();
  });

  it("gets the default onboarding state and persists updates", async () => {
    expect(await getOnboarding()).toEqual(defaultOnboarding());
    const state = { step: 4, completed: false, skipped: true };
    await setOnboarding(state);
    expect(await getOnboarding()).toEqual(state);
  });

  it("clears all application tables", async () => {
    await db.resumes.add({ name: "Resume", source: "manual", content: {}, updatedAt: Date.now() });
    await db.tailored.add({ resumeId: 1, jobDescription: "Job", output: {}, createdAt: Date.now() });
    await db.applications.add({ company: "Acme", role: "Analyst", status: "Saved" });
    await setGeminiKey("AIzaTEST_FAKE_KEY_0000");
    await deleteAllData();

    expect(await db.resumes.count()).toBe(0);
    expect(await db.tailored.count()).toBe(0);
    expect(await db.applications.count()).toBe(0);
    expect(await db.settings.count()).toBe(0);
  });
});
