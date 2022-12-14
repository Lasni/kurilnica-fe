import { useState } from "react";
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
import { useLazyQuery, useQuery } from "@apollo/client";
import userOperations from "../../../../graphql/operations/user";
import {
  SearchUsersQueryOutput,
  SearchUsersQueryInput,
} from "../../../../interfaces/graphqlInterfaces";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationModal = ({
  isOpen,
  onClose,
}: ConversationModalProps) => {
  const [username, setUsername] = useState("");
  const [searchUsers, { data, loading, error }] = useLazyQuery<
    SearchUsersQueryOutput,
    SearchUsersQueryInput
  >(userOperations.Queries.searchUsers);

  const handleOnSubmitForm = (event: React.FormEvent) => {
    // search users query
    event.preventDefault();
    searchUsers({ variables: { username } });
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg={`#2d2d2d`} pb={4}>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form onSubmit={handleOnSubmitForm}>
              <Stack spacing={4}>
                <Input
                  placeContent="Enter a username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <Button type="submit" disabled={!username}>
                  Search
                </Button>
              </Stack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
