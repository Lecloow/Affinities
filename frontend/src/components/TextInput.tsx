import React from "react";

type TextInputProps = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
};

export default function TextInput({
                                    value,
                                    onChange,
                                    placeholder = "",
                                    className = "",
                                  }: TextInputProps) {
  return (
      <div className={`relative w-full ${className}`}>
        <input
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`
          w-full px-4 py-3 min-w-[120px]
          text-base text-gray-900
          placeholder-[#b3b3b3]
          bg-white border border-[#d9d9d9] rounded-[8px]
          focus:outline-none focus:ring-1 focus:ring-[#d9d9d9]
          transition duration-150 ease-in-out
        `}
        />
      </div>
  );
}