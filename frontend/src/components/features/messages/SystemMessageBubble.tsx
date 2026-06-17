"use client";

export function SystemMessageBubble({ content }: { content: string }) {
  return (
    <div className="flex justify-center px-4 py-1">
      <p className="max-w-[90%] rounded-lg bg-muted/60 px-3 py-1.5 text-center text-xs leading-relaxed text-muted-foreground">
        {content}
      </p>
    </div>
  );
}
