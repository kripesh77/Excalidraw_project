import { useCallback, useEffect, useState, RefObject } from "react";
import { TextEditSession } from "@/src/tools/textTool";
import { Shape, TextShape } from "../types/shapes";
import { SceneStore } from "../scene/SceneStore";

export function useText(
  sceneRef: RefObject<SceneStore>,
  sendShape: (shape: Shape) => void,
  scheduleRender: () => void,
) {
  const [textSession, setTextSession] = useState<TextEditSession | null>(null);

  const openTextEditor = useCallback((session: TextEditSession) => {
    setTextSession(session);
  }, []);

  const commitText = useCallback(
    (value: string) => {
      if (!textSession) return;
      const trimmed = value.trim();

      if (trimmed) {
        const shape: TextShape = {
          id: textSession.editingId ?? crypto.randomUUID(),
          type: "text",
          x: textSession.worldX,
          y: textSession.worldY,
          text: trimmed,
          fontSize: 20,
        };

        if (textSession.editingId) {
          sceneRef.current.updateShape(shape);
        } else {
          sceneRef.current.addShape(shape);
        }

        sendShape(shape);
      }

      setTextSession(null);
      scheduleRender();
    },
    [textSession, sceneRef, sendShape, scheduleRender],
  );

  const cancelText = useCallback(() => {
    setTextSession(null);
  }, []);

  return { textSession, commitText, cancelText, openTextEditor };
}
