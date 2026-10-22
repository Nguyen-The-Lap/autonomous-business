"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Application route failed", error); }, [error]);
  return <main className="container grid min-h-[70svh] place-items-center"><section role="alert" className="panel max-w-md p-8 text-center"><h1 className="serif text-3xl">Something went wrong.</h1><p className="mt-2 text-sm leading-6 text-muted">Your saved briefs are unchanged. Try again, or return to your workspace.</p><div className="mt-5 flex justify-center gap-3"><button onClick={reset} className="button button-primary"><RefreshCw size={14}/>Try again</button><Link href="/dashboard" className="button button-outline">Workspace</Link></div></section></main>;
}
