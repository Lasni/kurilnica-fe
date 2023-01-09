import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import { ConversationItem } from "./ConversationItem";
import { ConversationModal } from "./modal/ConversationModal";

interface ConversationsListProps {
  session: Session;
  conversations: Array<ConversationPopulated>;
  onViewConversationCallback: (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => void;
}

const ConversationsList = ({
  session,
  conversations,
  onViewConversationCallback,
}: ConversationsListProps) => {
  const router = useRouter();
  const {
    user: { id: userId },
  } = session;

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModalHandler = () => {
    setModalIsOpen(true);
  };

  const closeModalHandler = () => {
    setModalIsOpen(false);
  };

  return (
    <Box width={`100%`}>
      <Box
        py={2}
        px={4}
        mb={4}
        bg={`blackAlpha.300`}
        borderRadius={4}
        cursor={`pointer`}
        onClick={openModalHandler}
      >
        <Text textAlign={`center`} color={`whiteAlpha.800`} fontWeight={500}>
          Find or start a conversation
        </Text>
      </Box>
      <ConversationModal
        isOpen={modalIsOpen}
        onClose={closeModalHandler}
        session={session}
      />
      {conversations.map((conversation) => {
        const participant = conversation.participants.find(
          (p) => p.user.id === userId
        );

        if (participant === undefined) {
          throw new TypeError("Participant is undefined");
        }
        return (
          <div
            key={conversation.id}
            onClick={() =>
              onViewConversationCallback(
                conversation.id,
                participant?.hasSeenLatestMessage
              )
            }
          >
            <ConversationItem
              conversation={conversation}
              isSelected={conversation.id === router.query.conversationId}
              userId={userId}
              hasSeenLatestMessage={participant.hasSeenLatestMessage}
              selectedConversationId={conversation.id}
            />
          </div>
        );
      })}
    </Box>
  );
};

export default ConversationsList;
