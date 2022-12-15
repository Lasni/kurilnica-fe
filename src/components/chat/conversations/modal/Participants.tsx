import { Flex, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { SearchedUser } from "../../../../interfaces/graphqlInterfaces";
import { IoIosCloseCircleOutline } from "react-icons/io";

interface ParticipantsProps {
  participants: Array<SearchedUser>;
  removeParticipantCallback: (participantId: string) => void;
}

export const Participants = ({
  participants,
  removeParticipantCallback,
}: ParticipantsProps) => {
  return (
    <Flex mt={8} gap="10px" flexWrap="wrap">
      {participants.map((participant) => (
        <Stack
          key={participant.id}
          direction="row"
          align="center"
          bg="whiteAlpha.400"
          borderRadius={4}
          p={2}
        >
          <Text>{participant.username}</Text>
          <IoIosCloseCircleOutline
            size={20}
            cursor="pointer"
            onClick={() => removeParticipantCallback(participant.id)}
          />
        </Stack>
      ))}
    </Flex>
  );
};
