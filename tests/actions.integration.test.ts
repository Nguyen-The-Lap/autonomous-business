import { beforeEach, describe, expect, it, vi } from "vitest";
import { deleteProject, saveProject, signIn, signUp } from "@/lib/actions";

const { createClient, insert, update, deleteQuery, eq } = vi.hoisted(() => ({ createClient: vi.fn(), insert: vi.fn(), update: vi.fn(), deleteQuery: vi.fn(), eq: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));

describe("saveProject server action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    insert.mockReturnValue({ select: () => ({ single: async () => ({ data: { id: "new-project" }, error: null }) }) });
    eq.mockReturnValue({ select: () => ({ maybeSingle: async () => ({ data: { id: "123e4567-e89b-42d3-a456-426614174000" }, error: null }) }) });
    update.mockReturnValue({ eq });
    createClient.mockResolvedValue({
      auth: { getUser: async () => ({ data: { user: { id: "user-123" } }, error: null }) },
      from: () => ({ insert, update, delete: () => ({ eq: deleteQuery }) }),
    });
  });

  it("rejects invalid estimates before contacting Supabase", async () => {
    const form = new FormData();
    form.set("title", "Scope"); form.set("client", "Studio"); form.set("estimate", "-1");
    const result = await saveProject({}, form);
    expect(result.fields?.estimate).toMatch(/negative/);
    expect(createClient).not.toHaveBeenCalled();
  });

  it("checks the signed-in user and assigns ownership server-side", async () => {
    const form = new FormData();
    form.set("title", "Identity"); form.set("client", "Studio"); form.set("estimate", "1250");
    const result = await saveProject({}, form);
    expect(result).toEqual({});
    expect(insert).toHaveBeenCalledWith({ title: "Identity", client: "Studio", description: "", estimate: 1250, user_id: "user-123" });
  });

  it("does not insert when the server session has expired", async () => {
    createClient.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: null }, error: null }) }, from: () => ({ insert }) });
    const form = new FormData();
    form.set("title", "Identity"); form.set("client", "Studio"); form.set("estimate", "1250");
    expect(await saveProject({}, form)).toEqual({ error: "Your session expired. Sign in again to continue." });
    expect(insert).not.toHaveBeenCalled();
  });

  it("updates only the requested brief with validated fields", async () => {
    const form = new FormData();
    form.set("id", "123e4567-e89b-42d3-a456-426614174000");
    form.set("title", "  New scope  "); form.set("client", "Studio"); form.set("estimate", "1250.50");
    expect(await saveProject({}, form)).toEqual({});
    expect(update).toHaveBeenCalledWith({ title: "New scope", client: "Studio", description: "", estimate: 1250.5 });
    expect(eq).toHaveBeenCalledWith("id", "123e4567-e89b-42d3-a456-426614174000");
    expect(insert).not.toHaveBeenCalled();
  });

  it("does not report a successful update when the brief is missing", async () => {
    eq.mockReturnValue({ select: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) });
    const form = new FormData();
    form.set("id", "123e4567-e89b-42d3-a456-426614174000");
    form.set("title", "New scope"); form.set("client", "Studio"); form.set("estimate", "1250");
    expect(await saveProject({}, form)).toEqual({ error: "This brief could not be found." });
  });

  it("does not access project storage when user lookup fails", async () => {
    const from = vi.fn();
    createClient.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: null }, error: new Error("auth unavailable") }) }, from });
    const form = new FormData();
    form.set("title", "New scope"); form.set("client", "Studio"); form.set("estimate", "1250");
    expect(await saveProject({}, form)).toEqual({ error: "Your session expired. Sign in again to continue." });
    expect(from).not.toHaveBeenCalled();
  });

  it("reports database deletion failures so the UI can keep the brief visible", async () => {
    deleteQuery.mockResolvedValue({ error: { message: "database unavailable" } });
    const form = new FormData();
    form.set("id", "123e4567-e89b-42d3-a456-426614174000");
    expect(await deleteProject(form)).toEqual({ error: "We couldn't delete this brief. Please try again." });
  });

  it("rejects malformed project IDs without contacting Supabase", async () => {
    const form = new FormData();
    form.set("id", "not-a-uuid");
    expect(await deleteProject(form)).toEqual({ error: "This brief could not be found." });
    expect(createClient).not.toHaveBeenCalled();
  });

  it("does not delete after a session error", async () => {
    createClient.mockResolvedValue({ auth: { getUser: async () => ({ data: { user: null }, error: new Error("expired") }) }, from: () => ({ delete: () => ({ eq: deleteQuery }) }) });
    const form = new FormData();
    form.set("id", "123e4567-e89b-42d3-a456-426614174000");
    expect(await deleteProject(form)).toEqual({ error: "Your session expired. Sign in again to continue." });
    expect(deleteQuery).not.toHaveBeenCalled();
  });

  it("returns a generic sign-in error when credentials are rejected", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: new Error("provider details") });
    createClient.mockResolvedValue({ auth: { signInWithPassword } });
    const form = new FormData();
    form.set("email", "person@example.com"); form.set("password", "long enough password");
    expect(await signIn({}, form)).toEqual({ error: "Email or password is incorrect." });
    expect(signInWithPassword).toHaveBeenCalledWith({ email: "person@example.com", password: "long enough password" });
  });

  it("validates signup before calling the auth provider", async () => {
    const signUpProvider = vi.fn();
    createClient.mockResolvedValue({ auth: { signUp: signUpProvider } });
    const form = new FormData();
    form.set("name", "A"); form.set("email", "bad"); form.set("password", "short");
    const result = await signUp({}, form);
    expect(result.fields).toMatchObject({ name: expect.any(String), email: expect.any(String), password: expect.any(String) });
    expect(signUpProvider).not.toHaveBeenCalled();
    expect(createClient).not.toHaveBeenCalled();
  });
});
