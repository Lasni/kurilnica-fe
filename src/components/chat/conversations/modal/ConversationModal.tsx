import { useLazyQuery, useMutation } from "@apollo/client";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useState } from "react";
import toast from "react-hot-toast";
import { ConversationPopulated } from "../../../../../../backend/src/interfaces/graphqlInterfaces";
import conversationOperations from "../../../../graphql/operations/conversation";
import userOperations from "../../../../graphql/operations/user";
import {
  CreateConversationUseMutationInput,
  CreateConversationUseMutationOutput,
  SearchedUser,
  SearchUsersQueryInput,
  SearchUsersQueryOutput,
  UpdateConversationUseMutationInput,
  UpdateConversationUseMutationOutput,
} from "../../../../interfaces/graphqlInterfaces";
import { Participants } from "./Participants";
import { UserSearchList } from "./UserSearchList";
import { isArrayOfStrings } from "../../../../util/typeGuards";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
  conversations: Array<ConversationPopulated>;
  editingConversation: ConversationPopulated | null;
}

export const ConversationModal = ({
  isOpen,
  onClose,
  session,
  conversations,
  editingConversation,
}: ConversationModalProps) => {
  const {
    user: { id: userId },
  } = session;

  const router = useRouter();
  // const { query } = router;

  const [username, setUsername] = useState("");
  const [participants, setParticipants] = useState<Array<SearchedUser>>([]);
  //* search users
  const [
    searchUsers,
    {
      data: searchUsersData,
      loading: searchUsersLoading,
      error: searchUsersError,
    },
  ] = useLazyQuery<SearchUsersQueryOutput, SearchUsersQueryInput>(
    userOperations.Queries.searchUsers
  );
  //* create conversation
  const [
    createConversation,
    {
      data: createConversationData,
      loading: createConversationLoading,
      error: createConversationError,
    },
  ] = useMutation<
    CreateConversationUseMutationOutput,
    CreateConversationUseMutationInput
  >(conversationOperations.Mutations.createConversation);

  const [
    updateConversation,
    {
      data: updateConversationData,
      loading: updateConversationLoading,
      error: updateConversationError,
    },
  ] = useMutation<
    UpdateConversationUseMutationOutput,
    UpdateConversationUseMutationInput
  >(conversationOperations.Mutations.updateConversation);

  const handleOnSearchUsers = (event: React.FormEvent) => {
    event.preventDefault();

    // Conversation can be edited even from root url (no conversationId param)
    const conversationId = editingConversation?.id || null;

    const currentConversation = conversations.find(
      (c) => c.id === conversationId
    );

    let usernamesInCurrentConvo = currentConversation
      ? currentConversation.participants
          .filter((p) => typeof p.user.username === "string")
          .map((p) => p.user.username)
      : null;

    /**
     * If wanting to create a new conversation while inside of an existing conversation
     * (user search should not be limited)
     **/
    if (!editingConversation) {
      usernamesInCurrentConvo = null;
    }

    searchUsers({
      variables: {
        username,
        usernamesInCurrentConvo: isArrayOfStrings(usernamesInCurrentConvo)
          ? usernamesInCurrentConvo
          : [],
      },
    });
  };

  const handleAddParticipant = (participantToAdd: SearchedUser) => {
    const alreadyExists = participants.find(
      (participant) => participant.id === participantToAdd.id
    );
    if (alreadyExists) {
      return;
    }
    setParticipants((prevParticipants) => [
      ...prevParticipants,
      participantToAdd,
    ]);
    setUsername("");
  };

  const handleRemoveParticipant = (participantId: string) => {
    const filteredParticipants = participants.filter(
      (participant) => participant.id !== participantId
    );
    setParticipants(filteredParticipants);
  };

  const onSubmit = () => {
    /**
     * Determine whether to update or create a conversation
     */
    editingConversation
      ? handleUpdateConversation(editingConversation)
      : handleCreateConversation();
  };

  const handleUpdateConversation = async (
    editingConversation: ConversationPopulated
  ) => {
    // console.log("handleUpdateConversation: ", editingConversation);
    const conversationId = editingConversation.id;
    const participantIds = [
      ...participants.map((participant) => participant.id),
    ];
    // console.log("participants", participants);

    try {
      const { data } = await updateConversation({
        variables: { conversationId, participantIds },
      });

      console.log("handleUpdateConversation data: ", data);
    } catch (error: any) {
      toast.error("Failed to update the conversation");
    }

    // onClose();
  };

  const handleCreateConversation = async () => {
    const participantIds = [
      userId,
      ...participants.map((participant) => participant.id),
    ];
    // add self to conversation
    try {
      const { data } = await createConversation({
        variables: { participantIds },
      });
      if (!data?.createConversation) {
        throw new Error("Failed to create conversation");
      }
      /**
       * get conversationId and add it to url
       */
      const {
        createConversation: { conversationId },
      } = data;
      router.push({ query: { conversationId } });
      /**
       * clear state and close modal on successful creation
       */
      setParticipants([]);
      setUsername("");
      onClose();
    } catch (error: any) {
      toast.error(`On create conversation error`);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={`#2d2d2d`} pb={4}>
          <ModalHeader>
            {editingConversation
              ? `Edit conversation ${editingConversation.id}`
              : "Create a conversation"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleOnSearchUsers}>
              <Stack spacing={4}>
                <Input
                  placeContent="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Button
                  type="submit"
                  disabled={!username}
                  isLoading={searchUsersLoading}
                >
                  Search
                </Button>
              </Stack>
            </form>
            {searchUsersData?.searchUsers && (
              <UserSearchList
                users={searchUsersData?.searchUsers}
                addParticipantCallback={handleAddParticipant}
              />
            )}
            {participants.length > 0 && (
              <>
                <Participants
                  participants={participants}
                  removeParticipantCallback={handleRemoveParticipant}
                />
                <Button
                  bg="brand.100"
                  width="100%"
                  mt={6}
                  _hover={{ bg: "brand.100" }}
                  // disabled
                  isLoading={createConversationLoading}
                  onClick={onSubmit}
                >
                  {editingConversation
                    ? "Update conversation"
                    : "Create a conversation"}
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
