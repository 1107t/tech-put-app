import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";

const components = {
  img({ src, alt }: { src?: string; alt?: string }) {
    return (
      <a href={src ?? "#"} target="_blank" rel="noopener noreferrer">
        {alt || "画像を表示"}
      </a>
    );
  },
  code({ className, children, ...props }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
    const match = /language-(\S+)/.exec(className || "");
    const langStr = match ? match[1] : "";
    const [lang, filename] = langStr.includes(":") ? langStr.split(":") : [langStr, ""];
    const isBlock = !(props as { ref?: unknown }).ref && String(children).includes("\n");
    if (isBlock) {
      return (
        <div>
          {filename && <div className="code-filename">{filename}</div>}
          <pre className={lang ? `language-${lang}` : undefined}>
            <code>{children}</code>
          </pre>
        </div>
      );
    }
    return <code className={className}>{children}</code>;
  },
};

export default function MarkdownView({ body }: { body: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
      components={components}
    >
      {body}
    </ReactMarkdown>
  );
}
