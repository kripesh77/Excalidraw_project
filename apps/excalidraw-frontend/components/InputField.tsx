"use client";

import {
  CreateRoomActionState,
  JoinRoomActionState,
  SigninActionState,
  SignupActionState,
} from "@/lib/types";
import { useState } from "react";

type ActionState =
  | SigninActionState
  | SignupActionState
  | CreateRoomActionState
  | JoinRoomActionState;

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  data?: ActionState | undefined;
  label: string;
  name: string;
  inputType?: string;
  rightLabel?: React.ReactNode;
}

export default function InputField({
  data,
  label,
  inputType = "text",
  rightLabel,
  name,
  ...props
}: InputFieldProps) {
  const [show, setShow] = useState(false);
  const INPUT =
    "w-full border-2 border-[#1a1a2e] rounded-[12px_16px_10px_18px/14px_10px_18px_12px] bg-white px-4 py-3 text-sm placeholder:text-[#1a1a2e]/40 focus:outline-none focus:shadow-[3px_3px_0_0_#7c3aed] focus:-translate-y-0.5 transition";

  const isPassword = inputType === "password";
  const type = isPassword ? (show ? "text" : "password") : inputType;

  const hasError = Boolean(data?.error && data?.error[name]);
  const errorMessage = data?.error?.[name];
  const defaultValue = data?.formData?.[name as keyof typeof data.formData];

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label
          className={`block text-xs font-bold uppercase tracking-wide ${hasError && "text-red-500"}`}
        >
          {label}
        </label>
        {rightLabel}
      </div>
      <div className="relative">
        <input
          type={type}
          className={INPUT}
          name={name}
          defaultValue={typeof defaultValue === "string" ? defaultValue : ""}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer font-semibold text-[#1a1a2e]/60 hover:text-purple-600 ${
              hasError ? "border-red-500 outline-red-500" : "border-slate-200"
            }`}
          >
            {show ? "hide" : "show"}
          </button>
        )}
      </div>
      <p className="text-red-500 text-sm">{errorMessage}</p>
    </div>
  );
}
