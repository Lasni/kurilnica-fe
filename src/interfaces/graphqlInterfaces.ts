import { Session } from "next-auth";
import {
  ConversationPopulated,
  MessagePopulated,
} from "../../../backend/src/interfaces/graphqlInterfaces";

//* USER

export interface IAuthComponentProps {
  session: Session | null;
  reloadSession: () => void;
}

// createUsername mutation
export interface CreateUsernameUseMutationOutput {
  createUsername: {
    success: boolean;
    error: string;
  };
}
export interface CreateUsernameUseMutationInput {
  username: string;
}

// searchUsers query
export interface SearchUsersQueryOutput {
  searchUsers: Array<SearchedUser>;
}
export interface SearchUsersQueryInput {
  username: string;
}
export interface SearchedUser {
  id: string;
  username: string;
}

//* CONVERSATION

// createConversation mutation
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

// markConversationAsRead mutation
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

// deleteConversation
export interface DeleteConversationUseMutationOutput {
  deleteConversation: {
    success: boolean;
    error: string;
  };
}
export interface DeleteConversationUseMutationInput {
  conversationId: string;
}

// conversationUpdated subscription
export interface ConversationUpdatedSubscriptionOutput {
  conversationUpdated: {
    conversation: ConversationPopulated;
  };
}

// conversationDeleted subscription
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

//* MESSAGE

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
