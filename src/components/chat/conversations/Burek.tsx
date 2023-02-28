import { useSubscription } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import React, { useState } from "react";
import userOperations from "../../../graphql/operations/user";
import { UserInvitedToConversationSubscriptionOutput } from "../../../interfaces/graphqlInterfaces";
import ToastComponent from "./toast/ToastComponent";

export interface ConversationsWrapperProps {
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

  //* useRouter
  const router = useRouter();
  const {
    query: { conversationId },
  } = router;

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
