"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { authClient } from "../lib/auth-client";

/** Gates Studio behind a durable Better Auth browser session, auto-creating an anonymous session for zero friction. */
export function AccountGate({ children }: { children: ReactNode }) {
  return <StudioSessionGate>{children}</StudioSessionGate>;
}

function StudioSessionGate({ children }: { children: ReactNode }) {
  const { data: session, isPending } = authClient.useSession();
  const [signingInAnon, setSigningInAnon] = useState(false);
  const [anonError, setAnonError] = useState("");

  useEffect(() => {
    if (!isPending && !session && !signingInAnon) {
      setSigningInAnon(true);
      authClient.signIn.anonymous()
        .catch((err) => {
          console.error("Anonymous sign in failed:", err);
          setAnonError(err?.message ?? "Could not start anonymous session");
        })
        .finally(() => {
          setSigningInAnon(false);
        });
    }
  }, [isPending, session, signingInAnon]);

  if (isPending || (!session && signingInAnon)) {
    return (
      <main className="studio-shell">
        <p className="status" role="status">Initializing your Cradle environment…</p>
      </main>
    );
  }

  if (anonError && !session) {
    return (
      <main className="studio-shell">
        <p className="error" role="alert">{anonError}</p>
        <button
          className="button primary"
          onClick={() => {
            setAnonError("");
            setSigningInAnon(true);
            authClient.signIn.anonymous().finally(() => setSigningInAnon(false));
          }}
        >
          Retry
        </button>
      </main>
    );
  }

  return <>{children}</>;
}

/** Modal component to convert an anonymous user session into a permanent account. */
export function ClaimAccountModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      // Convert anonymous account to email/password account
      const result = await authClient.signUp.email({
        email,
        password,
        name: name.trim() || email.split("@")[0] || "User",
      });

      if (result.error) {
        setError(result.error.message ?? "Could not save your account.");
      } else {
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.6)",
      backdropFilter: "blur(4px)",
      zIndex: 2147483646,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 20
    }}>
      <div className="connect-card" style={{ width: "min(420px, 100%)", position: "relative" }}>
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "none",
            border: "none",
            fontSize: "1.2rem",
            cursor: "pointer",
            fontWeight: 800
          }}
        >
          ✕
        </button>
        <span className="eyebrow">Claim Account</span>
        <h2>Save your projects</h2>
        <p style={{ margin: "6px 0 18px", fontSize: ".8rem", color: "var(--muted)" }}>
          Link an email to keep access to your website character across any browser or device.
        </p>

        <form onSubmit={(e) => void submit(e)}>
          <label htmlFor="claim-name">
            Name (optional)
            <input
              id="claim-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label htmlFor="claim-email">
            Email
            <input
              id="claim-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>
          <label htmlFor="claim-password">
            Password
            <input
              id="claim-password"
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? "Saving…" : "Save Account"}
          </button>
        </form>
        {error && <p className="error" role="alert" style={{ marginTop: 12 }}>{error}</p>}
      </div>
    </div>
  );
}
