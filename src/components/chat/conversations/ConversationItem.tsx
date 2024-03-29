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
import { BiLogOut } from "react-icons/bi";
import { ConversationPopulated } from "../../../../../backend/src/interfaces/graphqlInterfaces";
import { formatUsernames } from "../../../util/helperFunctions";

interface ConversationItemProps {
  conversation: ConversationPopulated;
  isSelected: boolean;
  hasSeenLatestMessage: boolean;
  userId: string;
  onClick: () => void;
  onDeleteConversationCallback: (conversationId: string) => void;
  onLeaveConversationCallback: (conversation: ConversationPopulated) => void;
  onEditConversationCallback: (conversation: ConversationPopulated) => void;
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
  onClick,
  onDeleteConversationCallback,
  onLeaveConversationCallback,
  onEditConversationCallback,
}: ConversationItemProps) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleRightClick = (event: React.MouseEvent) => {
    if (event.type === "click") {
      onClick();
      // console.log("onClick");
    } else if (event.type === "contextmenu") {
      // console.log("rightClick");
      event.preventDefault();
      setMenuOpen(true);
    }
  };

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
      onClick={handleRightClick}
      onContextMenu={handleRightClick}
      position="relative"
    >
      <Menu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <MenuList>
          <MenuItem
            icon={<AiOutlineEdit fontSize={20} />}
            _hover={{ bg: "whiteAlpha.300" }}
            onClick={(event) => {
              event.stopPropagation();
              onEditConversationCallback(conversation);
            }}
          >
            Edit
          </MenuItem>
          {conversation.participants.length > 1 ? (
            <MenuItem
              icon={<BiLogOut fontSize={20} />}
              _hover={{ bg: "whiteAlpha.300" }}
              onClick={(event) => {
                event.stopPropagation();
                onLeaveConversationCallback(conversation);
              }}
            >
              Leave
            </MenuItem>
          ) : (
            <MenuItem
              icon={<MdDeleteOutline fontSize={20} />}
              // bg="#2d2d2d"
              _hover={{ bg: "whiteAlpha.300" }}
              onClick={(event) => {
                event.stopPropagation();
                onDeleteConversationCallback(conversation.id);
              }}
            >
              Delete
            </MenuItem>
          )}
        </MenuList>
      </Menu>

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
            <Box width="100%">
              <Text
                color="whiteAlpha.700"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                // maxWidth="150px"
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
