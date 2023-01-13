import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ParticipantPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import conversationOperations from "../../../graphql/operations/conversation";
import {
  ConversationCreatedSubscriptionData,
  ConversationsQueryOutput,
  MarkConversationAsReadMutationInput,
} from "../../../interfaces/graphqlInterfaces";
import { SkeletonLoader } from "../../common/SkeletonLoader";
import ConversationsList from "./ConversationsList";
import { ConversationUpdatedSubscriptionOutput } from "../../../interfaces/graphqlInterfaces";

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
    { markConversationAsRead: boolean },
    MarkConversationAsReadMutationInput
  >(conversationOperations.Mutations.markConversationAsRead);

  useSubscription<ConversationUpdatedSubscriptionOutput, null>(
    conversationOperations.Subscriptions.conversationUpdated,
    {
      onData: ({ client, data }) => {
        const { data: conversationUpdatedSubscriptionData } = data;

        console.log("ON DATA FIRING: ", conversationUpdatedSubscriptionData);

        if (!conversationUpdatedSubscriptionData) return;
      },
    }
  );

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => {
    console.log("onViewConversation fired...");
    // 1. push the new conversationId to router query params so that another data fetch is triggered for that conversation's messages
    router.push({ query: { conversationId } });

    // 2. mark conversation as read
    // If it's already read, return early
    console.log("conversationId: ", conversationId);
    if (hasSeenLatestMessage) return;

    try {
      console.log("entering try/catch...");
      await markConversationAsRead({
        variables: {
          userId,
          conversationId,
        },
        optimisticResponse: {
          markConversationAsRead: true,
          // {
          //   success: true,
          //   error: "",
          // },
        },
        update: (cache) => {
          console.log("updating cache...");
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
          console.log("userParticipantIndex: ", userParticipantIndex);

          if (userParticipantIndex === -1) return;

          const userParticipant = participants[userParticipantIndex];

          // Update participant to show latest message as read
          participants[userParticipantIndex] = {
            ...userParticipant,
            hasSeenLatestMessage: true,
          };
          console.log("userParticipant: ", userParticipant);

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
      console.log("onViewConversation error: ", error);
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
