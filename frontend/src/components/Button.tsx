import React from "react";

type ButtonProps = {
  text?: string;
  children?: React.ReactNode;
  backgroundColor: string;
  foregroundColor?: string;
  onClick?: () => void;
  width?: string;
  disabled?: boolean;
  padding?: string;
};

export default function Button({
                                text,
                                children,
                                backgroundColor,
                                foregroundColor = "#F5F5F5",
                                onClick,
                                width = "",
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
      {children}
      {text}
    </button>
  );
}