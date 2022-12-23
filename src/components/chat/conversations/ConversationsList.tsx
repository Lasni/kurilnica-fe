import { Box, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import { ConversationItem } from "./ConversationItem";
import { ConversationModal } from "./modal/ConversationModal";

interface ConversationsListProps {
  session: Session;
  conversations: Array<ConversationPopulated>;
}

const ConversationsList = ({
  session,
  conversations,
}: ConversationsListProps) => {
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
      {conversations.map((conversation) => (
        <ConversationItem conversation={conversation} key={conversation.id} />
      ))}
    </Box>
  );
};

export default ConversationsList;
