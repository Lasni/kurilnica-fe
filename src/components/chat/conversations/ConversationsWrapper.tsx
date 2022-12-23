import { useQuery } from "@apollo/client";
import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import conversationOperations from "../../../graphql/operations/conversation";
import ConversationsList from "./ConversationsList";
import { ConversationsQueryOutput } from "../../../interfaces/graphqlInterfaces";

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
  } = useQuery<ConversationsQueryOutput, null>(
    conversationOperations.Queries.conversations
  );

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
