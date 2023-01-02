import { Flex } from "@chakra-ui/react";
import { Session } from "next-auth";
import { useRouter } from "next/router";
import MessagesHeader from "./messages/MessagesHeader";

interface FeedWrapperProps {
  session: Session;
}

const FeedWrapper: React.FunctionComponent<FeedWrapperProps> = ({
  session,
}) => {
  const router = useRouter();
  const { conversationId } = router.query;
  const {
    user: { id: userId },
  } = session;
  return (
    <Flex
      width="100%"
      direction="column"
      display={{ base: conversationId ? "flex" : "none", md: "flex" }}
    >
      {conversationId && typeof conversationId === "string" ? (
        <Flex
          direction="column"
          justify="space-between"
          overflow="hidden"
          flexGrow={1}
        >
          <MessagesHeader conversationId={conversationId} userId={userId} />
          {/* <Messages /> */}
        </Flex>
      ) : (
        <>no convo selected</>
      )}
    </Flex>
  );
};

export default FeedWrapper;
