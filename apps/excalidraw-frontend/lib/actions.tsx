"use server";

import { cookies } from "next/headers";
import {
  ActionErrors,
  CreateRoomActionState,
  JoinRoomActionState,
  SigninActionState,
  SignupActionState,
} from "./types";
import {
  getValidAccessToken,
  refreshAccessToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "@/lib/auth.server";
import { redirect, RedirectType } from "next/navigation";
import { revalidateTag } from "next/cache";

export async function signin(_: SigninActionState, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const email = rawData.email as string;
  const password = rawData.password as string;
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/signin`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      },
    );

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errors: ActionErrors = json?.errors ||
        json?.message || {
          email: "Something went wrong",
        };

      const cookieStore = await cookies();

      if (json?.message === "Incorrect password") {
        errors = {
          password: "Incorrect password",
        };
        cookieStore.delete("auth_token");
      }

      if (json?.message === "User doesn't exist") {
        errors = {
          email: "User doesn't exist",
        };
        cookieStore.delete("auth_token");
      }

      if (json?.message.startsWith("Please")) {
        errors = {
          email: "Please verify your email first",
        };
        cookieStore.delete("auth_token");
      }
      return {
        error: errors,
        formData: { email, password },
      };
    }

    const accessToken = json?.data?.accessToken as string | undefined;
    const refreshToken = json?.data?.refreshToken as string | undefined;

    if (!accessToken || !refreshToken) {
      return { error: { error: "Unexpected error occurred" } };
    }

    await setAccessTokenCookie(accessToken);
    await setRefreshTokenCookie(refreshToken);
  } catch {
    return { error: { error: "Unexpected error occurred" } };
  }
  redirect("/dashboard", RedirectType.replace);
}

export async function signup(_: SignupActionState, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const username = rawData.username;
  const email = rawData.email as string;
  const password = rawData.password as string;

  let success = false;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/auth/signup`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      },
    );

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      let errors: ActionErrors = json?.errors ||
        json?.message || {
          email: "Something went wrong",
        };

      if (json?.status === "fail" && typeof json?.message === "string") {
        if (json.message.includes("email")) {
          errors = {
            email: "Email is already taken",
          };
        } else if (json.message.includes("username")) {
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

    success = true;
  } catch {
    return { error: { error: "Unexpected error occurred" } };
  }
  if (success) {
    redirect("/verify", RedirectType.replace);
  }
}

export async function createRoom(
  _: CreateRoomActionState | undefined,
  formData: FormData,
): Promise<CreateRoomActionState | undefined> {
  const rawData = Object.fromEntries(formData.entries());
  const roomName = rawData.create as string;

  let accessToken = await getValidAccessToken(true);

  if (!accessToken) {
    return { error: { create: "Unauthorized" } };
  }

  const makeRequest = (token: string) =>
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ roomName }),
    });

  try {
    if (!roomName) {
      return { error: { create: "Room name can't be empty" } };
    }
    let response = await makeRequest(accessToken);

    if (response.status === 401) {
      accessToken = await refreshAccessToken(undefined, true);
      if (accessToken) {
        response = await makeRequest(accessToken);
      }
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const rawErrors = json?.errors?.properties?.roomName?.errors;
      const message =
        (Array.isArray(rawErrors) ? rawErrors.join(", ") : rawErrors) ||
        json?.message ||
        "Failed to create room";

      return {
        error: { create: message },
        formData: { create: roomName },
      };
    }

    revalidateTag("rooms", "default");
    return {
      formData: { create: "" },
    };
  } catch {
    return { error: { error: "Unexpected error occurred" } };
  }
}

export async function joinRoom(
  _: JoinRoomActionState | undefined,
  formData: FormData,
): Promise<JoinRoomActionState | undefined> {
  const rawData = Object.fromEntries(formData.entries());
  const slug = rawData.join as string;

  let accessToken = await getValidAccessToken(true);

  if (!accessToken) {
    return { error: { join: "Unauthorized" } };
  }

  const makeRequest = (token: string) =>
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/room/join/${slug}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

  try {
    if (!slug) {
      return { error: { join: "Please enter the room id to join" } };
    }
    let response = await makeRequest(accessToken);

    if (response.status === 401) {
      accessToken = await refreshAccessToken(undefined, true);
      if (accessToken) {
        response = await makeRequest(accessToken);
      }
    }

    const json = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = json?.message || "Failed to join room";
      return {
        error: { join: message },
        formData: { join: slug },
      };
    }

    revalidateTag("rooms", "default");
    return {
      formData: { join: "" },
    };
  } catch {
    return { error: { error: "Unexpected error occurred" } };
  }
}
