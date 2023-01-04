import { Flex, Stack } from "@chakra-ui/react";
import React from "react";
import { useQuery } from "@apollo/client";
import {
  MessagesQueryInput,
  MessagesQueryOutput,
} from "../../../../interfaces/graphqlInterfaces";
import messageOperations from "../../../../graphql/operations/message";
import toast from "react-hot-toast";

interface MessagesProps {
  userId: string;
  conversationId: string;
}

export const Messages = ({ userId, conversationId }: MessagesProps) => {
  //* useQuery
  const { data, loading, error, subscribeToMore } = useQuery<
    MessagesQueryOutput,
    MessagesQueryInput
  >(messageOperations.Queries.messages, {
    variables: {
      conversationId,
    },
    onError: ({ message }) => {
      toast.error(message);
    },
  });

  console.log("here are messages:", data?.messages);

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack>
          {/* <SkeletonLoader /> */}
          <span>Loading messages...</span>
        </Stack>
      )}

      {data?.messages && (
        <Flex direction="column-reverse" overflowY="scroll" height="100%">
          {data.messages.map((message) => (
            // <Message />
            <div key={message.id}>message.body</div>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
