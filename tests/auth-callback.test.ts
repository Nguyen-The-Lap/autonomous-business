import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "@/app/auth/callback/route";

const { createClient, exchangeCodeForSession } = vi.hoisted(() => ({
  createClient: vi.fn(),
  exchangeCodeForSession: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({ createClient }));

describe("auth callback redirects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    exchangeCodeForSession.mockResolvedValue({ error: null });
    createClient.mockResolvedValue({ auth: { exchangeCodeForSession } });
  });

  it("uses a same-origin relative destination even with a poisoned Host header", async () => {
    const request = new NextRequest("https://attacker.example/auth/callback?code=valid", {
      headers: { host: "attacker.example", "x-forwarded-host": "attacker.example" },
    });

    const response = await GET(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/dashboard");
  });

  it("returns a relative login destination when the code is missing or invalid", async () => {
    exchangeCodeForSession.mockResolvedValue({ error: new Error("invalid code") });
    const request = new NextRequest("https://attacker.example/auth/callback?code=bad");

    const response = await GET(request);

    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("/login?error=auth_callback");
  });
});
