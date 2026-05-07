import * as z from "zod";

export const signUpSchema = z
  .object({
    username: z
      .string("username must be atleast 3 char long")
      .min(3, "username must be atleast 3 char long"),
    email: z.email("Please provide a valid email"),
    password: z
      .string("Password must be 6 char long")
      .min(6, "Password must be 6 char long"),
    emailVerificationToken: z.string().optional(),
    emailVerificationExpires: z.date().optional(),
  })
  .strip();

export const signInSchema = z
  .object({
    email: z.email("Please provide a valid email"),
    password: z
      .string("Password must be 6 char long")
      .min(6, "Password must be 6 char long"),
  })
  .strip();

export const treeifyError = (err: Error) => {
  if (err instanceof z.ZodError) {
    return z.treeifyError(err);
  }
  return;
};

export type SignUpDto = z.infer<typeof signUpSchema>;
export type SignInDto = z.infer<typeof signInSchema>;
