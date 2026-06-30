import React from "react";

type CreditsButtonProps = {
  text?: string;
  children?: React.ReactNode;
  link?: string;
  onClick?: () => void;
};


export default function CreditsButton({ text, children, link, onClick }: CreditsButtonProps) {
  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="flex items-center gap-1.25 p-1.25 rounded-lg text-[#dddddd] text-[15px] leading-none no-underline cursor-pointer"
        style={{ backgroundColor: "#1f1f1f", border: "1px solid #3d3d3d" }}
      >
        {children}
        {text}
      </button>
    );
  }
  else {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.25 p-1.25 rounded-lg text-[#dddddd] text-[15px] leading-none no-underline cursor-pointer"
        style={{ backgroundColor: "#1f1f1f", border: "1px solid #3d3d3d" }}
      >
        {children}
        {text}
      </a>
    );
  }
}