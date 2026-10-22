"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({ className, children, ...props }: ComponentProps<typeof DialogPrimitive.Content>) {
  return <DialogPrimitive.Portal><DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-[#19231dbd] backdrop-blur-sm"/><DialogPrimitive.Content {...props} className={cn("panel fixed left-1/2 top-1/2 z-50 max-h-[min(90vh,760px)] max-h-[min(90dvh,760px)] w-[min(480px,calc(100%-32px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain p-7 shadow-2xl sm:p-8", className)}>{children}<DialogPrimitive.Close aria-label="Close dialog" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-muted hover:bg-paper"><X size={17}/></DialogPrimitive.Close></DialogPrimitive.Content></DialogPrimitive.Portal>;
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogDescription = DialogPrimitive.Description;
