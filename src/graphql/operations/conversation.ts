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
          conversationId
        }
      }
    `,
    markConversationAsRead: gql`
      mutation MarkConversationAsRead(
        $userId: String!
        $conversationId: String!
      ) {
        markConversationAsRead(userId: $userId, conversationId: $conversationId)
        # {
        #   success
        #   error
        # }
      }
    `,
    deleteConversation: gql`
      mutation DeleteConversation($conversationId: String!) {
        deleteConversation(conversationId: $conversationId)
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
