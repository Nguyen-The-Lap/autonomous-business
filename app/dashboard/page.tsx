import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, BriefcaseBusiness, CircleHelp, Leaf, LogOut, Sparkles } from "lucide-react";
import { ProjectDialog } from "@/components/project-dialog";
import { signOut } from "@/lib/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your workspace" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: projects, error } = await supabase.from("projects").select("id,title,client,description,estimate,updated_at").order("updated_at", { ascending: false });
  const firstName = user.user_metadata.full_name?.trim().split(/\s+/)[0] || user.email?.split("@")[0] || "there";

  return <div className="min-h-svh">
    <a href="#workspace" className="skip-link">Skip to workspace</a>
    <header className="border-b border-line bg-paper/90"><div className="container flex h-[72px] items-center justify-between"><Link href="/" className="flex items-center gap-2.5 text-[15px] font-semibold"><span className="grid size-8 place-items-center rounded-full bg-forest font-serif italic text-white">c.</span>clearbrief</Link><div className="flex items-center gap-4"><span className="hidden text-xs text-muted sm:inline">{user.email}</span><form action={signOut}><button className="button button-quiet" type="submit"><LogOut size={15}/>Sign out</button></form></div></div></header>
    <main id="workspace" className="container max-w-[1060px] py-12 md:py-16">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="eyebrow mb-2 flex items-center gap-2"><Leaf size={13}/>Your private workspace</p><h1 className="serif text-[42px] leading-tight md:text-5xl">Good to see you, <em className="text-forest">{firstName}.</em></h1><p className="mt-2 text-sm text-muted">Keep the next good project moving, one clear detail at a time.</p></div><ProjectDialog/></div>
      {error ? <section role="alert" className="panel p-8"><h2 className="font-semibold">Your briefs couldn’t load.</h2><p className="mt-2 text-sm text-muted">Try refreshing this page. Your saved data hasn’t been changed.</p></section> : projects?.length ? <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{projects.map((project, index) => <article key={project.id} className="panel flex min-h-[240px] flex-col p-5"><div className="mb-6 flex items-center justify-between"><span className="font-serif text-sm text-[#91a18b]">{String(index + 1).padStart(2, "0")}</span><ProjectDialog project={project}/></div><p className="eyebrow text-[9px]">{project.client}</p><h2 className="serif mt-1 text-[23px] leading-tight">{project.title}</h2><p className="mt-2 line-clamp-3 flex-1 text-xs leading-6 text-muted">{project.description || "A new project, ready to take shape."}</p><div className="mt-4 flex items-center justify-between border-t border-line pt-3"><span className="eyebrow text-[8px]">Starting estimate · USD</span><strong className="serif text-lg text-forest">{new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(project.estimate)}</strong></div></article>)}</div> : <section className="panel noise grid min-h-[320px] place-items-center px-6 py-12 text-center"><div><span className="mx-auto grid size-12 place-items-center rounded-full bg-sage text-forest"><BriefcaseBusiness size={20}/></span><h2 className="serif mt-4 text-3xl">Your first brief starts here.</h2><p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-muted">Capture the client, the shape of the work, and an initial estimate. You can refine it as the conversation unfolds.</p><div className="mt-5"><ProjectDialog label="Create your first brief"/></div></div></section>}
      <aside className="mt-8 flex items-start gap-3 rounded-2xl border border-line bg-[#f0f3ed] p-4 text-xs text-muted"><Sparkles size={16} className="mt-0.5 shrink-0 text-forest"/><p className="flex-1 leading-6"><strong className="text-ink">A note on estimates.</strong> These are private starting points for your planning. They aren’t quotes, contracts, or accounting advice.</p><CircleHelp size={15} className="hidden shrink-0 text-[#8b998b] sm:block"/></aside>
    </main>
    <footer className="container flex justify-between border-t border-line py-5 text-[10px] text-muted"><span className="flex items-center gap-1"><Leaf size={12}/>Clearbrief · Private by design</span><Link className="flex items-center gap-1 hover:text-forest" href="/#how">How it works <ArrowUpRight size={11}/></Link></footer>
  </div>;
}
