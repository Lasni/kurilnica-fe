import { Button, Stack, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { formatUsernames } from "../../../../util/helperFunctions";
import { useQuery } from "@apollo/client";
import { ConversationsQueryOutput } from "../../../../interfaces/graphqlInterfaces";
import conversationOperations from "../../../../graphql/operations/conversation";

interface MessagesHeaderProps {
  userId: string;
  conversationId: string;
}

const MessagesHeader = ({ userId, conversationId }: MessagesHeaderProps) => {
  const router = useRouter();

  //* useQuery
  const {
    data: conversationsData,
    error: conversationsErro,
    loading: conversationsLoading,
  } = useQuery<ConversationsQueryOutput, null>(
    conversationOperations.Queries.conversations
  );

  const conversation = conversationsData?.conversations.find(
    (c) => c.id === conversationId
  );

  return (
    <Stack
      direction="row"
      align="center"
      spacing={6}
      py={5}
      px={{ base: 4, md: 0 }}
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
    >
      <Button
        display={{ md: "none" }}
        onClick={() =>
          router.replace("?conversationId", "/", {
            shallow: true,
          })
        }
      >
        Back
      </Button>
      {/* {conversationsLoading && <SkeletonLoader count={1} height="30px" width="320px" />} */}
      {!conversation && !conversationsLoading && (
        <Text>Conversation Not Found</Text>
      )}
      {conversation && (
        <Stack direction="row">
          <Text color="whiteAlpha.600">To: </Text>
          <Text fontWeight={600}>
            {formatUsernames(conversation.participants, userId)}
          </Text>
        </Stack>
      )}
    </Stack>
  );
};

export default MessagesHeader;
