"use client";

import Link from "next/link";
import { useActionState, type InputHTMLAttributes } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { signIn, signUp, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";

const initialState: ActionState = {};

export function AuthForm({ mode, registered = false }: { mode: "login" | "signup"; registered?: boolean }) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction, pending] = useActionState(action, initialState);
  return <main className="container grid min-h-[calc(100svh-140px)] max-w-5xl items-center gap-12 py-12 md:grid-cols-2">
    <div className="hidden md:block"><p className="eyebrow mb-4">A thoughtful start</p><h1 className="serif text-6xl leading-[1.06]">Make space for<br/><em className="text-forest">clear thinking.</em></h1><p className="mt-6 max-w-sm text-sm leading-7 text-muted">Keep the important details close, and let your next client conversation start with a little more clarity.</p><div className="mt-9 flex items-center gap-2 text-xs text-muted"><LockKeyhole size={14} className="text-forest"/>Your briefs are private to your account.</div></div>
    <section className="panel mx-auto w-full max-w-[440px] p-7 sm:p-9"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs text-muted hover:text-forest"><ArrowLeft size={14}/>Back to Clearbrief</Link><p className="eyebrow mb-2">{mode === "login" ? "Welcome back" : "Start with the essentials"}</p><h2 className="serif text-[34px]">{mode === "login" ? "Good to see you." : "Create your space."}</h2><p className="mt-2 text-xs leading-6 text-muted">{mode === "login" ? "Sign in to pick up where you left off." : "Create an account to save your project briefs."}</p>
      {registered && <p role="status" className="mt-5 rounded-xl bg-sage p-3 text-xs leading-5 text-forest">Account request received. If email confirmation is enabled in Supabase, check your inbox to finish signing in.</p>}
      <nav aria-label="Account access" className="mt-6 grid grid-cols-2 rounded-full bg-[#f1f3ee] p-1 text-center text-xs"><Link aria-current={mode === "login" ? "page" : undefined} className={`rounded-full py-2 ${mode === "login" ? "bg-white font-semibold text-forest shadow-sm" : "text-muted"}`} href="/login">Sign in</Link><Link aria-current={mode === "signup" ? "page" : undefined} className={`rounded-full py-2 ${mode === "signup" ? "bg-white font-semibold text-forest shadow-sm" : "text-muted"}`} href="/signup">Create account</Link></nav>
      <form action={formAction} className="mt-6 grid gap-4" aria-describedby={state.error ? "auth-error" : undefined}>
        {mode === "signup" && <Field name="name" label="Your name" type="text" autoComplete="name" error={state.fields?.name} required/>}
        <Field name="email" label="Email address" type="email" autoComplete="email" error={state.fields?.email} required/>
        <Field name="password" label="Password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} hint={mode === "signup" ? "Use at least 10 characters." : undefined} error={state.fields?.password} required minLength={10}/>
        {state.error && <p id="auth-error" role="alert" className="rounded-lg bg-[#fbefed] px-3 py-2 text-xs text-[#8f302a]">{state.error}</p>}
        <Button type="submit" disabled={pending} className="mt-1 w-full">{pending ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}<ArrowRight size={15}/></Button>
      </form><p className="mt-5 text-center text-[10px] leading-5 text-muted">By continuing, you agree to keep client details confidential and use Clearbrief for private planning notes.</p>
    </section>
  </main>;
}

function Field({ name, label, error, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { name: string; label: string; error?: string; hint?: string }) {
  const errorId = `${name}-error`;
  return <label htmlFor={name} className="grid gap-1.5 text-xs font-medium text-ink">{label}<input {...props} id={name} name={name} className="input" aria-invalid={Boolean(error)} aria-describedby={error ? errorId : hint ? `${name}-hint` : undefined}/>{error ? <span id={errorId} className="font-normal text-[#a23c35]">{error}</span> : hint ? <span id={`${name}-hint`} className="font-normal text-muted">{hint}</span> : null}</label>;
}
