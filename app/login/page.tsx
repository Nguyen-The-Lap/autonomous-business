import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ registered?: string }> }) {
  const { registered } = await searchParams;
  return <><header className="container flex h-[76px] items-center justify-between"><Link href="/" className="flex items-center gap-2.5 text-[16px] font-semibold"><span className="grid size-8 place-items-center rounded-full bg-forest font-serif italic text-white">c.</span>clearbrief</Link><Link href="/" aria-label="Return to home" className="button button-quiet"><ArrowLeft size={15}/><span className="max-sm:hidden">Back home</span></Link></header><AuthForm mode="login" registered={registered === "1"}/></>;
}
