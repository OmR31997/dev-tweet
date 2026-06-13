import { Conversation } from "@/components/features/messages";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return <Conversation otherUserId={userId} />;
}
