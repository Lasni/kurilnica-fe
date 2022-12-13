import { Box } from "@chakra-ui/react";
import { Session } from "next-auth";
import ConversationsList from "./ConversationsList";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FunctionComponent<
  ConversationsWrapperProps
> = ({ session }) => {
  return (
    <Box
      width={{ base: `100%`, md: `400px` }}
      border={`1px solid red`}
      bg={`whiteAlpha.50`}
      py={`6`}
      px={`3`}
    >
      Skeleton loader
      <ConversationsList session={session} />
    </Box>
  );
};

export default ConversationsWrapper;
