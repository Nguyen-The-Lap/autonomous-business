import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AnchorHTMLAttributes } from "react";
import { AuthForm } from "@/components/auth-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("next/link", () => ({ default: ({ children, href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => <a href={href} {...props}>{children}</a> }));
vi.mock("@/lib/actions", () => ({ signIn: vi.fn(), signUp: vi.fn() }));

describe("AuthForm", () => {
  it("renders accessible sign-in controls", () => {
    render(<AuthForm mode="login"/>);
    expect(screen.getByRole("heading", { name: "Good to see you." })).toBeInTheDocument();
    expect(screen.getByLabelText("Email address")).toHaveAttribute("type", "email");
    expect(screen.getByLabelText("Password")).toHaveAttribute("autocomplete", "current-password");
  });

  it("communicates the signup confirmation state", () => {
    render(<AuthForm mode="login" registered/>);
    expect(screen.getByRole("status")).toHaveTextContent("check your inbox");
  });
});
