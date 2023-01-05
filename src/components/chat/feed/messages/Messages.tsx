import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import toast from "react-hot-toast";
import messageOperations from "../../../../graphql/operations/message";
import {
  MessagesQueryInput,
  MessagesQueryOutput,
} from "../../../../interfaces/graphqlInterfaces";
import { SkeletonLoader } from "../../../common/SkeletonLoader";

interface MessagesProps {
  userId: string;
  conversationId: string;
}

export const Messages = ({ userId, conversationId }: MessagesProps) => {
  //* useQuery
  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
    subscribeToMore,
  } = useQuery<MessagesQueryOutput, MessagesQueryInput>(
    messageOperations.Queries.messages,
    {
      variables: {
        conversationId,
      },
      onError: ({ message }) => {
        toast.error(message);
      },
    }
  );

  console.log("here are messages:", messagesData?.messages);

  if (messagesError) {
    return null;
  }
  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {messagesLoading && (
        <Stack spacing={3} px={4}>
          <SkeletonLoader count={4} height="60px" />
        </Stack>
      )}

      {messagesData?.messages && (
        <Flex direction="column-reverse" overflowY="scroll" height="100%">
          {messagesData.messages.map((message) => (
            // <Message />
            <div key={message.id}>{message.body}</div>
          ))}
        </Flex>
      )}
    </Flex>
  );
};
