import { Children, isValidElement, type ReactNode } from "react";

function isReadToggle(child: ReactNode): boolean {
  if (!isValidElement<{ className?: string }>(child)) return false;
  const className = child.props.className;
  return typeof className === "string" && className.includes("chat-bubble-read-toggle");
}

/**
 * WhatsApp-style bubble text: timestamp sits bottom-right on the last line.
 * Uses an inline spacer + absolute meta (same technique as WhatsApp Web).
 */
export function BubbleTextWithMeta({
  children,
  meta,
}: {
  children: ReactNode;
  meta: ReactNode;
}) {
  const nodes = Children.toArray(children);
  const body = nodes.filter((node) => !isReadToggle(node));
  const footer = nodes.filter((node) => isReadToggle(node));

  return (
    <div className="chat-bubble-text-block">
      <div className="chat-bubble-text-content">
        <span className="chat-bubble-text-inner">{body}</span>
        <span className="chat-bubble-meta-inline">{meta}</span>
      </div>
      {footer}
    </div>
  );
}
