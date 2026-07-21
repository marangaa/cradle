"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { authClient } from "../lib/auth-client";

/** Gates Studio behind a durable Better Auth browser session. */
export function AccountGate({ children }: { children: ReactNode }) {
  return <StudioSessionGate>{children}</StudioSessionGate>;
}

function StudioSessionGate({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const result = mode === "sign-in"
      ? await authClient.signIn.email({ email, password })
      : await authClient.signUp.email({ name, email, password });
    setBusy(false);
    if (result.error) setError(result.error.message ?? "We could not sign you in.");
  }

  if (isPending) return <main className="studio-shell"><p className="status" role="status">Checking your Studio session…</p></main>;
  if (session) return <>{children}</>;

  return <main className="studio-shell">
    <section className="connect-screen">
      <div className="connect-copy">
        <h1>Pick up where your site left off.</h1>
        <p>Sign in to create and manage your website character.</p>
      </div>
      <div className="connect-card">
        <span className="eyebrow">Account</span>
        <h2>{mode === "sign-in" ? "Welcome back." : "Create your account."}</h2>
        <form onSubmit={(event) => void submit(event)}>
          {mode === "sign-up" && <label htmlFor="account-name">Name<input id="account-name" required value={name} onChange={(event) => setName(event.target.value)} /></label>}
          <label htmlFor="account-email">Email<input id="account-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></label>
          <label htmlFor="account-password">Password<input id="account-password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} /></label>
          <button className="button primary" disabled={busy}>{busy ? "Please wait…" : mode === "sign-in" ? "Sign in" : "Create account"}</button>
        </form>
        <button className="quiet-button" type="button" onClick={() => { setError(""); setMode((current) => current === "sign-in" ? "sign-up" : "sign-in"); }}>
          {mode === "sign-in" ? "New to Cradle? Create an account" : "Already have an account? Sign in"}
        </button>
        {error && <p className="error" role="alert">{error}</p>}
      </div>
    </section>
  </main>;
}
