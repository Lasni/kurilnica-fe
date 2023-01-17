import { Box, Button, Text } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import { ConversationPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import { ConversationItem } from "./ConversationItem";
import { ConversationModal } from "./modal/ConversationModal";
import { useMutation } from "@apollo/client";
import conversationOperations from "../../../graphql/operations/conversation";
import toast from "react-hot-toast";
import { signOut } from "next-auth/react";

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

  const [deleteConversation] = useMutation<{
    deleteConversation: boolean;
    conversationId: string;
  }>(conversationOperations.Mutations.deleteConversation);

  const [modalIsOpen, setModalIsOpen] = useState(false);

  const openModalHandler = () => setModalIsOpen(true);

  const closeModalHandler = () => setModalIsOpen(false);

  const onDeleteConversation = async (conversationId: string) => {
    try {
      toast.promise(
        deleteConversation({
          variables: {
            conversationId,
          },
          update: () => {
            if (typeof process.env.NEXT_PUBLIC_BASE_URL === "string") {
              router.replace(process.env.NEXT_PUBLIC_BASE_URL);
            } else {
              router.replace("");
            }
          },
        }),
        {
          loading: "Deleting conversation...",
          success: "Conversation deleted",
          error: "Error deleting conversation",
        }
      );
    } catch (error: any) {
      console.error("onDeleteConversation error: ", error);
    }
  };

  const sortedConversations = [...conversations].sort(
    (a, b) => b.updatedAt.valueOf() - a.updatedAt.valueOf()
  );

  return (
    <Box
      width={{ base: "100%", m: "400px" }}
      height="100%"
      position="relative"
      overflow="hidden"
    >
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
      {sortedConversations.map((conversation) => {
        const participant = conversation.participants.find(
          (p) => p.user.id === userId
        );

        if (participant === undefined) {
          throw new TypeError("Participant is undefined");
        }

        return (
          <ConversationItem
            key={conversation.id}
            userId={userId}
            conversation={conversation}
            hasSeenLatestMessage={participant.hasSeenLatestMessage}
            isSelected={conversation.id === router.query.conversationId}
            onClick={() =>
              onViewConversationCallback(
                conversation.id,
                participant?.hasSeenLatestMessage
              )
            }
            onDeleteConversationCallback={onDeleteConversation}
          />
        );
      })}
      <Box position="absolute" bottom={0} left={0} width="100%">
        <Button width="100%" onClick={() => signOut()}>
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default ConversationsList;
