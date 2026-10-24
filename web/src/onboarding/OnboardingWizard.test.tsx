import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { db } from "../db/schema";
import { testKey } from "../lib/api";
import { getGeminiKey, getOnboarding, setGeminiKey, setOnboarding, deleteAllData } from "../settings/store";
import { OnboardingWizard } from "./OnboardingWizard";

vi.mock("../lib/api", () => ({ testKey: vi.fn() }));

afterEach(async () => {
  cleanup();
  await deleteAllData();
  vi.clearAllMocks();
});

describe("OnboardingWizard", () => {
  it("cannot advance past the privacy step without understanding it", () => {
    render(<OnboardingWizard initialStep={2} onExit={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(screen.getByText("Step 2 of 5")).toBeTruthy();
  });

  it("skips without changing existing data except onboarding state", async () => {
    await setGeminiKey("AIzaTEST_FAKE_KEY_0000");
    await db.resumes.add({ name: "Resume", source: "manual", content: {}, updatedAt: Date.now() });
    await setOnboarding({ step: 1, completed: false, skipped: false });
    const onExit = vi.fn();
    render(<OnboardingWizard onExit={onExit} />);

    fireEvent.click(screen.getByRole("button", { name: "Skip for now" }));

    await waitFor(async () => expect(onExit).toHaveBeenCalledOnce());
    expect(await getGeminiKey()).toBe("AIzaTEST_FAKE_KEY_0000");
    expect(await db.resumes.count()).toBe(1);
    expect(await getOnboarding()).toEqual({ step: 1, completed: false, skipped: true });
  });

  it("saves a successfully tested key and completes onboarding", async () => {
    vi.mocked(testKey).mockResolvedValue({ ok: true });
    const onExit = vi.fn();
    render(<OnboardingWizard initialStep={5} onExit={onExit} />);
    fireEvent.change(screen.getByLabelText("Gemini API key"), { target: { value: "AIzaTEST_FAKE_KEY_0000" } });
    fireEvent.click(screen.getByRole("button", { name: "Test and save key" }));

    await waitFor(async () => expect(onExit).toHaveBeenCalledOnce());
    expect(await getGeminiKey()).toBe("AIzaTEST_FAKE_KEY_0000");
    expect(await getOnboarding()).toEqual({ step: 5, completed: true, skipped: false });
  });

  it("shows a mapped failure and saves nothing", async () => {
    vi.mocked(testKey).mockResolvedValue({ ok: false, code: "invalid_key" });
    render(<OnboardingWizard initialStep={5} onExit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText("Gemini API key"), { target: { value: "AIzaTEST_FAKE_KEY_0000" } });
    fireEvent.click(screen.getByRole("button", { name: "Test and save key" }));

    expect(await screen.findByText("Google didn't recognize this key. Copy it again from AI Studio.")).toBeTruthy();
    expect(await getGeminiKey()).toBeNull();
  });
});
