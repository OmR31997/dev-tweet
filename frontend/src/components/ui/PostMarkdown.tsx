import ReactMarkdown from 'react-markdown';

type Props = { children: string; className?: string };

export default function PostMarkdown({ children, className = '' }: Props) {
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          p: ({ children: c }) => (
            <p className="mb-3 last:mb-0 font-normal leading-relaxed text-black">{c}</p>
          ),
          a: ({ href, children: c }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-black underline decoration-primary/60 underline-offset-2 transition-colors hover:bg-primary/20"
            >
              {c}
            </a>
          ),
          code: ({ className: codeClass, children: c }) => {
            const inline = !codeClass;
            if (inline) {
              return (
                <code className="rounded-md bg-black/[0.06] px-1.5 py-0.5 font-mono text-[0.9em] text-black">
                  {c}
                </code>
              );
            }
            return <code className="font-mono text-sm text-black">{c}</code>;
          },
          pre: ({ children: c }) => (
            <pre className="mb-3 max-w-full overflow-x-auto rounded-xl border border-black/10 bg-white p-4 text-sm shadow-sm">
              {c}
            </pre>
          ),
          strong: ({ children: c }) => <strong className="font-semibold text-black">{c}</strong>,
          ul: ({ children: c }) => (
            <ul className="mb-3 list-disc space-y-1 pl-5 font-normal text-black">{c}</ul>
          ),
          ol: ({ children: c }) => (
            <ol className="mb-3 list-decimal space-y-1 pl-5 font-normal text-black">{c}</ol>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
