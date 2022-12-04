import { Button } from "@chakra-ui/react";
import { signOut } from "next-auth/react";

interface IChatComponentProps {}

const ChatComponent: React.FC<IChatComponentProps> = (props) => {
  return (
    <div>
      chat component<Button onClick={() => signOut()}>Log out</Button>
    </div>
  );
};

export default ChatComponent;
