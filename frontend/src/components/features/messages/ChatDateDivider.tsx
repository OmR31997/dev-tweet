"use client";

export function ChatDateDivider({ label }: { label: string }) {
  return (
    <div className="flex justify-center py-1">
      <span className="chat-date-pill">{label}</span>
    </div>
  );
}
