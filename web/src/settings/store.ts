import type { OnboardingState } from "../onboarding/types";
import { db } from "../db/schema";

const GEMINI_KEY = "geminiKey";
const ONBOARDING = "onboarding";

export const defaultOnboarding = (): OnboardingState => ({ step: 1, completed: false, skipped: false });

export async function getGeminiKey(): Promise<string | null> {
  const setting = await db.settings.get(GEMINI_KEY);
  return typeof setting?.value === "string" ? setting.value : null;
}

export async function setGeminiKey(key: string): Promise<void> {
  await db.settings.put({ key: GEMINI_KEY, value: key });
}

export async function removeGeminiKey(): Promise<void> {
  await db.settings.delete(GEMINI_KEY);
}

export async function getOnboarding(): Promise<OnboardingState> {
  const setting = await db.settings.get(ONBOARDING);
  if (!setting?.value || typeof setting.value !== "object") return defaultOnboarding();
  return { ...defaultOnboarding(), ...(setting.value as Partial<OnboardingState>) };
}

export async function setOnboarding(state: OnboardingState): Promise<void> {
  await db.settings.put({ key: ONBOARDING, value: state });
}

export async function deleteAllData(): Promise<void> {
  await Promise.all([db.resumes.clear(), db.tailored.clear(), db.applications.clear(), db.settings.clear()]);
}
