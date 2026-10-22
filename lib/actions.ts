"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { credentialsSchema, projectSchema } from "@/lib/validation";

export type ActionState = { error?: string; fields?: Record<string, string> };

function fieldErrors(error: z.ZodError): ActionState {
  return { error: "Check the highlighted fields and try again.", fields: Object.fromEntries(error.issues.map((issue) => [String(issue.path[0]), issue.message])) };
}

export async function signIn(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentialsSchema.pick({ email: true, password: true }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return fieldErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { error: "Email or password is incorrect." };
  revalidatePath("/", "layout");
  return redirect("/dashboard");
}

export async function signUp(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = credentialsSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success || !parsed.data.name) return parsed.success ? { fields: { name: "Add your name." } } : fieldErrors(parsed.error);
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name }, emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback` },
  });
  if (error) return { error: "We couldn't create your account. Check the details and try again." };
  return redirect("/login?registered=1");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}

export async function saveProject(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const raw = Object.fromEntries(formData);
  const parsed = projectSchema.safeParse(raw);
  if (!parsed.success) return fieldErrors(parsed.error);

  const id = z.string().uuid().safeParse(raw.id);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Your session expired. Sign in again to continue." };

  const result = id.success
    ? await supabase.from("projects").update(parsed.data).eq("id", id.data).select("id").maybeSingle()
    : await supabase.from("projects").insert({ ...parsed.data, user_id: user.id }).select("id").single();
  if (result.error) return { error: "We couldn't save this brief. Please try again." };
  if (id.success && !result.data) return { error: "This brief could not be found." };
  revalidatePath("/dashboard");
  return {};
}

export async function deleteProject(formData: FormData): Promise<ActionState> {
  const parsedId = z.string().uuid().safeParse(formData.get("id"));
  if (!parsedId.success) return { error: "This brief could not be found." };
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Your session expired. Sign in again to continue." };
  const { error } = await supabase.from("projects").delete().eq("id", parsedId.data);
  if (error) return { error: "We couldn't delete this brief. Please try again." };
  revalidatePath("/dashboard");
  return {};
}
