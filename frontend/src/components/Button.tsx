import React from "react";

type ButtonProps = {
  text: string;
  backgroundColor: string;
  onClick?: () => void;
  width?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export default function Button({
                                 text,
                                 backgroundColor,
                                 onClick,
                                 width = "",
                                 leftIcon,
                                 rightIcon,
                               }: ButtonProps) {
  return (
      <button
          className="h-[40px] rounded-[8px] border-0 inline-flex text-[16px] items-center justify-center gap-[10px] cursor-pointer"
          onClick={onClick}
          style={{ backgroundColor, color: "#F5F5F5", width: width }}
      >
        {leftIcon}
        {text}
        {rightIcon}
      </button>
  );
}