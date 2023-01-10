import {
  Avatar,
  Box,
  Flex,
  Menu,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from "@chakra-ui/react";
import { formatRelative } from "date-fns";
import { enUS } from "date-fns/locale";
import { useState } from "react";
import { AiOutlineEdit } from "react-icons/ai";
import { GoPrimitiveDot } from "react-icons/go";
import { MdDeleteOutline } from "react-icons/md";
import { ConversationPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import { formatUsernames } from "../../../util/helperFunctions";

interface ConversationItemProps {
  conversation: ConversationPopulated;
  isSelected: boolean;
  hasSeenLatestMessage: boolean;
  selectedConversationId: string;
  userId: string;
}
const formatRelativeLocale = {
  lastWeek: "eeee",
  yesterday: "'Yesterday",
  today: "p",
  other: "MM/dd/yy",
};

export const ConversationItem = ({
  conversation,
  isSelected,
  hasSeenLatestMessage,
  userId,
  selectedConversationId,
}: ConversationItemProps) => {
  // console.log("ConversationItem: ", conversation);
  // console.log("isSelected: ", isSelected);
  // console.log("conversation id: ", conversation.id);
  // console.log("conversation participants: ", conversation.participants);

  // console.log("conversationId", conversation.participants[0].conversationId);
  // console.log("createdAt", conversation.participants[0].createdAt);
  // console.log(
  //   "hasSeenLatestMessage",
  //   conversation.participants[0].hasSeenLatestMessage
  // );
  // console.log("id", conversation.participants[0].id);
  // console.log("updatedAt", conversation.participants[0].updatedAt);
  // console.log("user", conversation.participants[0].user);
  // console.log("userId", conversation.participants[0].userId);
  console.log("______________________________________");

  let showMenu = false;
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Stack
      direction="row"
      align="center"
      justify="space-between"
      p={4}
      cursor="pointer"
      borderRadius={4}
      bg={isSelected ? "whiteAlpha.200" : "none"}
      _hover={{ bg: "whiteAlpha.200" }}
      // onClick={handleClick}
      // onContextMenu={handleClick}
      position="relative"
    >
      {showMenu && (
        <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
          <MenuList bg="#2d2d2d">
            <MenuItem
              icon={<AiOutlineEdit fontSize={20} />}
              onClick={(event) => {
                event.stopPropagation();
                // onEditConversation();
              }}
            >
              Edit
            </MenuItem>
            {conversation.participants.length > 2 ? (
              <MenuItem
                // icon={<BiLogOut fontSize={20} />}
                onClick={(event) => {
                  event.stopPropagation();
                  // onLeaveConversation(conversation);
                }}
              >
                Leave
              </MenuItem>
            ) : (
              <MenuItem
                icon={<MdDeleteOutline fontSize={20} />}
                onClick={(event) => {
                  event.stopPropagation();
                  // onDeleteConversation(conversation.id);
                }}
              >
                Delete
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      )}
      <Flex position="absolute" left="-6px">
        {hasSeenLatestMessage === false && (
          <GoPrimitiveDot fontSize={18} color="#6B46C1" />
        )}
      </Flex>
      <Avatar />
      <Flex justify="space-between" width="80%" height="100%">
        <Flex direction="column" width="70%" height="100%">
          <Text
            fontWeight={600}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            {formatUsernames(conversation.participants, userId)}
          </Text>
          {conversation.latestMessage && (
            <Box width="140%">
              <Text
                color="whiteAlpha.700"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                {conversation.latestMessage.body}
              </Text>
            </Box>
          )}
        </Flex>
        <Text
          color="whiteAlpha.700"
          textAlign="right"
          position="absolute"
          right={0.5}
        >
          {formatRelative(new Date(conversation.updatedAt), new Date(), {
            locale: {
              ...enUS,
              formatRelative: (token) =>
                formatRelativeLocale[
                  token as keyof typeof formatRelativeLocale
                ],
            },
          })}
        </Text>
      </Flex>
    </Stack>
  );
};
