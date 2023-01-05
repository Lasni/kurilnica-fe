import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import { useEffect } from "react";
import toast from "react-hot-toast";
import messageOperations from "../../../../graphql/operations/message";
import {
  MessageSentSubscriptionData,
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

  const subscribeToNewMessages = (conversationId: string) => {
    subscribeToMore({
      document: messageOperations.Subscriptions.messageSent,
      variables: { conversationId },
      updateQuery: (
        prev,
        { subscriptionData }: { subscriptionData: MessageSentSubscriptionData }
      ) => {
        if (!subscriptionData) {
          return prev;
        }

        const newMessage = subscriptionData.data.messageSent;

        return Object.assign({}, prev, {
          messages: [newMessage, ...prev.messages],
        });
      },
    });
  };
  // execute subscription on-mount and when changing conversations
  useEffect(() => {
    subscribeToNewMessages(conversationId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

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
