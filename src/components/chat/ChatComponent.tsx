import { Button, Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signOut } from "next-auth/react";
import ConversationsWrapper from "./conversations/ConversationsWrapper";
import FeedWrapper from "./feed/FeedWrapper";

interface ChatComponentProps {
  session: Session;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ session }) => {
  return (
    <Flex height={`100vh`}>
      <ConversationsWrapper session={session} />
      <FeedWrapper session={session} />
    </Flex>
  );
};

export default ChatComponent;
