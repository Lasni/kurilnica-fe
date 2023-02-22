import { Session } from "next-auth";
import { Participants } from "../components/chat/conversations/modal/Participants";
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

export interface InviteUsersUseMutationOutput {
  inviteUsersToConversation: {
    success: boolean;
    error: string;
    usersId: Array<string>;
  };
}
export interface InviteUsersUseMutationInput {
  usersIds: Array<string>;
  conversationId: string;
  // editingConversation: EditingConversation;
  // editingConversation: ConversationPopulated;
}

// export interface EditingConversation {
//   id: string;
//   latestMessage: LatestMessage | null;
//   // participants: Array<Participant>;
//   updatedAt: Date;
// }

// export interface Participant {
//   user: User;
//   hasSeenLatestMessage: boolean;
// }

// export interface User {
//   id: string;
//   username: string | null;
// }
// export interface LatestMessage {
//   body?: string;
//   createdAt?: Date;
//   id?: string;
//   // sender?: Sender;
// }
// export interface Sender {
//   id: string;
//   username: string | null;
// }

// searchUsers query
export interface SearchUsersQueryOutput {
  searchUsers: Array<SearchedUser>;
}
export interface SearchUsersQueryInput {
  username: string;
  usernamesInCurrentConvo: Array<string> | null;
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

// updateConversation mutation
export interface UpdateConversationUseMutationInput {
  conversationId: string;
  participantIds: Array<string>;
}
export interface UpdateConversationUseMutationOutput {
  updateConversation: {
    success: boolean;
    error: string;
    conversationId: string;
  };
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

// deleteConversation mutation
export interface DeleteConversationUseMutationOutput {
  deleteConversation: {
    success: boolean;
    error: string;
  };
}
export interface DeleteConversationUseMutationInput {
  conversationId: string;
}

// leaveConversation mutation
export interface LeaveConversationUseMutationOutput {
  leaveConversation: {
    success: boolean;
    error: string;
  };
}
export interface LeaveConversationUseMutationInput {
  conversationId: string;
  conversationParticipantsIds: Array<string>;
}

// conversationUpdated subscription
export interface ConversationUpdatedSubscriptionOutput {
  conversationUpdated: {
    conversation: ConversationPopulated;
    removedUserIds: Array<string>;
    addedUserIds: Array<string>;
  };
}

// conversationDeleted subscription
export interface ConversationDeletedSubscriptionOutput {
  conversationDeleted: {
    id: string;
  };
}

export interface UserInvitedToConversationSubscriptionOutput {
  userInvitedToConversation: {
    invitedUserId: string;
    invitingUserId: string;
    invitingUserUsername: string;
    conversationId: string;
    // success: boolean;
    // error: string;
    // userId: string;
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
