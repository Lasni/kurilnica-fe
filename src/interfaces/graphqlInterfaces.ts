import { Session, User } from "next-auth";

export interface IAuthComponentProps {
  session: Session | null;
  reloadSession: () => void;
}

export interface CreateUsernameMutationOutput {
  createUsername: {
    success: boolean;
    error: string;
  };
}

export interface CreateUsernameMutationInput {
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
