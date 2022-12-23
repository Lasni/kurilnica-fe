import { ApolloClient, HttpLink, InMemoryCache, split } from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";

import { createClient } from "graphql-ws";
import { getSession } from "next-auth/react";

// graphql endpoint for sending http requests to our server
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql", // uri of our graphql server
  credentials: "include",
});

/**
 * make sure that we're in the browser, not the nextjs server
 */
const wsLink =
  typeof window !== "undefined"
    ? new GraphQLWsLink(
        createClient({
          url: "ws://localhost:4000/graphql/subscriptions",
          connectionParams: async () => ({
            session: await getSession(),
          }),
        })
      )
    : null;

const splitLink =
  typeof window !== "undefined" && wsLink !== null
    ? split(
        ({ query }) => {
          const definition = getMainDefinition(query);

          return (
            definition.kind === "OperationDefinition" &&
            definition.operation === "subscription"
          );
        },
        wsLink,
        httpLink
      )
    : httpLink;

// apollo client instance
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache(), // built-in caching
});
