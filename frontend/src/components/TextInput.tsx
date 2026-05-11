import React from "react";

type TextInputProps = {
  value: string;
  width?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
};

export default function TextInput({
                                    value,
                                    width = "",
                                    onChange,
                                    placeholder = "",
                                  }: TextInputProps) {
  return (
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            style={{ width: width }}
            className={`
          box-border p-[8px]
          text-base text-gray-900
          placeholder-[#b3b3b3]
          bg-white border border-[#d9d9d9] rounded-[8px]
          focus:outline-none focus:ring-1 focus:ring-[#d9d9d9]
          transition duration-150 ease-in-out
        `}
        />
  );
}