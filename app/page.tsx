"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type FormValues = {
  gender: string;
  age: string;
  state: string;
  earningStatus: string;
  profession: string;
  employmentStatus: string;
  annualIncome: string;
  caste: string;
  communityStatus: string;
  disability: string;
};

type SchemeMatch = {
  badge: string;
  title: string;
  description: string;
  accent: "green" | "saffron" | "blue";
};

type FieldName = keyof FormValues;

type RecognitionEvent = {
  results: {
    [index: number]: {
      [index: number]: { transcript: string };
      isFinal: boolean;
    };
    length: number;
  };
};

type RecognitionInstance = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type RecognitionConstructor = new () => RecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  }
}

const states = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

const initialValues: FormValues = {
  gender: "",
  age: "",
  state: "",
  earningStatus: "",
  profession: "",
  employmentStatus: "",
  annualIncome: "",
  caste: "",
  communityStatus: "",
  disability: "",
};

const stepFields: FieldName[][] = [
  ["gender", "age", "state", "disability"],
  ["earningStatus", "employmentStatus", "profession", "annualIncome"],
  ["caste", "communityStatus"],
];

const stepNames = ["About you", "Work & income", "Community details"];

const labels: Record<FieldName, string> = {
  gender: "Gender",
  age: "Age",
  state: "State / Union Territory",
  earningStatus: "Earning status",
  profession: "Profession",
  employmentStatus: "Employment status",
  annualIncome: "Annual family income",
  caste: "Caste category",
  communityStatus: "Community status",
  disability: "Do you have a disability?",
};

function UmeedMark() {
  return (
    <svg aria-hidden="true" className="brand-mark" viewBox="0 0 44 44" fill="none">
      <path d="M7 25.2C13.4 20.2 17.7 14.2 19.8 7.8c.5-1.5 2.5-1.7 3.3-.3 1.9 3.4 2.8 7.3 2.6 11.3 3-2 6.3-3.3 9.7-3.9 1.5-.3 2.6 1.2 1.9 2.6-3.5 7.5-9.7 13.4-17.4 16.5-5.1 2-9.8 1.4-13.1-1.2-2.2-1.7-2.1-5.8.2-7.6Z" fill="currentColor" />
      <path d="M12.5 30.4c4.3-5.9 8.7-10 16.8-13.9" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function HopeIntro({ onFinish }: { onFinish: () => void }) {
  return (
    <section className="hope-intro" aria-label="Welcome to UMEED">
      <div className="intro-sunrise" aria-hidden="true" />
      <div className="intro-content">
        <p className="intro-kicker">A new possibility</p>
        <div className="hope-eyes" aria-hidden="true">
          <span className="hope-eye hope-eye-left"><span className="hope-iris"><span className="hope-pupil"><i /></span></span></span>
          <span className="hope-eye hope-eye-right"><span className="hope-iris"><span className="hope-pupil"><i /></span></span></span>
        </div>
        <p className="intro-thought">When hope enters your eyes,<br /><em>a path appears.</em></p>
        <div className="intro-brand"><UmeedMark /><span>UMEED</span></div>
      </div>
      <button type="button" className="skip-intro" onClick={onFinish}>Skip intro</button>
    </section>
  );
}

function Icon({ name }: { name: "mic" | "shield" | "arrow" | "check" | "volume" | "sparkle" | "back" }) {
  const paths = {
    mic: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4M8.5 21h7" /></>,
    shield: <><path d="M12 3 19 6v5c0 4.5-3 7.8-7 9.5C8 18.8 5 15.5 5 11V6l7-3Z" /><path d="m9 12 2 2 4-4" /></>,
    arrow: <path d="M5 12h13m-5-5 5 5-5 5" />,
    back: <path d="M19 12H6m5 5-5-5 5-5" />,
    check: <path d="m5 12 4.3 4.3L19 6.7" />,
    volume: <><path d="M4 10h4l5-4v12l-5-4H4z" /><path d="M16 9a4 4 0 0 1 0 6M18.7 6.4a8 8 0 0 1 0 11.2" /></>,
    sparkle: <><path d="m12 3 1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7L12 3Z" /><path d="m18 16 .8 2.2L21 19l-2.2.8L18 22l-.8-2.2L15 19l2.2-.8L18 16Z" /></>,
  };

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

function formatIncome(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return "Not shared";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getSchemeMatches(profile: FormValues): SchemeMatch[] {
  const age = Number(profile.age);
  const income = Number(profile.annualIncome);
  const profession = profile.profession.toLowerCase();
  const isStudent = profile.employmentStatus === "Student";
  const isBusinessOwner = profile.employmentStatus === "Business" || profile.employmentStatus === "Self-employed";
  const isFarmer = /\bfarm(?:er|ing)?\b/.test(profession);
  const isStreetVendor = /\b(?:street )?vendor|hawker\b/.test(profession);
  const isReservedCategory = ["SC", "ST", "OBC"].includes(profile.caste);
  const isPriorityGroup = isReservedCategory || profile.communityStatus === "Minority" || profile.disability === "Yes";
  const candidates: Omit<SchemeMatch, "accent">[] = [];

  if (isStudent) {
    candidates.push({
      badge: isPriorityGroup ? "Strong profile match" : "Student match",
      title: "National Scholarship Portal opportunities",
      description: "You selected Student. Explore scholarships that match your course, marks, income, category and state; final eligibility is verified by the institution.",
    });
  }

  if (profile.state === "Delhi" && isStudent && isPriorityGroup && income > 0 && income < 500000) {
    candidates.push({
      badge: "Delhi profile match",
      title: "Education Loan Scheme — Delhi",
      description: "Your Delhi, student, income and target-group details may fit this education-loan option. Confirm residence, admission and recognised-institute requirements.",
    });
  }

  if (isFarmer) {
    candidates.push({
      badge: "Farmer profile match",
      title: "PM-KISAN",
      description: "You selected a farming profession. Check your land records and the scheme’s exclusion conditions before applying.",
    });

    if (age >= 18 && age <= 40) {
      candidates.push({
        badge: "Farmer pension match",
        title: "Pradhan Mantri Kisan Maandhan Yojana",
        description: "This pension option may suit farmers aged 18–40. It requires small or marginal cultivable landholding and other verification.",
      });
    }
  }

  if (isStreetVendor) {
    candidates.push({
      badge: "Vendor profile match",
      title: "PM SVANidhi",
      description: "You selected a vendor profession. Check whether your vending activity and local-body certificate meet the current scheme requirements.",
    });
  }

  if (isBusinessOwner) {
    candidates.push({
      badge: "Business profile match",
      title: "Pradhan Mantri MUDRA Yojana",
      description: "You selected business or self-employment. This may support eligible non-corporate micro-enterprise activities through participating lenders.",
    });

    if (profile.gender === "Female" || profile.caste === "SC" || profile.caste === "ST") {
      candidates.push({
        badge: "Entrepreneur profile match",
        title: "Stand-Up India",
        description: "Women and SC/ST entrepreneurs may explore this option for eligible greenfield enterprises. Bank and business-plan checks apply.",
      });
    }
  }

  if (profile.disability === "Yes") {
    candidates.push({
      badge: "Disability support match",
      title: "ADIP Assistance Scheme",
      description: "You reported a disability. Explore assistance for aids and appliances; a disability certificate and other scheme conditions are checked at application time.",
    });
  }

  if (age >= 60 && income > 0 && income <= 250000) {
    candidates.push({
      badge: "Senior citizen match",
      title: "National Social Assistance Programme",
      description: "Your age and income suggest checking old-age pension support. State and household eligibility verification is required.",
    });
  }

  if (profile.earningStatus === "Non-earning" && age >= 15 && age <= 45) {
    candidates.push({
      badge: "Skills profile match",
      title: "Skill India / PMKVY",
      description: "You selected non-earning status. Explore job-linked training opportunities based on your age, location and available courses.",
    });
  }

  if (!candidates.length) {
    candidates.push({
      badge: "Explore",
      title: "PM Jan Dhan Yojana",
      description: "Explore basic financial-inclusion support and check with a participating bank for current account and eligibility requirements.",
    });
  }

  const accents: SchemeMatch["accent"][] = ["green", "saffron", "blue"];
  return candidates.slice(0, 4).map((candidate, index) => ({
    ...candidate,
    accent: accents[index % accents.length],
  }));
}

function spokenIncome(text: string) {
  const lakhMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lakhs|lacs)\b/);
  if (lakhMatch) return String(Math.round(Number(lakhMatch[1]) * 100000));
  const thousandMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:thousand|k)\b/);
  if (thousandMatch) return String(Math.round(Number(thousandMatch[1]) * 1000));
  const incomeMatch = text.match(/(?:income|earn(?:ings)?|rupees?|rs\.?)\s*(?:is|of|about)?\s*(\d{3,9})/);
  return incomeMatch?.[1] ?? "";
}

function updatesFromSpeech(transcript: string): Partial<FormValues> {
  const text = transcript.toLowerCase().replace(/[,.]/g, " ");
  const updates: Partial<FormValues> = {};

  if (/\b(female|woman|girl)\b/.test(text)) updates.gender = "Female";
  else if (/\b(male|man|boy)\b/.test(text)) updates.gender = "Male";
  else if (/\b(other|transgender|non binary)\b/.test(text)) updates.gender = "Other";

  const ageMatch = text.match(/(?:i am|age(?: is)?|aged?)\s*(\d{1,3})\b/);
  if (ageMatch && Number(ageMatch[1]) > 0 && Number(ageMatch[1]) < 121) updates.age = ageMatch[1];

  const state = states.find((item) => text.includes(item.toLowerCase()));
  if (state) updates.state = state;

  if (/\b(non[- ]?earning|not earning)\b/.test(text)) updates.earningStatus = "Non-earning";
  else if (/\bearning\b/.test(text)) updates.earningStatus = "Earning";

  if (/\bself[- ]?employed\b/.test(text)) updates.employmentStatus = "Self-employed";
  else if (/\bstudent\b/.test(text)) updates.employmentStatus = "Student";
  else if (/\bbusiness(?: owner)?\b/.test(text)) updates.employmentStatus = "Business";
  else if (/\bemployed\b/.test(text)) updates.employmentStatus = "Employed";

  const knownProfession = ["farmer", "teacher", "driver", "labourer", "laborer", "shopkeeper", "homemaker", "home maker", "doctor", "tailor", "artisan", "vendor", "student"];
  const profession = knownProfession.find((item) => text.includes(item));
  if (profession) updates.profession = profession === "laborer" ? "Labourer" : profession.replace(/\b\w/g, (letter) => letter.toUpperCase());

  const income = spokenIncome(text);
  if (income) updates.annualIncome = income;

  if (/\b(scheduled caste|\bsc\b)\b/.test(text)) updates.caste = "SC";
  else if (/\b(scheduled tribe|\bst\b)\b/.test(text)) updates.caste = "ST";
  else if (/\bobc\b/.test(text)) updates.caste = "OBC";
  else if (/\b(ews|general|open category)\b/.test(text)) updates.caste = "General / EWS";

  if (/\bminority\b/.test(text)) updates.communityStatus = "Minority";
  else if (/\bmajority\b/.test(text)) updates.communityStatus = "Majority";

  if (/\b(no disability|not disabled|no i don t|no i do not)\b/.test(text)) updates.disability = "No";
  else if (/\b(disability|disabled|divyang|divyang)\b/.test(text)) updates.disability = "Yes";

  return updates;
}

function OptionPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`option-pill ${active ? "is-active" : ""}`} onClick={onClick} aria-pressed={active}>
      <span className="pill-check"><Icon name="check" /></span>
      {children}
    </button>
  );
}

function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="field-hint">{children}</p>;
}

function SchemeResult({ badge, title, description, accent }: { badge: string; title: string; description: string; accent: "green" | "saffron" | "blue" }) {
  return (
    <article className={`scheme-result scheme-${accent}`}>
      <div className="scheme-icon"><Icon name="sparkle" /></div>
      <div>
        <span className="scheme-badge">{badge}</span>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <button type="button" className="scheme-link">View details <Icon name="arrow" /></button>
    </article>
  );
}

export default function Home() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [isListening, setIsListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState("Say an answer in English or Hindi. You can always edit it below.");
  const [transcript, setTranscript] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const recognitionRef = useRef<RecognitionInstance | null>(null);

  const completedCount = useMemo(
    () => Object.values(values).filter(Boolean).length,
    [values],
  );

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShowIntro(false);
      return;
    }
    const introTimer = window.setTimeout(() => setShowIntro(false), 3600);
    return () => window.clearTimeout(introTimer);
  }, []);

  const update = (field: FieldName, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateStep = (targetStep: number) => {
    const nextErrors: Partial<Record<FieldName, string>> = {};
    stepFields[targetStep].forEach((field) => {
      const value = values[field].trim();
      if (!value) nextErrors[field] = "Please choose an answer.";
    });
    if (values.age && (Number(values.age) < 1 || Number(values.age) > 120)) nextErrors.age = "Enter an age between 1 and 120.";
    if (values.annualIncome && Number(values.annualIncome) < 0) nextErrors.annualIncome = "Income cannot be negative.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const moveNext = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, stepNames.length - 1));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateStep(step)) return;
    if (step < stepNames.length - 1) {
      setStep((current) => current + 1);
      return;
    }
    setShowResults(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startVoice = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage("Voice input is not available in this browser. You can fill the form using the large answer buttons.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const result = event.results[event.results.length - 1];
      const heard = result?.[0]?.transcript?.trim() ?? "";
      if (!heard) return;
      setTranscript(heard);
      const updates = updatesFromSpeech(heard);
      const changedFields = Object.keys(updates) as FieldName[];
      if (changedFields.length) {
        setValues((current) => ({ ...current, ...updates }));
        setErrors((current) => {
          const next = { ...current };
          changedFields.forEach((field) => delete next[field]);
          return next;
        });
        setVoiceMessage(`I filled ${changedFields.map((field) => labels[field].toLowerCase()).join(", ")}. Please check the answer.`);
      } else {
        setVoiceMessage("I heard you, but could not match that answer. Try saying “I am a 28 year old female from Bihar” or choose an answer below.");
      }
    };
    recognition.onerror = (event) => {
      const message = event.error === "not-allowed"
        ? "Microphone permission was not allowed. Please enable it or use the form below."
        : "I could not hear that clearly. Please try again or choose an answer below.";
      setVoiceMessage(message);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setVoiceMessage("Listening… speak naturally, one or more answers at a time.");
    setIsListening(true);
    recognition.start();
  };

  const readQuestion = () => {
    if (!("speechSynthesis" in window)) {
      setVoiceMessage("Audio playback is not available in this browser.");
      return;
    }
    const prompts = [
      "Let us start with a few details about you. Tell me your gender, age, state, and whether you have a disability.",
      "Now tell me if you are earning, your employment status, profession, and annual family income.",
      "Finally, choose your caste category and whether you belong to a minority or majority community.",
    ];
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(prompts[step]);
    utterance.lang = "en-IN";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    setVoiceMessage("Reading this step aloud. You can answer by tapping the microphone.");
  };

  if (showIntro) {
    return <HopeIntro onFinish={() => setShowIntro(false)} />;
  }

  if (showResults) {
    const income = Number(values.annualIncome || 0);
    const matches = getSchemeMatches(values);
    const profileLine = [values.age && `${values.age} years`, values.state, values.employmentStatus].filter(Boolean).join(" · ");
    return (
      <main className="app-shell results-shell">
        <header className="topbar">
          <button type="button" className="brand" onClick={() => setShowResults(false)} aria-label="Back to UMEED form">
            <UmeedMark />
            <span>UMEED</span>
          </button>
          <span className="language-chip">English <span>⌄</span></span>
        </header>
        <section className="results-hero">
          <div className="results-kicker"><span className="success-dot"><Icon name="check" /></span> Profile checked</div>
          <h1>Here is some <em>umeed</em> for you.</h1>
          <p>Based on the details you shared, these schemes may be worth exploring. We will explain eligibility and documents next.</p>
          <div className="profile-summary">
            <span>Profile</span>
            <strong>{profileLine || "Your details"}</strong>
            <button type="button" onClick={() => setShowResults(false)}>Edit answers</button>
          </div>
        </section>
        <section className="results-content" aria-labelledby="matches-title">
          <div className="results-heading">
            <div>
              <p className="eyebrow">Your possible matches</p>
              <h2 id="matches-title">Start with these {income && income <= 250000 ? "high-priority" : "recommended"} schemes</h2>
            </div>
            <span className="match-count">{matches.length} {matches.length === 1 ? "match" : "matches"}</span>
          </div>
          <div className="scheme-list">
            {matches.map((scheme) => <SchemeResult key={scheme.title} {...scheme} />)}
          </div>
          <aside className="next-card">
            <div className="next-card-icon"><Icon name="shield" /></div>
            <div><h3>What happens next?</h3><p>Choose a scheme to see why you may qualify and the documents you should carry.</p></div>
            <button type="button">See document checklist <Icon name="arrow" /></button>
          </aside>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#main-form" aria-label="UMEED home">
          <UmeedMark />
          <span>UMEED</span>
        </a>
        <div className="topbar-actions">
          <span className="help-text">Need help? <strong>1800-UMEED</strong></span>
          <button type="button" className="language-chip">English <span>⌄</span></button>
        </div>
      </header>

      <div className="main-layout">
        <aside className="welcome-panel" aria-label="About UMEED">
          <div className="sun-orb" />
          <p className="eyebrow light">Government support, made simple</p>
          <h1>Every benefit<br />should feel<br /><em>within reach.</em></h1>
          <p className="welcome-copy">Tell us a little about yourself. We will help you discover government schemes made for you.</p>
          <div className="trust-row">
            <span className="trust-icon"><Icon name="shield" /></span>
            <p><strong>Your information is private.</strong><br />Used only to check eligibility.</p>
          </div>
          <div className="people-strip" aria-hidden="true">
            <span className="person person-one">S</span><span className="person person-two">R</span><span className="person person-three">A</span>
            <p><strong>1,20,000+</strong> citizens guided this month</p>
          </div>
        </aside>

        <section className="form-panel" id="main-form">
          <div className="form-heading-row">
            <div>
              <p className="eyebrow">Eligibility checker</p>
              <h2>Let&apos;s find what can help you.</h2>
              <p className="form-intro">It takes about 3 minutes. There are no wrong answers.</p>
            </div>
            <div className="progress-count" aria-label={`${completedCount} of 10 answers complete`}><strong>{completedCount}</strong><span>/ 10</span></div>
          </div>

          <div className="stepper" aria-label="Questionnaire progress">
            {stepNames.map((name, index) => (
              <div className={`step-item ${index === step ? "current" : ""} ${index < step ? "done" : ""}`} key={name}>
                <span className="step-number">{index < step ? <Icon name="check" /> : index + 1}</span>
                <span>{name}</span>
              </div>
            ))}
          </div>

          <div className="voice-card">
            <div className={`voice-emblem ${isListening ? "listening" : ""}`}><Icon name="mic" /></div>
            <div className="voice-copy">
              <strong>Prefer to speak?</strong>
              <p aria-live="polite">{voiceMessage}</p>
              {transcript && <span className="transcript">“{transcript}”</span>}
            </div>
            <div className="voice-actions">
              <button type="button" className="listen-button" onClick={startVoice} aria-pressed={isListening}>
                <Icon name="mic" /> {isListening ? "Stop listening" : "Speak answers"}
              </button>
              <button type="button" className="read-button" onClick={readQuestion} aria-label="Read this step aloud"><Icon name="volume" /></button>
            </div>
          </div>

          <form onSubmit={submit} noValidate>
            {step === 0 && <section className="question-group" aria-labelledby="step-about">
              <div className="group-title"><span>Step 1</span><h3 id="step-about">A few details about you</h3></div>
              <div className="field-block">
                <label>What is your gender?<span aria-hidden="true">*</span></label>
                <div className="option-row">
                  {["Male", "Female", "Other"].map((item) => <OptionPill key={item} active={values.gender === item} onClick={() => update("gender", item)}>{item}</OptionPill>)}
                </div>
                {errors.gender && <FieldHint>{errors.gender}</FieldHint>}
              </div>
              <div className="split-fields">
                <div className="field-block">
                  <label htmlFor="age">What is your age?<span aria-hidden="true">*</span></label>
                  <div className="input-shell"><input id="age" inputMode="numeric" type="number" min="1" max="120" placeholder="e.g. 28" value={values.age} onChange={(event) => update("age", event.target.value)} /><span>years</span></div>
                  {errors.age && <FieldHint>{errors.age}</FieldHint>}
                </div>
                <div className="field-block">
                  <label htmlFor="state">Where do you live?<span aria-hidden="true">*</span></label>
                  <select id="state" value={values.state} onChange={(event) => update("state", event.target.value)}><option value="">Select state</option>{states.map((item) => <option key={item}>{item}</option>)}</select>
                  {errors.state && <FieldHint>{errors.state}</FieldHint>}
                </div>
              </div>
              <div className="field-block">
                <label>Do you have a disability?<span aria-hidden="true">*</span></label>
                <div className="option-row">
                  <OptionPill active={values.disability === "Yes"} onClick={() => update("disability", "Yes")}>Yes</OptionPill>
                  <OptionPill active={values.disability === "No"} onClick={() => update("disability", "No")}>No</OptionPill>
                </div>
                <FieldHint>This may help us show additional support schemes.</FieldHint>
                {errors.disability && <FieldHint>{errors.disability}</FieldHint>}
              </div>
            </section>}

            {step === 1 && <section className="question-group" aria-labelledby="step-work">
              <div className="group-title"><span>Step 2</span><h3 id="step-work">Your work and income</h3></div>
              <div className="field-block">
                <label>What is your earning status?<span aria-hidden="true">*</span></label>
                <div className="option-row"><OptionPill active={values.earningStatus === "Earning"} onClick={() => update("earningStatus", "Earning")}>Earning</OptionPill><OptionPill active={values.earningStatus === "Non-earning"} onClick={() => update("earningStatus", "Non-earning")}>Non-earning</OptionPill></div>
                {errors.earningStatus && <FieldHint>{errors.earningStatus}</FieldHint>}
              </div>
              <div className="field-block">
                <label>What best describes your current status?<span aria-hidden="true">*</span></label>
                <div className="option-row status-row">{["Student", "Employed", "Self-employed", "Business"].map((item) => <OptionPill key={item} active={values.employmentStatus === item} onClick={() => update("employmentStatus", item)}>{item}</OptionPill>)}</div>
                {errors.employmentStatus && <FieldHint>{errors.employmentStatus}</FieldHint>}
              </div>
              <div className="split-fields">
                <div className="field-block"><label htmlFor="profession">What is your profession?<span aria-hidden="true">*</span></label><input id="profession" placeholder="e.g. Farmer, teacher, tailor" value={values.profession} onChange={(event) => update("profession", event.target.value)} />{errors.profession && <FieldHint>{errors.profession}</FieldHint>}</div>
                <div className="field-block"><label htmlFor="income">Annual family income<span aria-hidden="true">*</span></label><div className="input-shell prefix"><span>₹</span><input id="income" inputMode="numeric" type="number" min="0" placeholder="e.g. 250000" value={values.annualIncome} onChange={(event) => update("annualIncome", event.target.value)} /></div>{errors.annualIncome && <FieldHint>{errors.annualIncome}</FieldHint>}</div>
              </div>
              <FieldHint>Use your best estimate. This helps check income-based support.</FieldHint>
            </section>}

            {step === 2 && <section className="question-group" aria-labelledby="step-community">
              <div className="group-title"><span>Step 3</span><h3 id="step-community">A little more to personalise results</h3></div>
              <div className="sensitive-note"><Icon name="shield" /><p>These details help us surface schemes with specific eligibility. You can choose “Prefer not to say”, and UMEED does not share your information.</p></div>
              <div className="field-block">
                <label htmlFor="caste">What is your caste category?<span aria-hidden="true">*</span></label>
                <select id="caste" value={values.caste} onChange={(event) => update("caste", event.target.value)}><option value="">Choose a category</option><option>SC</option><option>ST</option><option>OBC</option><option>General / EWS</option><option>Prefer not to say</option></select>
                {errors.caste && <FieldHint>{errors.caste}</FieldHint>}
              </div>
              <div className="field-block">
                <label>Do you identify as part of a minority community?<span aria-hidden="true">*</span></label>
                <div className="option-row"><OptionPill active={values.communityStatus === "Minority"} onClick={() => update("communityStatus", "Minority")}>Minority</OptionPill><OptionPill active={values.communityStatus === "Majority"} onClick={() => update("communityStatus", "Majority")}>Majority</OptionPill><OptionPill active={values.communityStatus === "Prefer not to say"} onClick={() => update("communityStatus", "Prefer not to say")}>Prefer not to say</OptionPill></div>
                {errors.communityStatus && <FieldHint>{errors.communityStatus}</FieldHint>}
              </div>
            </section>}

            <div className="form-actions">
              {step > 0 ? <button type="button" className="back-button" onClick={() => setStep((current) => current - 1)}><Icon name="back" /> Back</button> : <span />}
              {step < stepNames.length - 1 ? <button type="button" className="primary-button" onClick={moveNext}>Continue <Icon name="arrow" /></button> : <button type="submit" className="primary-button find-button">Find my schemes <Icon name="sparkle" /></button>}
            </div>
          </form>
          <p className="privacy-note"><Icon name="shield" /> Your answers stay private and are only used to check possible eligibility.</p>
        </section>
      </div>
    </main>
  );
}
