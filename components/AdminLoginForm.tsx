"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/actions";

export default function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, { error: null });

  return (
    <form action={formAction}>
      <label>
        Email address
        <input name="email" type="email" autoComplete="username" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete="current-password" required />
      </label>
      {state.error && <p className="notice" role="alert">{state.error}</p>}
      <button type="submit" className="btn btn-primary" disabled={isPending}>
        {isPending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
