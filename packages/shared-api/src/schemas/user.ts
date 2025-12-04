import { z } from "zod";

export const UserSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  onboardingComplete: z.boolean().optional(),
});

export type User = z.infer<typeof UserSchema>;

