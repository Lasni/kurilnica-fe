import { gql } from "@apollo/client";
import { messageFields } from "./message";

const conversationFields = `
  id
  participants {
    user {
      id
      username
    }
    hasSeenLatestMessage
  }
  updatedAt
  latestMessage {
    ${messageFields}
}
`;

const conversationOperations = {
  Queries: {
    conversations: gql`
      query Conversations {
        conversations {
          ${conversationFields}
        }
      }
    `,
  },
  Mutations: {
    createConversation: gql`
      mutation CreateConversation($participantIds: [String]!) {
        createConversation(participantIds: $participantIds) {
          success
          error
          conversationId
        }
      }
    `,
    markConversationAsRead: gql`
      mutation MarkConversationAsRead(
        $userId: String!
        $conversationId: String!
      ) {
        markConversationAsRead(
          userId: $userId
          conversationId: $conversationId
        ) {
          success
          error
        }
      }
    `,
    deleteConversation: gql`
      mutation DeleteConversation($conversationId: String!) {
        deleteConversation(conversationId: $conversationId) {
          success
          error
        }
      }
    `,
    leaveConversation: gql`
      mutation LeaveConversation(
        $conversationId: String!
        $conversationParticipantsIds: [String]!
      ) {
        leaveConversation(
          conversationId: $conversationId
          conversationParticipantsIds: $conversationParticipantsIds
        ) {
          success
          error
        }
      }
    `,
    updateConversation: gql`
      mutation UpdateConversation(
        $conversationId: String!
        $participantIds: [String]!
      ) {
        updateConversation(
          conversationId: $conversationId
          participantIds: $participantIds
        ) {
          success
          error
          conversationId
        }
      }
    `,
  },
  Subscriptions: {
    conversationCreated: gql`
      subscription ConversationCreated {
        conversationCreated {
          ${conversationFields}
        }
      }
    `,

    conversationUpdated: gql`
      subscription ConversationUpdated {
        conversationUpdated {
          conversation {
            ${conversationFields}
          }
          removedUserIds
          addedUserIds
        }
      }
    `,

    conversationDeleted: gql`
      subscription ConversationDeleted {
        conversationDeleted {
          id
        }
      }
    `,
  },
};

export default conversationOperations;
