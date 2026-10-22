import Link from "next/link";
import { ArrowDownRight, ArrowRight, Check, Compass, FileText, Leaf, LockKeyhole, Sparkles } from "lucide-react";

const steps = [
  { number: "01", icon: Compass, title: "Capture the conversation", text: "Give the opportunity a name, note who it’s for, and keep the first thoughts somewhere useful." },
  { number: "02", icon: FileText, title: "Shape a starting scope", text: "Write down what the work could include, while the details are still fresh." },
  { number: "03", icon: Sparkles, title: "Set a first estimate", text: "Record a starting investment so your next client conversation has a clearer anchor." },
];

export default function HomePage() {
  return <>
    <a href="#main" className="skip-link">Skip to content</a>
    <header className="container flex h-[76px] items-center justify-between">
      <Link href="/" className="flex items-center gap-2.5 text-[16px] font-semibold tracking-tight" aria-label="Clearbrief home"><span className="grid size-8 place-items-center rounded-full bg-forest font-serif text-lg italic text-white">c.</span>clearbrief</Link>
      <nav aria-label="Main navigation" className="flex items-center gap-7 text-[13px] text-muted max-sm:gap-3"><a className="max-sm:hidden hover:text-forest" href="#how">How it works</a><a className="max-sm:hidden hover:text-forest" href="#pricing">Pricing</a><Link className="button button-outline" href="/login">Sign in <ArrowRight size={14}/></Link></nav>
    </header>
    <main id="main">
      <section className="container grid min-h-[590px] items-center gap-12 pb-16 pt-10 md:grid-cols-[1fr_0.95fr] md:pb-20 md:pt-16">
        <div className="relative z-10">
          <p className="eyebrow mb-5 flex items-center gap-2"><span className="size-1.5 rounded-full bg-forest"/>A calmer way to scope your next project</p>
          <h1 className="serif max-w-[620px] text-[clamp(3.1rem,7vw,5.5rem)] leading-[1.03]">Good work starts<br/>with <em className="text-forest">clear scope.</em></h1>
          <p className="mt-6 max-w-[465px] text-[15px] leading-8 text-muted">Turn the ideas in your first client conversation into a thoughtful project outline, a starting estimate, and a confident next step.</p>
          <div className="mt-7 flex flex-wrap items-center gap-4"><Link href="/signup" className="button button-primary px-5 py-3">Make your first brief <ArrowDownRight size={16}/></Link><span className="text-[11px] text-muted">Free to use · No card required</span></div>
          <div className="mt-12 flex items-center gap-3 text-[11px] text-muted"><span className="grid size-9 place-items-center rounded-full bg-sage text-forest"><Leaf size={17}/></span><span>Made for independent minds<br/><strong className="font-semibold text-ink">Your work. Your terms.</strong></span></div>
        </div>
        <div aria-label="Preview of a neatly organized project brief" className="noise relative mx-auto flex min-h-[410px] w-full max-w-[510px] items-center justify-center overflow-hidden rounded-[2rem] bg-[#eaf0e6] p-8">
          <div className="absolute -right-12 -top-16 size-64 rounded-full border border-[#d2dfd1]"/><div className="absolute -bottom-20 -left-12 size-72 rounded-full border border-[#d2dfd1]"/>
          <article className="panel relative w-full max-w-[360px] rotate-[-2deg] px-7 py-6 shadow-[0_22px_65px_#29332918]">
            <div className="flex items-center justify-between border-b border-line pb-4"><span className="grid size-7 place-items-center rounded-full bg-forest font-serif italic text-white">c.</span><span className="rounded-full bg-[#eef3eb] px-3 py-1 text-[9px] text-[#57705a]">● &nbsp;Draft brief</span></div>
            <div className="pt-5"><span className="eyebrow text-[8px]">Project overview</span><h2 className="serif mt-2 text-[25px] leading-tight">Brand foundations<br/>for <em className="text-forest">Sunday Studio</em></h2><p className="mt-2 max-w-[260px] text-[10px] leading-5 text-muted">A thoughtful identity system for an independent neighborhood coffee shop.</p></div>
            <div className="my-4 border-t border-line"/><span className="eyebrow text-[8px]">A good place to start</span>
            <div className="mt-2 grid gap-2 text-[10px] text-[#4d5c50]"><p><span className="mr-3 text-[#98a98f]">01</span>Brand discovery & direction</p><p><span className="mr-3 text-[#98a98f]">02</span>Core identity system</p><p><span className="mr-3 text-[#98a98f]">03</span>Launch-ready essentials</p></div>
            <div className="mt-4 flex items-center justify-between border-t border-line pt-4"><span className="eyebrow text-[7px]">Starting estimate · USD</span><strong className="serif text-[16px] text-forest">$4,800</strong></div>
          </article><span className="absolute bottom-10 left-4 rotate-[-5deg] bg-white px-3 py-2 text-[9px] text-muted shadow-lg">A little more clarity <ArrowRight className="ml-2 inline" size={12}/></span><span className="absolute right-5 top-10 rotate-[4deg] bg-white px-3 py-2 text-[9px] text-muted shadow-lg">Made to grow with you</span>
        </div>
      </section>
      <section className="container grid grid-cols-3 border-y border-line py-6 max-sm:gap-2">{[["01", "Make the fuzzy feel focused"], ["02", "Keep your next step in view"], ["03", "Start with what you know"]].map(([n, label]) => <div key={n} className="flex items-start gap-3 px-4 text-[12px] text-muted max-sm:px-1"><span className="font-serif text-forest">{n}</span><span>{label}</span></div>)}</section>
      <section id="how" className="container py-24 md:py-28"><div className="mx-auto max-w-xl text-center"><p className="eyebrow mb-3">Small steps, clearer starts</p><h2 className="serif text-4xl leading-tight md:text-[46px]">Make room for <em className="text-forest">good thinking.</em></h2><p className="mt-4 text-sm leading-7 text-muted">A simple place between the first conversation and the formal proposal.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3">{steps.map(({number,icon:Icon,title,text})=><article key={number} className="relative border-t border-line px-4 py-6"><span className="absolute right-4 top-5 font-serif text-sm text-[#98a98f]">{number}</span><span className="mb-5 grid size-10 place-items-center rounded-full bg-sage text-forest"><Icon size={18}/></span><h3 className="text-[15px] font-semibold">{title}</h3><p className="mt-2 max-w-[280px] text-[12px] leading-6 text-muted">{text}</p></article>)}</div></section>
      <section className="container flex flex-wrap items-center justify-between gap-7 rounded-[24px] bg-forest px-8 py-12 text-white md:px-14"><div><p className="eyebrow mb-3 text-[#c6d7c4]">A little clarity goes a long way</p><h2 className="serif text-3xl md:text-[38px]">Your next good project<br/>starts <em className="text-[#d5e4ce]">right here.</em></h2></div><Link href="/signup" className="button rounded-full bg-white px-5 py-3 text-forest hover:bg-[#eff4ec]">Start your first brief <ArrowRight size={15}/></Link></section>
      <section id="pricing" className="container py-24 text-center"><p className="eyebrow mb-3">Simple by design</p><h2 className="serif text-[38px]">A good place to <em className="text-forest">begin.</em></h2><article className="panel mx-auto mt-9 max-w-[440px] p-8 text-left"><span className="eyebrow">Early access</span><h3 className="serif mt-2 text-3xl">Clearbrief</h3><p className="text-xs text-muted">Everything you need to shape the first draft.</p><p className="serif mt-5 text-4xl text-forest">$0 <small className="font-sans text-xs text-muted">/ always free</small></p><ul className="my-5 grid gap-3 border-t border-line py-5 text-xs text-muted">{["Private project briefs", "Client and starting estimate tracking", "Edit or remove briefs anytime", "No payment details required"].map(x=><li key={x} className="flex gap-2"><Check size={14} className="text-forest"/>{x}</li>)}</ul><Link href="/signup" className="button button-primary w-full">Create a free account <ArrowRight size={14}/></Link><p className="mt-3 text-center text-[10px] text-muted">No paid plan or payment integration is currently offered.</p></article></section>
    </main>
    <footer className="container flex flex-wrap items-center justify-between gap-4 border-t border-line py-6 text-[10px] text-muted"><Link href="/" className="flex items-center gap-2 font-semibold text-ink"><span className="grid size-6 place-items-center rounded-full bg-forest font-serif italic text-white">c.</span>clearbrief</Link><span>© {new Date().getFullYear()} Clearbrief · Thoughtful work, one brief at a time.</span><span className="flex items-center gap-1"><LockKeyhole size={12}/> Private by design</span></footer>
  </>;
}
