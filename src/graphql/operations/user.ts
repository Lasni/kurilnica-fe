import { gql } from "@apollo/client";

const userOperations = {
  Queries: {
    searchUsers: gql`
      query SearchUsers(
        $username: String!
        $usernamesInCurrentConvo: [String]
      ) {
        searchUsers(
          username: $username
          usernamesInCurrentConvo: $usernamesInCurrentConvo
        ) {
          id
          username
        }
      }
    `,
  },
  Mutations: {
    createUsername: gql`
      mutation CreateUsername($username: String!) {
        # name below must match the mutation name in user typeDefs (BE)
        createUsername(username: $username) {
          success
          error
        }
      }
    `,
  },
  Subscriptions: {},
};

export default userOperations;
