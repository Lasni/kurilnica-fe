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

  //* useMutation
  const [sendMessage] = useMutation<
    { sendMessage: { success: boolean; error: string } },
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
      const {
        user: { id: senderId },
      } = session;

      const messageId = new ObjectID().toString();

      const newMessage = {
        id: messageId,
        senderId,
        conversationId,
        body: messageBody,
      };

      const { data: sendMessageData, errors } = await sendMessage({
        variables: { ...newMessage },
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
                  senderId: session.user.id,
                  body: messageBody,
                  sender: {
                    id: session.user.id,
                    username: session.user.username,
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

      if (!sendMessageData?.sendMessage || errors) {
        throw new Error("Failed to send message");
      }
      setMessageBody("");
    } catch (error: any) {
      console.error("onSendMessage error", error);
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
