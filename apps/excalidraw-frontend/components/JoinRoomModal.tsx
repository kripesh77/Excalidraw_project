import { useActionState } from "react";
import { useRouter } from "next/navigation";
import InputField from "./InputField";
import { joinRoom } from "@/lib/actions";
import type { JoinRoomActionState } from "@/lib/types";

export const JoinRoomModal = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const [data, action] = useActionState(
    async (state: JoinRoomActionState | undefined, formData: FormData) => {
      const slug = String(formData.get("join") ?? "").trim();
      const result = await joinRoom(state, formData);
      if (result && !result.error && slug) {
        onSuccess?.();
        router.refresh();
        router.push(`/canvas/${slug}`);
      }
      return result;
    },
    undefined,
  );
  return (
    <form action={action}>
      <div className="flex flex-col items-center justify-center gap-4">
        <InputField
          data={data}
          label="Room Id"
          name="join"
          placeholder="Enter the room Id"
        />
        <button className="sketch cursor-pointer bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5">
          Join Room
        </button>
      </div>
    </form>
  );
};
