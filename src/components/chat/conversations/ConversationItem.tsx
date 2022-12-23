import { Stack, Text } from "@chakra-ui/react";
import React from "react";
import { ConversationPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";

interface ConversationItemProps {
  conversation: ConversationPopulated;
}

export const ConversationItem = ({ conversation }: ConversationItemProps) => {
  return (
    <Stack p={4} _hover={{ bg: "whiteAlpha.200" }} borderRadius={4}>
      <Text>{conversation.id}</Text>
    </Stack>
  );
};
