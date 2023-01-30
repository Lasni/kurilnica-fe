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
import {
  DeleteConversationUseMutationInput,
  DeleteConversationUseMutationOutput,
  LeaveConversationUseMutationInput,
  LeaveConversationUseMutationOutput,
} from "../../../interfaces/graphqlInterfaces";

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

  const [deleteConversation] = useMutation<
    DeleteConversationUseMutationOutput,
    DeleteConversationUseMutationInput
  >(conversationOperations.Mutations.deleteConversation);

  const [leaveConversation] = useMutation<
    LeaveConversationUseMutationOutput,
    LeaveConversationUseMutationInput
  >(conversationOperations.Mutations.leaveConversation);

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

  async function onLeaveConversation(conversation: ConversationPopulated) {
    const participantsIdsToUpdate = conversation.participants
      .filter((p) => p.user.id !== userId)
      .map((p) => p.user.id);

    try {
      const { data: leaveConversationData, errors: leaveConversationErrors } =
        await leaveConversation({
          variables: {
            conversationId: conversation.id,
            conversationParticipantsIds: participantsIdsToUpdate,
          },
        });
      console.log("variables: conversationId: ", conversation.id);

      if (!leaveConversationData || leaveConversationErrors) {
        throw new Error("Failed to leave the conversation");
      }
      // router.push("/");
    } catch (error: any) {
      console.error("onLeaveConversation error: ", error);
      toast.error(error?.message);
    }
  }

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
            onLeaveConversationCallback={onLeaveConversation}
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
