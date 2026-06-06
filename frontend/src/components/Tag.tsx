import type {ReactNode} from "react";

type TagProps = {
  content?: string;
  revealed?: boolean;
  children?: ReactNode;
};

export default function Tag({ content, revealed, children }: TagProps) {
  const bg = revealed === undefined
      ? "#ececf6"
      : revealed
          ? "#FF9A59"
          : "#F990DA";

  return (
      <span
          className="text-base p-2 rounded-lg whitespace-nowrap shrink-0"
          style={{ backgroundColor: bg, fontWeight: 500 }}
      >
      {children ?? content}
    </span>
  );
}