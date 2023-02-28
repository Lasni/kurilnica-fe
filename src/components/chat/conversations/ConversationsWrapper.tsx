import { gql, useMutation, useQuery, useSubscription } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ConversationParticipantPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import conversationOperations from "../../../graphql/operations/conversation";
import messageOperations from "../../../graphql/operations/message";
import userOperations from "../../../graphql/operations/user";
import {
  ConversationCreatedSubscriptionData,
  ConversationDeletedSubscriptionOutput,
  ConversationsQueryOutput,
  ConversationUpdatedSubscriptionOutput,
  MarkConversationAsReadUseMutationInput,
  MarkConversationAsReadUseMutationOutput,
  MessagesQueryOutput,
  UpdateConversationUseMutationInput,
  UpdateConversationUseMutationOutput,
  UserInvitedToConversationSubscriptionOutput,
} from "../../../interfaces/graphqlInterfaces";
import { SkeletonLoader } from "../../common/SkeletonLoader";
import ConversationsList from "./ConversationsList";
import ToastComponent from "./toast/ToastComponent";

interface ConversationsWrapperProps {
  session: Session;
}
export interface PopupData {
  conversationId: string;
  userId: string;
  invitingUserUsername: string;
}

const ConversationsWrapper: React.FunctionComponent<
  ConversationsWrapperProps
> = ({ session }) => {
  const {
    user: { id: userId },
  } = session;

  const [popupData, setPopupData] = useState<PopupData | null>(null);

  const clearPopupData = () => {
    setPopupData(null);
  };

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

  const [
    updateConversation,
    {
      data: updateConversationData,
      loading: updateConversationLoading,
      error: updateConversationError,
    },
  ] = useMutation<
    UpdateConversationUseMutationOutput,
    UpdateConversationUseMutationInput
  >(conversationOperations.Mutations.updateConversation);

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
        const { data: userInvitedToConversationData } = data;
        if (!userInvitedToConversationData) return;

        if (
          userInvitedToConversationData.userInvitedToConversation.invitedUsersIds.includes(
            userId
          )
        ) {
          const {
            invitedUsersIds,
            invitingUserId,
            invitingUserUsername,
            conversationId,
          } = userInvitedToConversationData.userInvitedToConversation;

          setPopupData({ conversationId, userId, invitingUserUsername });
          console.log("setting popupData");
        }
      },
    }
  );

  const onHandleConversationInvitation = async (
    accept: boolean,
    toastId: string,
    conversationId?: string
  ) => {
    if (accept && conversationId) {
      const { data } = await updateConversation({
        variables: { conversationId, participantIds: [userId] },
      });
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
      {popupData && (
        <ToastComponent
          invitingUserUsername={popupData.invitingUserUsername}
          conversationId={popupData.conversationId}
          userId={popupData.userId}
          clearPopupDataCallback={clearPopupData}
        />
      )}
    </Box>
  );
};

export default ConversationsWrapper;
