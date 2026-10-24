import { useEffect, useState } from "react";
import { ResumeEditor } from "./resume/ResumeEditor";
import { OnboardingWizard } from "./onboarding/OnboardingWizard";
import { getGeminiKey, getOnboarding } from "./settings/store";
import { SettingsScreen } from "./settings/SettingsScreen";

const TABS = ["Resume", "Tailor", "Applications", "Settings"] as const;
type Tab = (typeof TABS)[number];

export default function App() {
  const [tab, setTab] = useState<Tab>("Resume");
  const [onboarding, setOnboarding] = useState<{ step: number; completed: boolean; skipped: boolean } | null>(null);
  const [wizardStep, setWizardStep] = useState<number | null>(null);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    void Promise.all([getOnboarding(), getGeminiKey()]).then(([state, key]) => {
      setOnboarding(state);
      setHasKey(Boolean(key));
    });
  }, []);

  const openWizard = (step = 1) => setWizardStep(step);
  const closeWizard = () => {
    setWizardStep(null);
    void Promise.all([getOnboarding(), getGeminiKey()]).then(([state, key]) => {
      setOnboarding(state);
      setHasKey(Boolean(key));
    });
  };

  if (!onboarding) return <main className="main"><p className="muted">Loading JobFit…</p></main>;
  if (wizardStep !== null || (!onboarding.completed && !onboarding.skipped)) {
    return <main className="main"><OnboardingWizard initialStep={wizardStep ?? onboarding.step} onExit={closeWizard} /></main>;
  }

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
        {tab === "Resume" ? <ResumeEditor /> :
          tab === "Settings" ? <SettingsScreen onOpenWizard={openWizard} /> :
          tab === "Tailor" ? <p className="notice">{hasKey ? "Tailoring arrives in milestone 5." : "Connect your Gemini key to tailor a resume. Settings → Add key."}</p> :
          <p className="muted">{tab} arrives in a later milestone.</p>}
      </main>
    </div>
  );
}
