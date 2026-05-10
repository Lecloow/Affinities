import React from "react";

type ButtonProps = {
  text: string;
  backgroundColor: string;
  onClick?: () => void;
  minWidthClass?: string;
  leftIcon?: React.ReactNode;
};

export default function Button({ text, backgroundColor, onClick, minWidthClass = "", leftIcon}: ButtonProps) {
  console.log(leftIcon);
  return (
      <button
          className="p-[12px] rounded-[8px] border-0 inline-flex text-[16px] items-center justify-center cursor-pointer"
          onClick={onClick}
          style={{ backgroundColor: backgroundColor, color: "#F5F5F5", minWidth: minWidthClass }}
      >
        {text}
      </button>
  );
}