import { describe, expect, it } from "vitest";
import { countEvidence, emptyResume, moveItem, newBullet, newExperience, validate } from "./evidence";

describe("moveItem", () => {
  it("swaps with the neighbour", () => {
    expect(moveItem(["a", "b", "c"], 1, -1)).toEqual(["b", "a", "c"]);
    expect(moveItem(["a", "b", "c"], 1, 1)).toEqual(["a", "c", "b"]);
  });
  it("does nothing at the edges and never mutates", () => {
    const items = ["a", "b"];
    expect(moveItem(items, 0, -1)).toBe(items);
    expect(moveItem(items, 1, 1)).toBe(items);
    expect(items).toEqual(["a", "b"]);
  });
});

describe("evidence ids", () => {
  it("gives every bullet a unique id", () => {
    const ids = new Set(Array.from({ length: 50 }, () => newBullet().id));
    expect(ids.size).toBe(50);
  });
});

describe("validate and countEvidence", () => {
  it("asks for a name and at least one achievement on an empty resume", () => {
    const issues = validate(emptyResume());
    expect(issues.map((i) => i.path)).toEqual(["profile.name", "experience"]);
  });

  it("ignores blank bullets when counting evidence", () => {
    const r = emptyResume();
    const job = newExperience();
    job.company = "Acme";
    job.role = "Analyst";
    job.bullets = [newBullet("Cut report time by 40%"), newBullet("   ")];
    r.experience = [job];
    expect(countEvidence(r)).toBe(1);
  });

  it("flags a job missing its company", () => {
    const r = emptyResume();
    r.profile.name = "Maria";
    const job = newExperience();
    job.bullets = [newBullet("Did things")];
    r.experience = [job];
    expect(validate(r).map((i) => i.path)).toContain("experience.0");
  });
});
