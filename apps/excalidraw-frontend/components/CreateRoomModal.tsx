import { useActionState } from "react";
import { useRouter } from "next/navigation";
import InputField from "./InputField";
import { createRoom } from "@/lib/actions";
import type { CreateRoomActionState } from "@/lib/types";

export const CreateRoomModal = ({ onSuccess }: { onSuccess?: () => void }) => {
  const router = useRouter();
  const [data, action, isPending] = useActionState(
    async (state: CreateRoomActionState | undefined, formData: FormData) => {
      const result = await createRoom(state, formData);
      if (result && !result.error) {
        onSuccess?.();
        router.refresh();
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
          label="Room name"
          name="create"
          placeholder="Enter the room name"
        />
        <button
          className="sketch disabled:cursor-not-allowed cursor-pointer bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-transform hover:-translate-y-0.5"
          disabled={isPending}
        >
          {isPending ? "Creating..." : "Create Room"}
        </button>
      </div>
    </form>
  );
};
