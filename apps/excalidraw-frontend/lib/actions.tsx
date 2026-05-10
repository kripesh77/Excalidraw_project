"use server";

import { cookies } from "next/headers";
import {
  AuthActionErrors,
  SigninActionState,
  SignupActionState,
} from "./types";
import axios from "axios";
import { redirect } from "next/navigation";

export async function signin(_: SigninActionState, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const email = rawData.email as string;
  const password = rawData.password as string;
  try {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/signin`,
      {
        email,
        password,
      },
    );

    const refreshToken = response.data.data.refreshToken;

    const cookieStore = await cookies();

    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
      sameSite: "lax",
    });
    redirect("/dashboard");
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      let errors: AuthActionErrors = err.response?.data?.errors ||
        err.response?.data.message || {
          email: "Something went wrong",
        };

      const cookieStore = await cookies();

      if (err.response?.data.message === "Incorrect password") {
        errors = {
          password: "Incorrect password",
        };
        cookieStore.delete("auth_token");
      }

      if (err.response?.data.message === "User doesn't exist") {
        errors = {
          email: "User doesn't exist",
        };
        cookieStore.delete("auth_token");
      }
      return {
        error: errors,
        formData: { email, password },
      };
    }

    return { error: { error: "Unexpected error occurred" } };
  }
}

export async function signup(_: SignupActionState, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const username = rawData.username;
  const email = rawData.email as string;
  const password = rawData.password as string;

  // this flag is introduced as redirect doesn't work reliably inside try...catch.
  // it throws an special internal error to trigger navigation
  // so that error is swallowed by try catch
  // the success flag is just a work around
  let success = false;

  try {
    await axios.post(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/signup`,
      { username, email, password },
    );
    success = true;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      let errors: AuthActionErrors = err.response?.data?.errors ||
        err.response?.data.message || {
          email: "Something went wrong",
        };

      if (err.response?.data.status === "fail") {
        if (err.response.data.message.includes("email")) {
          errors = {
            email: "Email is already taken",
          };
        } else if (err.response.data.message.includes("username")) {
          errors = {
            username: "Username is already taken",
          };
        }
      }
      return {
        error: errors,
        formData: { username, email, password },
      };
    }

    return { error: { error: "Unexpected error occurred" } };
  }
  if (success) {
    redirect("/verify");
  }
}
