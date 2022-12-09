import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    username: string;
    image: string;
  }

  interface Session {
    user: User;
  }
}
