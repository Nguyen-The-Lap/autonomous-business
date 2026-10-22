import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function redirectTo(path: "/dashboard" | "/login?error=auth_callback") {
  // Keep Location relative so an untrusted Host or forwarded-host header cannot
  // turn the callback into a redirect to an attacker-controlled origin.
  return new NextResponse(null, { status: 303, headers: { Location: path } });
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return redirectTo("/dashboard");
  }
  return redirectTo("/login?error=auth_callback");
}
