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
  searchUsers: Array<SearchedUser>;
}

//* CONVERSATIONS

// create conversation
export interface CreateConversationUseMutationOutput {
  createConversation: {
    success: boolean;
    error: string;
    conversationId: string;
  };
}
export interface CreateConversationUseMutationInput {
  participantIds: Array<string>;
}

// mark conversation as read
export interface MarkConversationAsReadUseMutationOutput {
  markConversationAsRead: {
    success: boolean;
    error: string;
  };
}
export interface MarkConversationAsReadUseMutationInput {
  userId: string;
  conversationId: string;
}

// delete conversation
export interface DeleteConversationUseMutationOutput {
  deleteConversation: {
    success: boolean;
    error: string;
  };
}
export interface DeleteConversationUseMutationInput {
  conversationId: string;
}

// conversation updated subscription
export interface ConversationUpdatedSubscriptionOutput {
  conversationUpdated: {
    conversation: ConversationPopulated;
  };
}

// conversation deleted subscription
export interface ConversationDeletedSubscriptionOutput {
  conversationDeleted: {
    id: string;
  };
}

// conversations query
export interface ConversationsQueryOutput {
  conversations: Array<ConversationPopulated>;
}

// conversations subscribeToMore subscription
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
