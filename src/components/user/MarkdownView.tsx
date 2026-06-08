import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { isValidElement, useState, type ReactNode, type ReactElement } from "react";

// ReactNode を素のテキストに変換（テーブルセルが数字かどうかの判定に使う）
function nodeToText(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (isValidElement(node)) {
    return nodeToText((node.props as { children?: ReactNode }).children);
  }
  return "";
}

// セルの中身が数値（金額・パーセント・カンマ区切り含む）かどうか
function isNumericCell(text: string): boolean {
  const trimmed = text.trim();
  if (trimmed === "") return false;
  return /^[¥$＄]?[-+]?[\d,]+(\.\d+)?%?$/.test(trimmed);
}

// Prism の言語名エイリアス（html は Prism 上では markup 扱いのため変換する等）
const PRISM_LANG_ALIASES: Record<string, string> = {
  html: "markup",
  xml: "markup",
  svg: "markup",
  vue: "markup",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  rb: "ruby",
  py: "python",
};

// コードブロック右上のコピーボタン（クリックでクリップボードにコピー）
function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // クリップボード非対応・拒否時は何もしない
    }
  };

  return (
    <button
      type="button"
      className="code-copy-btn"
      onClick={handleCopy}
      aria-label="コードをコピー"
      title={copied ? "コピーしました" : "コピー"}
    >
      {copied ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
    </button>
  );
}

const components = {
  img({ src, alt }: { src?: string; alt?: string }) {
    return (
      <a href={src ?? "#"} target="_blank" rel="noopener noreferrer">
        {alt || "画像を表示"}
      </a>
    );
  },
  // フェンスドコードブロックは react-markdown が <pre><code> 構造で渡してくる。
  // ここで VSCode 風のシンタックスハイライト＋ファイル名タブ＋コピーボタンを描画する。
  pre({ children }: { children?: ReactNode }) {
    if (!isValidElement(children)) {
      return <pre>{children}</pre>;
    }
    const codeElement = children as ReactElement<{ className?: string; children?: ReactNode }>;
    const className = codeElement.props.className ?? "";
    const codeContent = String(codeElement.props.children ?? "").replace(/\n$/, "");
    const match = /language-(\S+)/.exec(className);
    const langStr = match ? match[1] : "";
    const [lang, filename] = langStr.includes(":") ? langStr.split(":") : [langStr, ""];
    const prismLang = PRISM_LANG_ALIASES[lang] ?? lang;
    return (
      <div className="code-block">
        {filename && <div className="code-filename">{filename}</div>}
        <CopyButton code={codeContent} />
        <SyntaxHighlighter
          language={prismLang || undefined}
          style={vscDarkPlus}
          wrapLongLines
          customStyle={{
            margin: 0,
            padding: "12px 16px",
            borderRadius: 0,
            background: "transparent",
            fontSize: "0.95em",
          }}
          codeTagProps={{ style: { fontFamily: "monospace" } }}
        >
          {codeContent}
        </SyntaxHighlighter>
      </div>
    );
  },
  // インラインコードのみ担当（ブロックは pre 側で処理済み）。
  code({ className, children }: React.HTMLAttributes<HTMLElement> & { children?: ReactNode }) {
    return <code className={className}>{children}</code>;
  },
  // 見出し(th)は常に左寄せ（markdown の列揃え指定よりこちらを優先）。
  th({ children }: { children?: ReactNode }) {
    return <th style={{ textAlign: "left" }}>{children}</th>;
  },
  // 数値セルだけ右寄せ（文字セルは既定の左寄せのまま）。
  td({ children, style }: { children?: ReactNode; style?: React.CSSProperties }) {
    const alignRight = isNumericCell(nodeToText(children));
    return <td style={alignRight ? { ...style, textAlign: "right" } : style}>{children}</td>;
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
