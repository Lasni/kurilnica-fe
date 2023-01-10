import { Session } from "next-auth";
import {
  ConversationPopulated,
  MessagePopulated,
} from "../../../backend/src/interfaces/graphqlInterfaces";

//* USERS

export interface IAuthComponentProps {
  session: Session | null;
  reloadSession: () => void;
}

export interface CreateUsernameMutationOutput {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface CreateUsernameMutationInput {
  username: string;
}

export interface SearchUsersQueryInput {
  username: string;
}

export interface SearchedUser {
  id: string;
  username: string;
}

export interface SearchUsersQueryOutput {
  // searchedUsers: Array<Pick<User, "id" | "username">>;
  searchUsers: Array<SearchedUser>;
}

//* CONVERSATIONS

export interface CreateConversationMutationOutput {
  createConversation: {
    conversationId: string;
  };
}

export interface CreateConversationMutationInput {
  participantIds: Array<string>;
}

export interface ConversationsQueryOutput {
  conversations: Array<ConversationPopulated>;
}

export interface ConversationCreatedSubscriptionData {
  data: {
    conversationCreated: ConversationPopulated;
  };
}

//* MESSAGES
export interface MessagesQueryOutput {
  messages: Array<MessagePopulated>;
}

export interface MessagesQueryInput {
  conversationId: string;
}

export interface SendMessageMutationInput {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}

export interface SendMessageMutationOutput {
  sendMessage: boolean;
  // sendMessage: {
  //   success: boolean;
  //   error: string;
  // };
}

export interface MessageSentSubscriptionData {
  data: {
    messageSent: MessagePopulated;
  };
}
