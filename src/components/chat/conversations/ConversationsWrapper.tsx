import { Session } from "next-auth";

interface ConversationsWrapperProps {
  session: Session;
}

const ConversationsWrapper: React.FunctionComponent<
  ConversationsWrapperProps
> = ({ session }) => {
  return <>Conversations wrapper</>;
};

export default ConversationsWrapper;
