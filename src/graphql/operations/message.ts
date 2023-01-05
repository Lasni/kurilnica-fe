import { gql } from "@apollo/client";

export const messageFields = `
  id
  sender {
    id
    username
  }
  body
  createdAt
`;

const messageOperations = {
  Queries: {
    messages: gql`
      query Messages($conversationId: String!) {
        messages(conversationId: $conversationId) {
          ${messageFields} 
        }
      }
    `,
  },
  Mutations: {
    sendMessage: gql`
      mutation SendMessage(
        $id: String!
        $conversationId: String!
        $senderId: String!
        $body: String!
      ) {
        sendMessage(
          id: $id
          conversationId: $conversationId
          senderId: $senderId
          body: $body
        ) {
          success
          error
        }
      }
    `,
  },
  Subscriptions: {
    messageSent: gql`
      subscription MessageSent($conversationdId: String!) {
        messageSent(conversationId: $conversationId) {
          ${messageFields}
        }
      }
    `,
  },
};

export default messageOperations;
