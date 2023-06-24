import React, { ReactNode } from "react";

function Button({
  children,
  filled,
  onClick,
}: {
  children: ReactNode;
  filled?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`${
        filled
          ? "bg-[#ff0000] border-0 text-white"
          : "border-[#ff0000] text-[#ff0000] border-2"
      } w-full h-8 rounded-lg justify-center items-center text-center pt-[0.2rem]`}
    >
      {children}
    </div>
  );
}

export default Button;
