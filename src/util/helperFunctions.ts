import { ParticipantPopulated } from "../../../backend/src/interfaces/graphqlInterfaces";

/**
 *
 * @param participants list of all participants
 * @param myUserId my userId
 * @returns a string of all comma-separated usernames, excluding my own
 */
export const formatUsernames = (
  participants: Array<ParticipantPopulated>,
  myUserId: string
): string => {
  const usernamesExceptMe = participants
    .filter((participant) => participant.id !== myUserId)
    .map((participant) => participant.user.username);
  return usernamesExceptMe.join(", ");
};
