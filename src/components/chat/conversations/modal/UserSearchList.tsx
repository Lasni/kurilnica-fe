import { Avatar, Button, Flex, Stack, Text } from "@chakra-ui/react";
import React, { use } from "react";
import { SearchedUser } from "../../../../interfaces/graphqlInterfaces";

interface UserSearchListProps {
  users: Array<SearchedUser>;
}

export const UserSearchList = ({ users }: UserSearchListProps) => {
  return (
    <>
      {users.length > 0 ? (
        <Stack mt={6}>
          {users.map((user) => (
            <Stack
              key={user.id}
              direction="row"
              align="center"
              spacing={4}
              py={2}
              px={4}
              borderRadius={4}
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <>
                <Avatar src="" />
                <Flex justify="space-between" width="100%" align="center">
                  <Text color="whiteAlpha.800">{user.username}</Text>
                  <Button
                    bg="brand.100"
                    _hover={{ bg: "brand.100" }}
                    onClick={() => {}}
                  >
                    Invite
                  </Button>
                </Flex>
              </>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Flex mt={6} justify="center">
          <Text>No users found</Text>
        </Flex>
      )}
    </>
  );
};
