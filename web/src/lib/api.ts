const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export interface KeyTestResult {
  ok: boolean;
  code?: string;
}

export async function testKey(key: string): Promise<KeyTestResult> {
  let r: Response;
  try {
    r = await fetch(`${BASE}/api/key/test`, { method: "POST", headers: { "X-Gemini-Key": key } });
  } catch {
    return { ok: false, code: "network" };
  }
  if (r.ok) return { ok: true };
  const body = await r.json().catch(() => null);
  return { ok: false, code: typeof body?.detail?.code === "string" ? body.detail.code : undefined };
}

export async function parseResume(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${BASE}/api/resume/parse`, { method: "POST", body: form });
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(body?.detail?.message ?? "Couldn't read this file.");
  return body.text as string;
}
