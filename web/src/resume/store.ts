import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db } from "../db/schema";
import { emptyResume, normalizeResume } from "./evidence";
import type { MasterResume } from "./types";

// The master resume is one row with a fixed id.
export const MASTER_ID = 1;

export async function saveMaster(content: MasterResume): Promise<void> {
  await db.resumes.put({ id: MASTER_ID, name: "Master resume", source: "manual", content, updatedAt: Date.now() });
}

type MasterState =
  | { status: "loading" }
  | { status: "ready"; data: MasterResume }
  | { status: "error" };

/** Live view of the saved master resume. Re-renders when the row changes. */
export function useMasterResume(): MasterState {
  const [state, setState] = useState<MasterState>({ status: "loading" });
  useEffect(() => {
    const sub = liveQuery(() => db.resumes.get(MASTER_ID)).subscribe({
      next: (row) => setState({ status: "ready", data: row ? normalizeResume(row.content as Partial<MasterResume>) : emptyResume() }),
      error: () => setState({ status: "error" }),
    });
    return () => sub.unsubscribe();
  }, []);
  return state;
}
