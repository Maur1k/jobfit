import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewPanel } from "./ReviewPanel";

afterEach(cleanup);

describe("ReviewPanel", () => {
  it("does not save extracted text until the user confirms", () => {
    const onUse = vi.fn();
    render(<ReviewPanel text="Parsed resume text" onUse={onUse} onDiscard={vi.fn()} />);

    expect(onUse).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Use this text" }));
    expect(onUse).toHaveBeenCalledOnce();
  });

  it("leaves the draft unchanged when discarded", () => {
    const onDiscard = vi.fn();
    render(<ReviewPanel text="Parsed resume text" onUse={vi.fn()} onDiscard={onDiscard} />);

    fireEvent.click(screen.getByRole("button", { name: "Discard" }));
    expect(onDiscard).toHaveBeenCalledOnce();
  });
});
