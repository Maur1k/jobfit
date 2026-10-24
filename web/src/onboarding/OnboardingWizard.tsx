import { useEffect, useRef, useState } from "react";
import { testKey } from "../lib/api";
import { keyErrorMessage } from "../lib/errors";
import { setGeminiKey, setOnboarding } from "../settings/store";
import type { OnboardingState } from "./types";

interface OnboardingWizardProps {
  initialStep?: number;
  onExit: () => void;
}

const STEPS = [
  {
    title: "Why you need a key",
    body: "AI tailoring uses Google's Gemini. A free key takes about two minutes to create, and you keep control of it.",
    checkpoint: "You should see a clear explanation of why JobFit needs a Gemini key.",
  },
  {
    title: "Your privacy",
    body: "",
    checkpoint: "You should see the three privacy facts before continuing.",
  },
  {
    title: "Open Google AI Studio",
    body: "Open Google AI Studio in a new tab, then return here when you are ready to create your key.",
    checkpoint: "You should see the Google AI Studio page in a new browser tab.",
  },
  {
    title: "Accept terms and create a key",
    body: "Accept the terms, check the required box, click Get API key, then Create API key, and choose a new project.",
    checkpoint: "You should see a new API key in Google AI Studio.",
  },
  {
    title: "Paste and test your key",
    body: "Paste the key from Google AI Studio. JobFit makes one small test request before saving it on this device.",
    checkpoint: "You should see a successful key test before the key is saved.",
  },
] as const;

function Screenshot({ step }: { step: number }) {
  const [failed, setFailed] = useState(false);
  return failed ? (
    <div className="screenshot-placeholder" role="img" aria-label={`Screenshot for step ${step} coming soon`}>
      Screenshot coming soon
    </div>
  ) : (
    <img
      className="onboarding-screenshot"
      src={`/onboarding/step-${step}.png`}
      alt={`Google AI Studio step ${step} screen`}
      onError={() => {
        setFailed(true);
        if (import.meta.env.DEV) console.warn(`Onboarding screenshot step ${step} is unavailable.`);
      }}
    />
  );
}

export function OnboardingWizard({ initialStep = 1, onExit }: OnboardingWizardProps) {
  const [step, setStep] = useState(Math.min(Math.max(initialStep, 1), 5));
  const [understood, setUnderstood] = useState(false);
  const [key, setKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const skip = async () => {
    const state: OnboardingState = { step, completed: false, skipped: true };
    await setOnboarding(state);
    onExit();
  };

  const continueStep = async () => {
    setError(null);
    if (step === 2 && !understood) return;
    if (step < 5) {
      setStep(step + 1);
      return;
    }
    setTesting(true);
    const result = await testKey(key);
    if (result.ok) {
      await setGeminiKey(key);
      await setOnboarding({ step: 5, completed: true, skipped: false });
      onExit();
    } else {
      setError(keyErrorMessage(result.code));
    }
    setTesting(false);
  };

  const stepInfo = STEPS[step - 1];
  return (
    <section className="onboarding card" aria-labelledby="onboarding-title">
      <header className="onboarding-header">
        <p className="muted">Step {step} of 5</p>
        <button type="button" onClick={() => void skip()}>Skip for now</button>
      </header>
      <h1 id="onboarding-title" ref={headingRef} tabIndex={-1}>{stepInfo.title}</h1>
      <p>{stepInfo.body}</p>
      <Screenshot step={step} />
      <p className="checkpoint"><strong>What you should see:</strong> {stepInfo.checkpoint}</p>
      {step === 2 && (
        <label className="checkbox-field">
          <input type="checkbox" checked={understood} onChange={(event) => setUnderstood(event.target.checked)} />
          I understand
        </label>
      )}
      {step === 2 ? (
        <ul>
          <li>Resumes and applications stay in the browser; nothing is stored on a server.</li>
          <li>Resume text and job descriptions are sent to Google using the user's key.</li>
          <li>On the free tier, Google may use requests to improve its products. Users who object should use a paid key.</li>
        </ul>
      ) : null}
      {step === 4 && (
        <a className="button-link primary" href="https://aistudio.google.com/" target="_blank" rel="noopener noreferrer">
          Open Google AI Studio
        </a>
      )}
      {step === 5 && (
        <div className="key-entry">
          <label className="field">
            <span>Gemini API key</span>
            <input type={showKey ? "text" : "password"} value={key} onChange={(event) => setKey(event.target.value)} autoComplete="off" />
          </label>
          <button type="button" onClick={() => setShowKey((visible) => !visible)}>{showKey ? "Hide" : "Show"}</button>
        </div>
      )}
      <div className="onboarding-actions">
        {step > 1 && <button type="button" onClick={() => { setError(null); setStep(step - 1); }}>Back</button>}
        <button type="button" className="primary" onClick={() => void continueStep()} disabled={(step === 2 && !understood) || (step === 5 && (!key || testing))}>
          {step === 5 ? (testing ? "Testing…" : "Test and save key") : "Continue"}
        </button>
      </div>
      <div className="error" role="status" aria-live="polite">{error}</div>
    </section>
  );
}
