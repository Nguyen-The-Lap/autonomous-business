import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create your account" };

export default function SignupPage() {
  return <><header className="container flex h-[76px] items-center"><Link href="/" className="flex items-center gap-2.5 text-[16px] font-semibold"><span className="grid size-8 place-items-center rounded-full bg-forest font-serif italic text-white">c.</span>clearbrief</Link></header><AuthForm mode="signup"/></>;
}
