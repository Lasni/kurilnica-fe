import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Box, Icon } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { ConversationParticipantPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import conversationOperations from "../../../graphql/operations/conversation";
import messageOperations from "../../../graphql/operations/message";
import {
  ConversationCreatedSubscriptionData,
  ConversationDeletedSubscriptionOutput,
  ConversationsQueryOutput,
  ConversationUpdatedSubscriptionOutput,
  MarkConversationAsReadUseMutationInput,
  MarkConversationAsReadUseMutationOutput,
  MessagesQueryOutput,
} from "../../../interfaces/graphqlInterfaces";
import { SkeletonLoader } from "../../common/SkeletonLoader";
import ConversationsList from "./ConversationsList";
import userOperations from "../../../graphql/operations/user";
import { UserInvitedToConversationSubscriptionOutput } from "../../../interfaces/graphqlInterfaces";
import toast from "react-hot-toast";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FunctionComponent<
  ConversationsWrapperProps
> = ({ session }) => {
  const {
    user: { id: userId },
  } = session;

  // console.log("userId: ", userId);

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
          conversationUpdated: {
            conversation: updatedConversation,
            removedUserIds,
            addedUserIds,
          },
        } = conversationUpdatedSubscriptionData;

        const { id: updatedConversationId, latestMessage } =
          updatedConversation;

        /**
         * User being removed
         */
        if (removedUserIds && removedUserIds.length > 0) {
          const isBeingRemoved = removedUserIds.find((id) => id === userId);
          if (!isBeingRemoved) return;
          const conversationsData = client.readQuery<ConversationsQueryOutput>({
            query: conversationOperations.Queries.conversations,
          });
          if (!conversationsData) return;
          // console.log("conversationsData", conversationsData);
          const filteredConversations = conversationsData.conversations.filter(
            (c) => c.id !== updatedConversationId
          );
          client.writeQuery<ConversationsQueryOutput>({
            query: conversationOperations.Queries.conversations,
            data: {
              conversations: filteredConversations,
            },
          });
          // Redirect to home after cache updates
          if (conversationId === updatedConversationId) {
            router.replace("");
          }
          // Early return - no more updates required
        }

        /**
         * Users being added
         */
        if (addedUserIds && addedUserIds.length > 0) {
          const isBeingAdded = addedUserIds.find((id) => id === userId);
          if (!isBeingAdded) return;

          const conversationsData = client.readQuery<ConversationsQueryOutput>({
            query: conversationOperations.Queries.conversations,
          });

          if (conversationsData) {
            client.writeQuery<ConversationsQueryOutput>({
              query: conversationOperations.Queries.conversations,
              data: {
                conversations: [
                  updatedConversation,
                  ...conversationsData.conversations,
                ],
              },
            });
          } else {
            // console.log("else");
            client.writeQuery<ConversationsQueryOutput>({
              query: conversationOperations.Queries.conversations,
              data: {
                conversations: [updatedConversation],
              },
            });
          }
        }

        /**
         * Already viewing conversation where
         * new message is received; no need
         * to manually update cache due to
         * message subscription
         */
        if (updatedConversationId === conversationId) {
          onViewConversation(conversationId, false);
          return;
        }

        const existingMessagesCache = client.readQuery<MessagesQueryOutput>({
          query: messageOperations.Queries.messages,
          variables: { conversationId: updatedConversationId },
        });

        if (!existingMessagesCache) return;

        /**
         * Check if lastest message is already present
         * in the message query
         */
        const hasLatestMessage = existingMessagesCache?.messages.find(
          (m) => m.id === latestMessage?.id
        );

        /**
         * If nothing was found (undefined is returned) then update the query.
         *
         * Note: query update is necessary because a re-fetch won't happen
         * when you view a conversation you've already viewed, due to caching
         */
        if (typeof hasLatestMessage === "undefined" && latestMessage) {
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

  // userInvitedToConversation subscription
  useSubscription<UserInvitedToConversationSubscriptionOutput, null>(
    userOperations.Subscriptions.userInvitedToConversation,
    {
      onData: ({ client, data }) => {
        // console.log("userInvitedToConversation subscription data: ", data);
        // console.log("client: ", client);
        const { data: userInvitedToConversationData } = data;
        if (!userInvitedToConversationData) return;

        console.log(
          "userInvitedToConversationData",
          userInvitedToConversationData
        );

        if (
          userInvitedToConversationData.userInvitedToConversation
            .invitedUserId === userId
        ) {
          const {
            invitedUserId,
            invitingUserId,
            invitingUserUsername,
            conversationId,
          } = userInvitedToConversationData.userInvitedToConversation;

          console.log(
            `invitedUserId: ${invitedUserId}\ninvitingUserId: ${invitingUserId}\nconversationId: ${conversationId}`
          );
          toast.loading(
            (t) => (
              <span>
                User ${invitingUserUsername} has invited you to conversation
                <div>
                  <button
                    onClick={() => onHandleConversationInvitation(true, t.id)}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onHandleConversationInvitation(false, t.id)}
                  >
                    Decline
                  </button>
                </div>
              </span>
            ),
            {
              icon: <Icon />,
            }
          );
        }
      },
    }
  );

  const onHandleConversationInvitation = (accept: boolean, toastId: string) => {
    if (accept) {
      // return a positive response
      console.log("accept");
      // fire respondToConversationInvitationMutation
    }
    // return a negative response
    else {
      console.log("dismiss");
    }

    toast.dismiss(toastId);
  };

  const onViewConversation = async (
    conversationId: string,
    hasSeenLatestMessage: boolean
  ) => {
    // 1. push the new conversationId to router query params so that another data fetch is triggered for that conversation's messages
    router.push({ query: { conversationId } });

    // If it's already read, return early
    if (hasSeenLatestMessage) {
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
            participants: Array<ConversationParticipantPopulated>;
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
