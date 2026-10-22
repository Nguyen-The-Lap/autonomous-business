import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "quiet" | "outline"; asChild?: boolean };

export function Button({ className, variant = "primary", asChild = false, ...props }: ButtonProps) {
  const Component = asChild ? Slot : "button";
  return <Component className={cn("button", variant === "primary" ? "button-primary" : variant === "outline" ? "button-outline" : "button-quiet", className)} {...props} />;
}
