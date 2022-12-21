import { useState } from "react";
import {
  Button,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
} from "@chakra-ui/react";
import { useLazyQuery, useQuery, useMutation } from "@apollo/client";
import userOperations from "../../../../graphql/operations/user";
import {
  SearchUsersQueryOutput,
  SearchUsersQueryInput,
} from "../../../../interfaces/graphqlInterfaces";
import { UserSearchList } from "./UserSearchList";
import {
  SearchedUser,
  CreateConversationMutationOutput,
  CreateConversationMutationInput,
} from "../../../../interfaces/graphqlInterfaces";
import { Participants } from "./Participants";
import toast from "react-hot-toast";
import conversationOperations from "../../../../graphql/operations/conversation";
import { Session } from "next-auth";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

export const ConversationModal = ({
  isOpen,
  onClose,
  session,
}: ConversationModalProps) => {
  const {
    user: { id: userId },
  } = session;
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
    CreateConversationMutationOutput,
    CreateConversationMutationInput
  >(conversationOperations.Mutations.createConversation);

  const handleOnSearchUsers = (event: React.FormEvent) => {
    // search users query
    event.preventDefault();
    searchUsers({ variables: { username } });
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
      console.log("conversation data: ", data);
    } catch (error: any) {
      console.log("on create conversation error: ", error);
      toast.error(`on create conversation error: ${error}`);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={`#2d2d2d`} pb={4}>
          <ModalHeader>Create a conversation</ModalHeader>
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
                  onClick={handleCreateConversation}
                >
                  Create a conversation
                </Button>
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
