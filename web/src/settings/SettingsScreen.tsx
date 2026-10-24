import { useEffect, useState } from "react";
import { deleteAllData, getGeminiKey, removeGeminiKey } from "./store";

interface SettingsScreenProps {
  onOpenWizard: (step?: number) => void;
}

export function maskGeminiKey(key: string): string {
  return `AIza••••${key.slice(-4)}`;
}

export function SettingsScreen({ onOpenWizard }: SettingsScreenProps) {
  const [key, setKey] = useState<string | null>(null);
  const [removePending, setRemovePending] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [deletePending, setDeletePending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = async () => setKey(await getGeminiKey());
  useEffect(() => { void refresh(); }, []);

  const remove = async () => {
    await removeGeminiKey();
    setKey(null);
    setRemovePending(false);
    setMessage("The key was removed from this device.");
  };

  const deleteData = async () => {
    if (deleteText !== "DELETE") return;
    await deleteAllData();
    setKey(null);
    setDeleteText("");
    setDeletePending(false);
    setMessage("All data was deleted from this device.");
  };

  return (
    <section className="settings-screen">
      <h1>Settings</h1>
      <p className="muted">Your key and resume data stay in this browser.</p>
      <section className="card" aria-labelledby="key-settings-title">
        <h2 id="key-settings-title">Gemini key</h2>
        <p>{key ? <code>{maskGeminiKey(key)}</code> : "No key saved"}</p>
        <div className="row-actions">
          <button type="button" onClick={() => onOpenWizard(5)}>{key ? "Replace key" : "Add key"}</button>
          {key && !removePending && <button type="button" onClick={() => setRemovePending(true)}>Remove key from this device</button>}
        </div>
        {removePending && (
          <div className="confirmation">
            <p>Remove the Gemini key from this device? Resumes and applications will stay.</p>
            <button type="button" className="danger" onClick={() => void remove()}>Confirm remove</button>
            <button type="button" onClick={() => setRemovePending(false)}>Cancel</button>
          </div>
        )}
      </section>
      <section className="card" aria-labelledby="onboarding-settings-title">
        <h2 id="onboarding-settings-title">Onboarding</h2>
        <button type="button" onClick={() => onOpenWizard(1)}>Set up again</button>
      </section>
      <section className="card" aria-labelledby="delete-settings-title">
        <h2 id="delete-settings-title">Delete all my data</h2>
        <p>This clears resumes, tailored versions, applications, settings, and your Gemini key from this device.</p>
        {!deletePending ? (
          <button type="button" className="danger" onClick={() => setDeletePending(true)}>Delete all my data</button>
        ) : (
          <div className="confirmation">
            <label className="field">
              <span>Type DELETE to confirm</span>
              <input value={deleteText} onChange={(event) => setDeleteText(event.target.value)} />
            </label>
            <button type="button" className="danger" disabled={deleteText !== "DELETE"} onClick={() => void deleteData()}>Confirm delete</button>
            <button type="button" onClick={() => { setDeletePending(false); setDeleteText(""); }}>Cancel</button>
          </div>
        )}
      </section>
      {message && <p className="success" role="status">{message}</p>}
    </section>
  );
}
