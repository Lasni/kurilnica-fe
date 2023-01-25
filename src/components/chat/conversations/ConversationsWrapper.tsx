import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import {
  ParticipantPopulated,
  MessagePopulated,
} from "../../../../../backend/src/interfaces/graphqlInterfaces";
import conversationOperations from "../../../graphql/operations/conversation";
import {
  ConversationCreatedSubscriptionData,
  ConversationDeletedSubscriptionOutput,
  ConversationsQueryOutput,
  MarkConversationAsReadUseMutationInput,
  MarkConversationAsReadUseMutationOutput,
} from "../../../interfaces/graphqlInterfaces";
import { SkeletonLoader } from "../../common/SkeletonLoader";
import ConversationsList from "./ConversationsList";
import {
  ConversationUpdatedSubscriptionOutput,
  MessagesQueryOutput,
} from "../../../interfaces/graphqlInterfaces";
import messageOperations from "../../../graphql/operations/message";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FunctionComponent<
  ConversationsWrapperProps
> = ({ session }) => {
  const {
    user: { id: userId },
  } = session;

  //* useQuery
  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsQueryOutput, null>(
    conversationOperations.Queries.conversations
  );

  //* useRouter
  const router = useRouter();
  const {
    query: { conversationId },
  } = router;

  //* useMutation
  const [markConversationAsRead] = useMutation<
    MarkConversationAsReadUseMutationOutput,
    MarkConversationAsReadUseMutationInput
  >(conversationOperations.Mutations.markConversationAsRead);

  // conversationUpdated subscription
  useSubscription<ConversationUpdatedSubscriptionOutput, null>(
    conversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: conversationUpdatedSubscriptionData } = data;

        if (!conversationUpdatedSubscriptionData) return;

        const {
          conversationUpdated: { conversation: updatedConversation },
        } = conversationUpdatedSubscriptionData;

        const { id: updatedConversationId, latestMessage } =
          updatedConversation;

        if (!latestMessage) {
          console.error("No latestMessage");
          return;
        }

        // if already viewing the conversation, make it 'seen'
        if (updatedConversationId === conversationId) {
          onViewConversation(conversationId, false);
          return;
        }

        // read cache for existing messages
        const existingMessagesCache = client.readQuery<MessagesQueryOutput>({
          query: messageOperations.Queries.messages,
          variables: { conversationId: updatedConversationId },
        });

        if (!existingMessagesCache) return;

        // check if existing messages already have the latest message (they should not)
        const hasLatestMessage = existingMessagesCache?.messages.find(
          (m) => m.id === latestMessage?.id
        );

        /**
         * If nothing was found (undefined is returned) then update the query.
         *
         * Note: query update is necessary because a re-fetch won't happen
         * when you view a conversation you've already viewed, due to caching
         */
        if (typeof hasLatestMessage === "undefined") {
          client.writeQuery<MessagesQueryOutput>({
            query: messageOperations.Queries.messages,
            variables: { conversationId: updatedConversationId },
            data: {
              ...existingMessagesCache,
              messages: [latestMessage, ...existingMessagesCache?.messages],
            },
          });
        }
      },
    }
  );

  // conversationDeleted subscription
  useSubscription<ConversationDeletedSubscriptionOutput, null>(
    conversationOperations.Subscriptions.conversationDeleted,
    {
      onData: ({ client, data }) => {
        const { data: conversationDeletedSubscriptionData } = data;
        if (!conversationDeletedSubscriptionData) return;

        const existingConversationsCache =
          client.readQuery<ConversationsQueryOutput>({
            query: conversationOperations.Queries.conversations,
          });
        if (!existingConversationsCache) return;

        const { conversations } = existingConversationsCache;
        const {
          conversationDeleted: { id: deletedConversationId },
        } = conversationDeletedSubscriptionData;

        const filteredConversations = conversations.filter(
          (c) => c.id !== deletedConversationId
        );

        client.writeQuery<ConversationsQueryOutput>({
          query: conversationOperations.Queries.conversations,
          data: {
            conversations: filteredConversations,
          },
        });

        router.push("/");
      },
    }
  );

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => {
    // console.log(
    //   `conversationId: ${conversationId}\nhasSeenLatestMessage: ${hasSeenLatestMessage}`
    // );
    // 1. push the new conversationId to router query params so that another data fetch is triggered for that conversation's messages
    router.push({ query: { conversationId } });

    // 2. mark conversation as read
    // If it's already read, return early
    if (hasSeenLatestMessage) {
      // console.log("hasSeenLatestMessage");
      return;
    }

    try {
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: {
            success: true,
            error: "",
          },
        },
        update: (cache) => {
          // Get conversation participants from the cache
          const participantsFragment = cache.readFragment<{
            participants: Array<ParticipantPopulated>;
          }>({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment Participants on Conversation {
                participants {
                  user {
                    id
                    username
                  }
                  hasSeenLatestMessage
                }
              }
            `,
          });

          if (!participantsFragment) return;

          const participants = [...participantsFragment.participants];

          const userParticipantIndex = participants.findIndex(
            (p) => p.user.id === userId
          );

          if (userParticipantIndex === -1) return;

          const userParticipant = participants[userParticipantIndex];

          // Update participant to show latest message as read
          participants[userParticipantIndex] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };

          // Update cache
          cache.writeFragment({
            id: `Conversation:${conversationId}`,
            fragment: gql`
              fragment UpdatedParticipant on Conversation {
                participants
              }
            `,
            data: {
              participants,
            },
          });
        },
      });
    } catch (error) {
      console.error("onViewConversation error: ", error);
    }
  };

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: conversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: ConversationCreatedSubscriptionData;
        }
      ) => {
        if (!subscriptionData.data) return prev;

        const newConversation = subscriptionData.data.conversationCreated;
        return Object.assign({}, prev, {
          conversations: [newConversation, ...prev.conversations],
        });
      },
    });
  };

  // execute subscription on-mount
  useEffect(() => {
    subscribeToNewConversations();
  }, []);

  return (
    <Box
      display={{ base: conversationId ? "none" : "flex", md: "flex" }}
      flexDir="column"
      width={{ base: `100%`, md: `400px` }}
      gap={4}
      bg={`whiteAlpha.50`}
      py={`6`}
      px={`3`}
    >
      {conversationsLoading ? (
        <SkeletonLoader count={6} height="80px" />
      ) : (
        <ConversationsList
          session={session}
          conversations={conversationsData?.conversations || []}
          onViewConversationCallback={onViewConversation}
        />
      )}
    </Box>
  );
};

export default ConversationsWrapper;
