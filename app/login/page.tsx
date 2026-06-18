"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function LoginPage() {
  const [error, formAction, pending] = useActionState(login, undefined);

  return (
    <main className="flex-1 flex items-center justify-center p-6">
      <form
        action={formAction}
        className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 p-8 space-y-5"
      >
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-800">Bryziówka</h1>
          <p className="text-sm text-stone-500 mt-1">Panel rezerwacji</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-stone-700">
            Hasło właściciela
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoFocus
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-emerald-600 text-white py-2 font-medium hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "Logowanie…" : "Zaloguj się"}
        </button>
      </form>
    </main>
  );
}
