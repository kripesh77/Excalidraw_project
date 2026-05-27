import { CrossButton } from "./CrossButton";
import { createPortal } from "react-dom";

export const Modal = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) => {
  return createPortal(
    <div
      className="fixed h-svh w-svw flex items-center justify-center backdrop-blur-xs"
      onClick={() => {
        onClick();
      }}
    >
      <div
        className="sketch relative w-full max-w-md bg-white p-8 md:p-10 m-5 sm:m-0"
        onClick={(e) => e.stopPropagation()}
      >
        <CrossButton onClick={onClick} />
        {children}
      </div>
    </div>,
    document.body,
  );
};
