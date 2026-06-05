type TagProps = {
  content: string;
  revealed?: boolean;
};

export default function Tag({ content, revealed }: TagProps) {
  const bg = revealed === undefined
      ? "#ececf6"
      : revealed
          ? "#FF9A59"
          : "#F990DA";

  return (
      <span
          className="text-base p-2 rounded-lg whitespace-nowrap shrink-0"
          style={{ backgroundColor: bg }}
      >
      {content}
    </span>
  );
}