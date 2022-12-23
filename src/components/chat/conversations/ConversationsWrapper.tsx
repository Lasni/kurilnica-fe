import { useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import conversationOperations from "../../../graphql/operations/conversation";
import ConversationsList from "./ConversationsList";
import { ConversationsQueryOutput } from "../../../interfaces/graphqlInterfaces";
import { ConversationPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import { useEffect } from "react";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FunctionComponent<
  ConversationsWrapperProps
> = ({ session }) => {
  const {
    data: conversationsData,
    error: conversationsError,
    loading: conversationsLoading,
    subscribeToMore,
  } = useQuery<ConversationsQueryOutput, null>(
    conversationOperations.Queries.conversations
  );

  console.log("query data", conversationsData);

  const subscribeToNewConversations = () => {
    subscribeToMore({
      document: conversationOperations.Subscriptions.conversationCreated,
      updateQuery: (
        prev,
        {
          subscriptionData,
        }: {
          subscriptionData: {
            data: { conversationCreated: ConversationPopulated };
          };
        }
      ) => {
        if (!subscriptionData.data) return prev;
        console.log("subscription data", subscriptionData);

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
      width={{ base: `100%`, md: `400px` }}
      border={`1px solid red`}
      bg={`whiteAlpha.50`}
      py={`6`}
      px={`3`}
    >
      Skeleton loader
      <ConversationsList
        session={session}
        conversations={conversationsData?.conversations || []}
      />
    </Box>
  );
};

export default ConversationsWrapper;
