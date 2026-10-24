const BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export async function testKey(key: string): Promise<{ ok: boolean; message?: string }> {
  const r = await fetch(`${BASE}/api/key/test`, { method: "POST", headers: { "X-Gemini-Key": key } });
  if (r.ok) return { ok: true };
  const body = await r.json().catch(() => null);
  return { ok: false, message: body?.detail?.message ?? "Something went wrong. Try again." };
}

export async function parseResume(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const r = await fetch(`${BASE}/api/resume/parse`, { method: "POST", body: form });
  const body = await r.json().catch(() => null);
  if (!r.ok) throw new Error(body?.detail?.message ?? "Couldn't read this file.");
  return body.text as string;
}
