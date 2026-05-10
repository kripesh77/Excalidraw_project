import { IconProps } from "./ExcaliCanvas";

export const RectIcon = ({ selected = false, onSelect }: IconProps) => {
  return (
    <div
      className="flex items-center justify-center p-1"
      onClick={() => onSelect("rect")}
    >
      <button
        className={`hover:bg-[#E0DFFF] ${selected && "bg-[#E0DFFF]"} rounded h-7 w-7 p-1`}
      >
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          viewBox="0 0 24 24"
          className=""
          fill={`${selected ? "currentColor" : "none"}`}
          strokeWidth="2"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          height="full"
        >
          <g strokeWidth="1.5">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <rect x="4" y="4" width="16" height="16" rx="2"></rect>
          </g>
        </svg>
      </button>
    </div>
  );
};
