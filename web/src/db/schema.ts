import Dexie, { type Table } from "dexie";

export type AppStatus = "Saved" | "Applied" | "Interview" | "Offer" | "Rejected" | "Withdrawn";

export interface Resume {
  id?: number;
  name: string;
  source: "upload" | "manual";
  content: unknown; // structured Master Resume (evidence records), defined in milestone 2
  updatedAt: number;
}
export interface Tailored {
  id?: number;
  resumeId: number;
  jobDescription: string;
  output: unknown;
  createdAt: number;
}
export interface Application {
  id?: number;
  company: string;
  role: string;
  url?: string;
  status: AppStatus;
  appliedAt?: number;
  tailoredId?: number;
  notes?: string;
}
export interface Setting {
  key: string;
  value: unknown; // e.g. "geminiKey", "onboardingDone"
}

class JobFitDB extends Dexie {
  resumes!: Table<Resume, number>;
  tailored!: Table<Tailored, number>;
  applications!: Table<Application, number>;
  settings!: Table<Setting, string>;

  constructor() {
    super("jobfit");
    this.version(1).stores({
      resumes: "++id, updatedAt",
      tailored: "++id, resumeId, createdAt",
      applications: "++id, status, appliedAt",
      settings: "key",
    });
  }
}

export const db = new JobFitDB();
