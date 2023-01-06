import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import React, { useState } from "react";
import toast from "react-hot-toast";
import messageOperations from "../../../../graphql/operations/message";
import {
  SendMessageMutationInput,
  SendMessageMutationOutput,
} from "../../../../interfaces/graphqlInterfaces";
import { ObjectID } from "bson";

interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput = ({ session, conversationId }: MessageInputProps) => {
  const [messageBody, setMessageBody] = useState("");
  const {
    user: { id: userId },
  } = session;

  //* useMutation
  const [sendMessage] = useMutation<
    SendMessageMutationOutput,
    SendMessageMutationInput
  >(messageOperations.Mutations.sendMessage, {
    onError: () => {
      throw new Error("Failed to send message (onError callback)");
    },
  });

  const handleOnSendMessage = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      // 1. fire send message mutation
      const messageId = new ObjectID().toString();

      const { data: sendMessageData } = await sendMessage({
        variables: {
          id: messageId,
          conversationId: conversationId,
          senderId: userId,
          body: messageBody,
        },
      });

      if (
        !sendMessageData?.sendMessage.success ||
        sendMessageData.sendMessage.error.length > 0
      ) {
        throw new Error("Failed to send message");
      }
      console.log("message sent data: ");
    } catch (error: any) {
      console.log("onSendMessage error", error);
      toast.error(error.message);
    }
    setMessageBody("");
  };

  return (
    <Box px={4} py={6} width="100%">
      <form onSubmit={handleOnSendMessage}>
        <Input
          value={messageBody}
          onChange={(event) => setMessageBody(event.target.value)}
          placeholder="New Message"
          size="md"
          resize="none"
          _focus={{
            boxShadow: "none",
            border: "1px solid",
            borderColor: "whiteAlpha.300",
          }}
        />
      </form>
    </Box>
  );
};

export default MessageInput;
