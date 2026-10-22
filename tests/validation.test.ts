import { describe, expect, it } from "vitest";
import { credentialsSchema, projectSchema } from "@/lib/validation";

describe("credential validation", () => {
  it("normalizes a valid email address", () => {
    expect(credentialsSchema.parse({ name: "Riley", email: "RILEY@Example.com", password: "clear and private" }).email).toBe("riley@example.com");
  });

  it("rejects malformed email addresses and short passwords", () => {
    expect(credentialsSchema.safeParse({ email: "bad", password: "short" }).success).toBe(false);
  });
});

describe("project validation", () => {
  it("trims text, defaults notes, and rounds estimates to cents", () => {
    expect(projectSchema.parse({ title: "  Identity  ", client: " Studio ", estimate: "1200.235" })).toEqual({ title: "Identity", client: "Studio", description: "", estimate: 1200.24 });
  });

  it("rejects negative or out-of-range estimates and long notes", () => {
    expect(projectSchema.safeParse({ title: "A scope", client: "Studio", estimate: -1 }).success).toBe(false);
    expect(projectSchema.safeParse({ title: "A scope", client: "Studio", estimate: 10000001 }).success).toBe(false);
    expect(projectSchema.safeParse({ title: "A scope", client: "Studio", estimate: 1, description: "x".repeat(1001) }).success).toBe(false);
  });
});
