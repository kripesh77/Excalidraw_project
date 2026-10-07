import { useEffect, useCallback } from "react";
import { useWs } from "@/src/context/wsContext";
import { Shape } from "@/src/types/shapes";
import { SceneStore } from "@/src/scene/SceneStore";

export function useShapeSync(
  slug: string,
  sceneRef: React.RefObject<SceneStore>,
  scheduleRender: () => void,
) {
  const { joinRoom, leaveRoom, sendData, subscribe, connectionState } = useWs();

  useEffect(() => {
    if (connectionState !== "connected") return;
    joinRoom(slug);
    return () => leaveRoom(slug);
  }, [slug, connectionState]);

  useEffect(() => {
    const unsubscribe = subscribe((msg) => {
      if (msg.slug !== slug) return;

      if (msg.type === "shape_drawn") {
        const shape = msg.shape as Shape;
        const exists = sceneRef.current
          .getShapes()
          .some((s) => s.id === shape.id);

        if (exists) {
          sceneRef.current.updateShape(shape);
        } else {
          sceneRef.current.addShape(shape);
        }

        scheduleRender();
        return;
      }

      if (msg.type === "shapes_deleted") {
        const ids = msg.shapeIds as string[];
        sceneRef.current.deleteByIds(ids);
        scheduleRender();
        return;
      }
    });

    return unsubscribe;
  }, [slug, subscribe, scheduleRender]);

  const sendShape = useCallback(
    (shape: Shape) => {
      sendData({ type: "draw_shape", slug, shape });
    },
    [slug, sendData],
  );

  const deleteSelectedShapes = useCallback(
    (ids: string[]) => {
      if (ids.length === 0) return;
      sendData({ type: "delete_shapes", slug, shapeIds: ids });
    },
    [slug, sendData],
  );

  return { sendShape, deleteSelectedShapes };
}
