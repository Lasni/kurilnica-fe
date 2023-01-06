import { useMutation } from "@apollo/client";
import { Box, Input } from "@chakra-ui/react";
import { ObjectID } from "bson";
import { Session } from "next-auth";
import React, { useState } from "react";
import toast from "react-hot-toast";
import messageOperations from "../../../../graphql/operations/message";
import {
  MessagesQueryInput,
  MessagesQueryOutput,
  SendMessageMutationInput,
  SendMessageMutationOutput,
} from "../../../../interfaces/graphqlInterfaces";

interface MessageInputProps {
  session: Session;
  conversationId: string;
}

const MessageInput = ({ session, conversationId }: MessageInputProps) => {
  const [messageBody, setMessageBody] = useState("");
  const {
    user: { id: userId, username },
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
          conversationId,
          senderId: userId,
          body: messageBody,
        },
        // (optimistic rendering) put the message in the apollo cache before the sendMessage promise resolves
        optimisticResponse: {
          sendMessage: {
            success: true,
            error: "",
          },
        },

        // update callback when using optimistic rendering
        update: (cache) => {
          const existingMessagesData = cache.readQuery<MessagesQueryOutput>({
            query: messageOperations.Queries.messages,
            variables: { conversationId },
          }) as MessagesQueryOutput;

          cache.writeQuery<MessagesQueryOutput, MessagesQueryInput>({
            query: messageOperations.Queries.messages,
            variables: { conversationId },
            data: {
              ...existingMessagesData,
              messages: [
                {
                  id: messageId,
                  conversationId,
                  senderId: userId,
                  body: messageBody,
                  sender: {
                    id: userId,
                    username: username,
                  },
                  createdAt: new Date(Date.now()),
                  updatedAt: new Date(Date.now()),
                },
                ...existingMessagesData.messages,
              ],
            },
          });
        },
      });

      if (
        !sendMessageData?.sendMessage.success ||
        sendMessageData.sendMessage.error.length > 0
      ) {
        throw new Error("Failed to send message");
      }
      console.log("message sent data: ");
      setMessageBody("");
    } catch (error: any) {
      console.log("onSendMessage error", error);
      toast.error(error.message);
    }
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
