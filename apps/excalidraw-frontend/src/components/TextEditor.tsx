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

  console.log("TextEditor about to return JSX");

  return (
    <textarea
      ref={ref}
      defaultValue={initialValue}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      style={{
        position: "fixed",
        left: screenX,
        top: screenY,
        fontSize: fontSize * zoom,
        lineHeight: 1.4,
        minWidth: 4,
        minHeight: fontSize * zoom * 1.4,
        padding: 0,
        margin: 0,
        outline: "none",
        background: "transparent",
        resize: "none",
        overflow: "hidden",
        fontFamily: "inherit",
        color: "#1a1a2e",
        caretColor: "#6366f1",
        zIndex: 50,
        whiteSpace: "pre",
      }}
      onInput={(e) => {
        const el = e.currentTarget;
        el.style.width = "auto";
        el.style.height = "auto";
        el.style.width = el.scrollWidth + "px";
        el.style.height = el.scrollHeight + "px";
      }}
    />
  );
}
