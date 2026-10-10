"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't sign in");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach MyFantasyLeague. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mfl-card" style={{ display: "flex", flexDirection: "column", gap: "var(--space-5)" }}>
      <div className="mfl-field">
        <label htmlFor="username" className="mfl-eyebrow">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          className="mfl-input"
          autoComplete="username"
          autoCapitalize="none"
          autoCorrect="off"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="mfl-field">
        <label htmlFor="password" className="mfl-eyebrow">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          className="mfl-input"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <p role="alert" className="mfl-note mfl-note--error">
          {error}
        </p>
      )}
      <button type="submit" className="mfl-btn mfl-btn--accent mfl-btn--block" disabled={loading}>
        {loading ? "Signing in" : "Sign in"}
      </button>
      <p className="mfl-caption" style={{ margin: 0 }}>
        Your login goes straight to MyFantasyLeague. This app never stores your password.
      </p>
    </form>
  );
}
