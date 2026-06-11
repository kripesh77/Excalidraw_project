import { IconProps } from "@/hooks/useExcaliCanvas";

export const LineIcon = ({ selected = false, onSelect }: IconProps) => {
  return (
    <div
      className="flex items-center justify-center p-1"
      onClick={() => onSelect("line")}
    >
      <button
        className={`hover:bg-[#E0DFFF] ${selected && "bg-[#E0DFFF]"} rounded h-7 w-7 p-1`}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 20 20"
          className=""
          fill={`${selected ? "currentColor" : "none"}`}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="full"
        >
          <path d="M4.167 10h11.666" strokeWidth="1.5"></path>
        </svg>
      </button>
    </div>
  );
};
