"use client";

import { useEffect, useRef } from "react";

type Props = {
  screenX: number;
  screenY: number;
  initialValue: string;
  fontSize: number;
  zoom: number;
  onCommit: (text: string) => void;
  onCancel: () => void;
};

export function TextEditor({
  screenX,
  screenY,
  initialValue,
  fontSize,
  zoom,
  onCommit,
  onCancel,
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const readyRef = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    el.select();
    const id = requestAnimationFrame(() => {
      readyRef.current = true;
    });

    return () => cancelAnimationFrame(id);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    e.stopPropagation();
    if (e.key === "Escape") {
      onCancel();
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onCommit(ref.current?.value ?? "");
    }
  }

  function handleBlur() {
    if (!readyRef.current) {
      ref.current?.focus();
      return;
    }
    onCommit(ref.current?.value ?? "");
  }

  return (
    <textarea
      ref={ref}
      defaultValue={initialValue}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className="fixed m-0 resize-none overflow-hidden whitespace-pre bg-transparent p-0 text-[#1a1a2e] caret-indigo-500 outline-none leading-[1.4] z-50 font-[inherit]"
      style={{
        left: screenX,
        top: screenY,
        fontSize: `${fontSize * zoom}px`,
        minHeight: `${fontSize * zoom * 1.4}px`,
      }}
      onInput={(e) => {
        const el = e.currentTarget;
        el.style.width = "auto";
        el.style.height = "auto";
        el.style.width = `${el.scrollWidth}px`;
        el.style.height = `${el.scrollHeight}px`;
      }}
    />
  );
}
