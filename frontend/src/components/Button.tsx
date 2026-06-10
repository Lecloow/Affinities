import React from "react";

type ButtonProps = {
  text?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
  disabled?: boolean;
};

const defaultStyles: React.CSSProperties = {
  backgroundColor: "#FF6CA7",
  color: "#F5F5F5",
  padding: "15px",
  width: "19.25rem",
};

export default function Button({ text, children, style = {}, onClick, disabled }: ButtonProps) {
  const mergedStyles: React.CSSProperties = {
    ...defaultStyles,
    ...style,
  };
  return (
    <button
        className="h-10 rounded-lg border-0 inline-flex text-[16px] items-center justify-center gap-2.5 cursor-pointer"
        onClick={onClick}
        style={ mergedStyles }
        disabled={disabled}
    >
      {children}
      {text}
    </button>
  );
}