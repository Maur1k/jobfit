import type { MasterResume } from "./types";

const dates = (start: string, end: string) => [start, end || (start ? "Present" : "")].filter(Boolean).join(" – ");

/** A4 resume sheet. Used for the on-screen preview and for printing. */
export function ResumePreview({ resume }: { resume: MasterResume }) {
  const { profile: p } = resume;
  const contact = [p.email, p.phone, p.location, ...p.links].map((s) => s.trim()).filter(Boolean);
  const skills = resume.skills.map((s) => s.trim()).filter(Boolean);

  return (
    <article className="resume-sheet" aria-label="Resume preview">
      <header className="resume-head">
        <h1>{p.name.trim() || "Your name"}</h1>
        {p.headline.trim() && <p className="resume-headline">{p.headline}</p>}
        {contact.length > 0 && <p className="resume-contact">{contact.join(", ")}</p>}
      </header>

      {p.summary.trim() && (
        <section>
          <h2>Summary</h2>
          <p>{p.summary}</p>
        </section>
      )}

      {resume.experience.length > 0 && (
        <section>
          <h2>Experience</h2>
          {resume.experience.map((e) => (
            <div className="resume-entry" key={e.id}>
              <div className="resume-entry-head">
                <strong>{e.role}</strong>
                <span>{dates(e.start, e.end)}</span>
              </div>
              <div className="resume-entry-sub">
                {[e.company, e.location].filter((s) => s.trim()).join(", ")}
              </div>
              <ul>
                {e.bullets.filter((b) => b.text.trim()).map((b) => (
                  <li key={b.id}>{b.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.projects.length > 0 && (
        <section>
          <h2>Projects</h2>
          {resume.projects.map((pr) => (
            <div className="resume-entry" key={pr.id}>
              <div className="resume-entry-head">
                <strong>{pr.name}</strong>
                {pr.link.trim() && <span>{pr.link}</span>}
              </div>
              <ul>
                {pr.bullets.filter((b) => b.text.trim()).map((b) => (
                  <li key={b.id}>{b.text}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      )}

      {resume.education.length > 0 && (
        <section>
          <h2>Education</h2>
          {resume.education.map((ed) => (
            <div className="resume-entry" key={ed.id}>
              <div className="resume-entry-head">
                <strong>{ed.school}</strong>
                <span>{dates(ed.start, ed.end)}</span>
              </div>
              <div className="resume-entry-sub">{ed.degree}</div>
            </div>
          ))}
        </section>
      )}

      {skills.length > 0 && (
        <section>
          <h2>Skills</h2>
          <p>{skills.join(", ")}</p>
        </section>
      )}
    </article>
  );
}
