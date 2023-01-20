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

export interface CreateUsernameUseMutationOutput {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface CreateUsernameUseMutationInput {
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

export interface CreateConversationUseMutationOutput {
  createConversation: {
    conversationId: string;
  };
}

export interface CreateConversationUseMutationInput {
  participantIds: Array<string>;
}

export interface MarkConversationAsReadUseMutationInput {
  userId: string;
  conversationId: string;
}

export interface MarkConversationAsReadUseMutationOutput {
  markConversationAsRead: {
    success: boolean;
    error: string;
  };
}

export interface ConversationUpdatedSubscriptionOutput {
  conversationUpdated: {
    conversation: ConversationPopulated;
  };
}

export interface ConversationDeletedSubscriptionOutput {
  conversationDeleted: {
    id: string;
  };
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

// messages query
export interface MessagesQueryOutput {
  messages: Array<MessagePopulated>;
}
export interface MessagesQueryInput {
  conversationId: string;
}

// sendMessage mutation
export interface SendMessageUseMutationInput {
  id: string;
  conversationId: string;
  senderId: string;
  body: string;
}
export interface SendMessageUseMutationOutput {
  sendMessage: {
    success: boolean;
    error: string;
  };
}

// messageSent subscription
export interface MessageSentSubscriptionData {
  data: {
    messageSent: MessagePopulated;
  };
}
