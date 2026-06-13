import { MessageCircle } from "lucide-react";

export default function MessagesIndexPage() {
  return (
    <div className="grid h-full place-items-center text-center">
      <div className="text-muted-foreground">
        <MessageCircle className="mx-auto mb-3 size-10 opacity-50" />
        <p className="text-sm">Select someone to start a conversation.</p>
      </div>
    </div>
  );
}
