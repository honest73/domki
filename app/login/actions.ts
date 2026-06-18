"use server";

import { redirect } from "next/navigation";
import { checkPassword, createSession } from "@/lib/auth";

export async function login(_prev: string | undefined, formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const ok = await checkPassword(password);
  if (!ok) return "Nieprawidłowe hasło.";
  await createSession();
  redirect("/panel");
}
