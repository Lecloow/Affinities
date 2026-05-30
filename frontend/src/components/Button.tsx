import React from "react";

type ButtonProps = {
  text: string;
  backgroundColor: string;
  foregroundColor?: string;
  onClick?: () => void;
  width?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  padding?: string;
};

export default function Button({
                                 text,
                                 backgroundColor,
                                 foregroundColor = "#F5F5F5",
                                 onClick,
                                 width = "",
                                 leftIcon,
                                 rightIcon,
                                 disabled,
                                 padding = "15px"
                               }: ButtonProps) {
  return (
      <button
          className="h-10 rounded-lg border-0 inline-flex text-[16px] items-center justify-center gap-2.5 cursor-pointer"
          onClick={onClick}
          style={{ backgroundColor, color: foregroundColor, width: width, padding }}
          disabled={disabled}
      >
        {leftIcon}
        {text}
        {rightIcon}
      </button>
  );
}