import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationModalProvider from "../../context/ModalContext";
import ConversationsWrapper from "./conversations/ConversationsWrapper";
import FeedWrapper from "./feed/FeedWrapper";

interface ChatComponentProps {
  session: Session;
}

const ChatComponent: React.FC<ChatComponentProps> = ({ session }) => {
  return (
    <Flex height={`100vh`}>
      <ConversationModalProvider>
        <ConversationsWrapper session={session} />
        <FeedWrapper session={session} />
      </ConversationModalProvider>
    </Flex>
  );
};

export default ChatComponent;
