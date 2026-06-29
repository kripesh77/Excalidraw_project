export const CrossButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <button
      onClick={onClick}
      type="button"
      className="absolute cursor-pointer top-0 right-0 flex h-8 w-8 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full border bg-purple-600 text-white text-sm sketch"
    >
      &#10008;
    </button>
  );
};
