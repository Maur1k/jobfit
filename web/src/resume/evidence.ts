import type { Bullet, Education, Experience, Issue, MasterResume, Project } from "./types";

export const newId = (): string => crypto.randomUUID();

export const newBullet = (text = ""): Bullet => ({ id: newId(), text });

export function newExperience(): Experience {
  return { id: newId(), company: "", role: "", location: "", start: "", end: "", bullets: [newBullet()] };
}

export function newProject(): Project {
  return { id: newId(), name: "", link: "", bullets: [newBullet()] };
}

export function newEducation(): Education {
  return { id: newId(), school: "", degree: "", start: "", end: "" };
}

export function emptyResume(): MasterResume {
  return {
    version: 1,
    rawText: "",
    profile: { name: "", headline: "", email: "", phone: "", location: "", links: [], summary: "" },
    experience: [],
    projects: [],
    education: [],
    skills: [],
  };
}

export function normalizeResume(resume: Partial<MasterResume>): MasterResume {
  const empty = emptyResume();
  return {
    ...empty,
    ...resume,
    rawText: resume.rawText ?? "",
    profile: { ...empty.profile, ...resume.profile },
    experience: resume.experience ?? [],
    projects: resume.projects ?? [],
    education: resume.education ?? [],
    skills: resume.skills ?? [],
  };
}

/** Returns a copy with the item at `index` swapped with its neighbour. */
export function moveItem<T>(items: T[], index: number, delta: -1 | 1): T[] {
  const target = index + delta;
  if (target < 0 || target >= items.length) return items;
  const copy = items.slice();
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/** Counts the bullets that can be cited as evidence. */
export function countEvidence(r: MasterResume): number {
  const count = (items: { bullets: Bullet[] }[]) =>
    items.reduce((n, item) => n + item.bullets.filter((b) => b.text.trim()).length, 0);
  return count(r.experience) + count(r.projects);
}

/** Problems that block a useful tailored resume. Empty bullets are dropped on export, not errors. */
export function validate(r: MasterResume): Issue[] {
  const issues: Issue[] = [];
  if (!r.profile.name.trim()) issues.push({ path: "profile.name", message: "Add your name." });
  r.experience.forEach((e, i) => {
    if (!e.company.trim() || !e.role.trim())
      issues.push({ path: `experience.${i}`, message: "Each job needs a company and a role." });
  });
  r.projects.forEach((p, i) => {
    if (!p.name.trim()) issues.push({ path: `projects.${i}`, message: "Each project needs a name." });
  });
  if (countEvidence(r) === 0)
    issues.push({ path: "experience", message: "Add at least one achievement so there is evidence to tailor from." });
  return issues;
}
