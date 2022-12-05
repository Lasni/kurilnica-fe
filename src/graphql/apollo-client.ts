import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";

// graphql endpoint for sending http requests to our server
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql", // uri of our graphql server
  credentials: "include",
});

// apollo client instance
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(), // built-in caching
});
