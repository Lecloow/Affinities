import ReactMarkdown from 'react-markdown';

type MarkdownProps = {
  content?: string;
};

export default function Markdown({ content }: MarkdownProps) {
  return (
      <ReactMarkdown components={{ strong: (props) => <strong style={{fontWeight: "600"}} {...props} /> }}>
        {content}
      </ReactMarkdown>
  );
}