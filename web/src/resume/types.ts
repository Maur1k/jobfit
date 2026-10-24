// The Master Resume is the single source of truth. Every bullet is an atomic
// piece of evidence with a stable id, so tailored output can cite it later.

export interface Bullet {
  id: string;
  text: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: Bullet[];
}

export interface Project {
  id: string;
  name: string;
  link: string;
  bullets: Bullet[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  start: string;
  end: string;
}

export interface Profile {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
  summary: string;
}

export interface MasterResume {
  version: 1;
  rawText: string;
  profile: Profile;
  experience: Experience[];
  projects: Project[];
  education: Education[];
  skills: string[];
}

export interface Issue {
  path: string;
  message: string;
}
