import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";

interface ConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationModal = ({
  isOpen,
  onClose,
}: ConversationModalProps) => {
  // const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modal Title</ModalHeader>
          <ModalCloseButton />
          <ModalBody>text</ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
