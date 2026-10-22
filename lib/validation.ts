import { z } from "zod";

export const credentialsSchema = z.object({
  name: z.string().trim().min(2, "Use at least 2 characters.").max(80, "Name must be 80 characters or fewer.").optional(),
  email: z.string().trim().email("Enter a valid email address.").max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(10, "Use at least 10 characters.").max(200, "Password must be 200 characters or fewer."),
});

export const projectSchema = z.object({
  title: z.string().trim().min(2, "Add a project name (at least 2 characters).").max(100),
  client: z.string().trim().min(1, "Add a client name.").max(100),
  description: z.string().trim().max(1000, "Description must be 1,000 characters or fewer.").default(""),
  estimate: z.coerce.number().finite().min(0, "Estimate cannot be negative.").max(10_000_000, "Estimate must be $10,000,000 or less.").transform((amount) => Math.round(amount * 100) / 100),
});

export type ProjectInput = z.infer<typeof projectSchema>;
