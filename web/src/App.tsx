import { useState } from "react";
import { ResumeEditor } from "./resume/ResumeEditor";

const TABS = ["Resume", "Tailor", "Applications", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>("Resume");
  return (
    <div className="app">
      <header className="topbar">
        <span className="brand">JobFit</span>
        <nav aria-label="Main">
          {TABS.map((t) => (
            <button key={t} type="button" className="tab" aria-current={tab === t ? "page" : undefined} onClick={() => setTab(t)}>
              {t}
            </button>
          ))}
        </nav>
      </header>
      <main className="main">
        {tab === "Resume" ? <ResumeEditor /> : <p className="muted">{tab} arrives in a later milestone.</p>}
      </main>
    </div>
  );
}
