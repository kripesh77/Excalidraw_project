"use client";

import { useState } from "react";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  inputType?: string;
  rightLabel?: React.ReactNode;
}

export default function InputField({
  label,
  inputType = "text",
  rightLabel,
  ...props
}: InputFieldProps) {
  const [show, setShow] = useState(false);
  const INPUT =
    "w-full border-2 border-[#1a1a2e] rounded-[12px_16px_10px_18px/14px_10px_18px_12px] bg-white px-4 py-3 text-sm placeholder:text-[#1a1a2e]/40 focus:outline-none focus:shadow-[3px_3px_0_0_#7c3aed] focus:-translate-y-0.5 transition";

  const isPassword = inputType === "password";
  const type = isPassword ? (show ? "text" : "password") : inputType;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wide">
          {label}
        </label>
        {rightLabel}
      </div>
      <div className="relative">
        <input type={type} className={INPUT} {...props} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs cursor-pointer font-semibold text-[#1a1a2e]/60 hover:text-purple-600"
          >
            {show ? "hide" : "show"}
          </button>
        )}
      </div>
    </div>
  );
}
