import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { db } from "../db/schema";
import { deleteAllData, setGeminiKey } from "./store";
import { SettingsScreen } from "./SettingsScreen";

afterEach(async () => {
  cleanup();
  await deleteAllData();
});

describe("SettingsScreen", () => {
  it("masks the saved key and does not render the full key", async () => {
    await setGeminiKey("AIzaTEST_FAKE_KEY_0000");
    render(<SettingsScreen onOpenWizard={vi.fn()} />);

    expect(await screen.findByText("AIza••••0000")).toBeTruthy();
    expect(document.body.textContent).not.toContain("AIzaTEST_FAKE_KEY_0000");
  });

  it("removes only the key and leaves resumes intact", async () => {
    await setGeminiKey("AIzaTEST_FAKE_KEY_0000");
    await db.resumes.add({ name: "Resume", source: "manual", content: {}, updatedAt: Date.now() });
    render(<SettingsScreen onOpenWizard={vi.fn()} />);
    await screen.findByText("AIza••••0000");
    fireEvent.click(screen.getByRole("button", { name: "Remove key from this device" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirm remove" }));

    await waitFor(async () => expect(await db.resumes.count()).toBe(1));
    expect(screen.getByText("No key saved")).toBeTruthy();
  });

  it("deletes all data only after DELETE is typed", async () => {
    await setGeminiKey("AIzaTEST_FAKE_KEY_0000");
    await db.resumes.add({ name: "Resume", source: "manual", content: {}, updatedAt: Date.now() });
    render(<SettingsScreen onOpenWizard={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "Delete all my data" }));
    const confirm = screen.getByRole("button", { name: "Confirm delete" });
    expect((confirm as HTMLButtonElement).disabled).toBe(true);
    fireEvent.change(screen.getByLabelText("Type DELETE to confirm"), { target: { value: "DELETE" } });
    fireEvent.click(confirm);

    await waitFor(async () => expect(await db.resumes.count()).toBe(0));
    expect(await db.settings.count()).toBe(0);
  });
});
