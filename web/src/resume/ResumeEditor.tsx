import { useEffect, useState } from "react";
import type { Bullet, MasterResume } from "./types";
import { countEvidence, emptyResume, moveItem, newBullet, newEducation, newExperience, newProject, validate } from "./evidence";
import { saveMaster, useMasterResume } from "./store";
import { ResumePreview } from "./ResumePreview";
import { parseResume } from "../lib/api";
import { ReviewPanel } from "./ReviewPanel";

type Edit = (fn: (r: MasterResume) => void) => void;

export function ResumeEditor() {
  const master = useMasterResume();
  const [draft, setDraft] = useState<MasterResume | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load the saved copy once. After that the draft is the source while editing.
  useEffect(() => {
    if (master.status === "ready" && draft === null) setDraft(master.data);
  }, [master, draft]);

  // Warn before closing the tab with unsaved edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (master.status === "error")
    return <p role="alert">Couldn't open your saved resume. Your browser may be blocking site storage.</p>;
  if (!draft) return <p className="muted">Loading your resume…</p>;

  const edit: Edit = (fn) => {
    setDraft((d) => {
      if (!d) return d;
      const copy = structuredClone(d);
      fn(copy);
      return copy;
    });
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await saveMaster(draft);
      setDirty(false);
    } catch {
      setError("Couldn't save. Check that your browser allows site storage.");
    } finally {
      setSaving(false);
    }
  };

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      setReviewText(await parseResume(file));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't read this file.");
    } finally {
      setUploading(false);
    }
  };

  const useExtractedText = () => {
    if (reviewText === null) return;
    edit((r) => (r.rawText = reviewText));
    setReviewText(null);
  };

  const issues = validate(draft);
  const p = draft.profile;

  return (
    <div className="editor-layout">
      <div className="editor-pane">
        <header className="editor-head">
          <div>
            <h2>Master resume</h2>
            <p className="muted">
              Your complete history, saved in this browser. Tailored versions are made from it and never change it.
            </p>
          </div>
          <div className="save-state">
            <span aria-live="polite" className={error ? "error" : "muted"}>
              {error ?? (dirty ? "Unsaved changes" : "All changes saved")}
            </span>
            <button type="button" className="primary" onClick={save} disabled={!dirty || saving}>
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </header>

        {issues.length > 0 && (
          <ul className="issues" aria-label="Things to fix">
            {issues.map((i) => (
              <li key={i.path + i.message}>{i.message}</li>
            ))}
          </ul>
        )}

        <section className="card" aria-labelledby="sec-upload">
          <h3 id="sec-upload">Upload a resume</h3>
          <p className="muted">PDF and DOCX files up to 4 MB. The file is parsed for review before anything is saved.</p>
          <label className="upload-control">
            <span>{uploading ? "Uploading…" : "Choose PDF or DOCX"}</span>
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              disabled={uploading}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void upload(file);
                e.currentTarget.value = "";
              }}
            />
          </label>
        </section>
        {reviewText !== null && <ReviewPanel text={reviewText} onUse={useExtractedText} onDiscard={() => setReviewText(null)} />}
        {draft.rawText && (
          <section className="card" aria-labelledby="sec-raw-text">
            <h3 id="sec-raw-text">Imported source text</h3>
            <pre className="extracted-text">{draft.rawText}</pre>
          </section>
        )}

        <section className="card" aria-labelledby="sec-profile">
          <h3 id="sec-profile">Profile</h3>
          <div className="grid-2">
            <Field label="Full name" value={p.name} onChange={(v) => edit((r) => (r.profile.name = v))} />
            <Field label="Headline" placeholder="e.g. Data analyst" value={p.headline} onChange={(v) => edit((r) => (r.profile.headline = v))} />
            <Field label="Email" type="email" value={p.email} onChange={(v) => edit((r) => (r.profile.email = v))} />
            <Field label="Phone" type="tel" value={p.phone} onChange={(v) => edit((r) => (r.profile.phone = v))} />
            <Field label="Location" value={p.location} onChange={(v) => edit((r) => (r.profile.location = v))} />
          </div>
          <TextArea
            label="Links (one per line)"
            value={p.links.join("\n")}
            onChange={(v) => edit((r) => (r.profile.links = v.split("\n")))}
          />
          <TextArea label="Summary" rows={3} value={p.summary} onChange={(v) => edit((r) => (r.profile.summary = v))} />
        </section>

        <section className="card" aria-labelledby="sec-exp">
          <div className="section-head">
            <h3 id="sec-exp">Experience</h3>
            <button type="button" onClick={() => edit((r) => r.experience.push(newExperience()))}>Add job</button>
          </div>
          {draft.experience.length === 0 && <p className="muted">No jobs yet. Add one to start building evidence.</p>}
          {draft.experience.map((e, i) => (
            <div className="entry" key={e.id}>
              <div className="grid-2">
                <Field label="Company" value={e.company} onChange={(v) => edit((r) => (r.experience[i].company = v))} />
                <Field label="Role" value={e.role} onChange={(v) => edit((r) => (r.experience[i].role = v))} />
                <Field label="Location" value={e.location} onChange={(v) => edit((r) => (r.experience[i].location = v))} />
                <div className="dates">
                  <Field label="Start" placeholder="Jan 2024" value={e.start} onChange={(v) => edit((r) => (r.experience[i].start = v))} />
                  <Field label="End" placeholder="Present" value={e.end} onChange={(v) => edit((r) => (r.experience[i].end = v))} />
                </div>
              </div>
              <BulletList
                bullets={e.bullets}
                onChange={(bs) => edit((r) => (r.experience[i].bullets = bs))}
              />
              <EntryActions
                index={i}
                total={draft.experience.length}
                onMove={(d) => edit((r) => (r.experience = moveItem(r.experience, i, d)))}
                onRemove={() => edit((r) => r.experience.splice(i, 1))}
              />
            </div>
          ))}
        </section>

        <section className="card" aria-labelledby="sec-proj">
          <div className="section-head">
            <h3 id="sec-proj">Projects</h3>
            <button type="button" onClick={() => edit((r) => r.projects.push(newProject()))}>Add project</button>
          </div>
          {draft.projects.map((pr, i) => (
            <div className="entry" key={pr.id}>
              <div className="grid-2">
                <Field label="Name" value={pr.name} onChange={(v) => edit((r) => (r.projects[i].name = v))} />
                <Field label="Link" value={pr.link} onChange={(v) => edit((r) => (r.projects[i].link = v))} />
              </div>
              <BulletList bullets={pr.bullets} onChange={(bs) => edit((r) => (r.projects[i].bullets = bs))} />
              <EntryActions
                index={i}
                total={draft.projects.length}
                onMove={(d) => edit((r) => (r.projects = moveItem(r.projects, i, d)))}
                onRemove={() => edit((r) => r.projects.splice(i, 1))}
              />
            </div>
          ))}
        </section>

        <section className="card" aria-labelledby="sec-edu">
          <div className="section-head">
            <h3 id="sec-edu">Education</h3>
            <button type="button" onClick={() => edit((r) => r.education.push(newEducation()))}>Add school</button>
          </div>
          {draft.education.map((ed, i) => (
            <div className="entry" key={ed.id}>
              <div className="grid-2">
                <Field label="School" value={ed.school} onChange={(v) => edit((r) => (r.education[i].school = v))} />
                <Field label="Degree" value={ed.degree} onChange={(v) => edit((r) => (r.education[i].degree = v))} />
                <Field label="Start" value={ed.start} onChange={(v) => edit((r) => (r.education[i].start = v))} />
                <Field label="End" value={ed.end} onChange={(v) => edit((r) => (r.education[i].end = v))} />
              </div>
              <EntryActions
                index={i}
                total={draft.education.length}
                onMove={(d) => edit((r) => (r.education = moveItem(r.education, i, d)))}
                onRemove={() => edit((r) => r.education.splice(i, 1))}
              />
            </div>
          ))}
        </section>

        <section className="card" aria-labelledby="sec-skills">
          <h3 id="sec-skills">Skills</h3>
          <TextArea
            label="One skill per line"
            rows={4}
            value={draft.skills.join("\n")}
            onChange={(v) => edit((r) => (r.skills = v.split("\n")))}
          />
        </section>
      </div>

      <aside className="preview-pane" aria-label="Live preview">
        <div className="preview-head">
          <p className="muted">{countEvidence(draft)} evidence items</p>
          <button type="button" onClick={() => window.print()}>Print</button>
        </div>
        <ResumePreview resume={draft} />
      </aside>
    </div>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  const { label, value, onChange, type = "text", placeholder } = props;
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function TextArea(props: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <label className="field">
      <span>{props.label}</span>
      <textarea rows={props.rows ?? 2} value={props.value} onChange={(e) => props.onChange(e.target.value)} />
    </label>
  );
}

function BulletList({ bullets, onChange }: { bullets: Bullet[]; onChange: (bs: Bullet[]) => void }) {
  const setText = (id: string, text: string) => onChange(bullets.map((b) => (b.id === id ? { ...b, text } : b)));
  return (
    <div className="bullets">
      <span className="bullets-label">Achievements</span>
      <ol>
        {bullets.map((b, i) => (
          <li key={b.id}>
            <textarea
              rows={2}
              aria-label={`Achievement ${i + 1}`}
              value={b.text}
              onChange={(e) => setText(b.id, e.target.value)}
            />
            <div className="row-actions">
              <button type="button" onClick={() => onChange(moveItem(bullets, i, -1))} disabled={i === 0} aria-label={`Move achievement ${i + 1} up`}>
                Up
              </button>
              <button type="button" onClick={() => onChange(moveItem(bullets, i, 1))} disabled={i === bullets.length - 1} aria-label={`Move achievement ${i + 1} down`}>
                Down
              </button>
              <button type="button" onClick={() => onChange(bullets.filter((x) => x.id !== b.id))} aria-label={`Remove achievement ${i + 1}`}>
                Remove
              </button>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" onClick={() => onChange([...bullets, newBullet()])}>Add achievement</button>
    </div>
  );
}

function EntryActions(props: { index: number; total: number; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  const { index, total, onMove, onRemove } = props;
  return (
    <div className="entry-actions">
      <button type="button" onClick={() => onMove(-1)} disabled={index === 0}>Move up</button>
      <button type="button" onClick={() => onMove(1)} disabled={index === total - 1}>Move down</button>
      <button type="button" className="danger" onClick={onRemove}>Delete</button>
    </div>
  );
}
