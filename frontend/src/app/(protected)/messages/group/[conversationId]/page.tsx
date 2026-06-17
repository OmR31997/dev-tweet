import { GroupConversation } from "@/components/features/messages";

export default async function GroupConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <GroupConversation conversationId={conversationId} />;
}
