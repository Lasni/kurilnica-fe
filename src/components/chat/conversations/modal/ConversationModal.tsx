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
import { useLazyQuery, useQuery } from "@apollo/client";
import userOperations from "../../../../graphql/operations/user";
import {
  SearchUsersQueryOutput,
  SearchUsersQueryInput,
} from "../../../../interfaces/graphqlInterfaces";
import { UserSearchList } from "./UserSearchList";
import { SearchedUser } from "../../../../interfaces/graphqlInterfaces";
import { Participants } from "./Participants";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationModal = ({
  isOpen,
  onClose,
}: ConversationModalProps) => {
  const [username, setUsername] = useState("");
  const [participants, setParticipants] = useState<Array<SearchedUser>>([]);
  const [searchUsers, { data, loading, error }] = useLazyQuery<
    SearchUsersQueryOutput,
    SearchUsersQueryInput
  >(userOperations.Queries.searchUsers);

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
                <Button type="submit" disabled={!username} isLoading={loading}>
                  Search
                </Button>
              </Stack>
            </form>
            {data?.searchUsers && (
              <UserSearchList
                users={data?.searchUsers}
                addParticipantCallback={handleAddParticipant}
              />
            )}
            {participants.length > 0 && (
              <Participants
                participants={participants}
                removeParticipantCallback={handleRemoveParticipant}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
