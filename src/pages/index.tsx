import { Box } from "@chakra-ui/react";
import { NextPageContext } from "next";
import { getSession, useSession } from "next-auth/react";
import Head from "next/head";
import AuthComponent from "../components/auth/AuthComponent";
import ChatComponent from "../components/chat/ChatComponent";

//! Created branch temp01 because basic messaging was breaking after implementing 'mark conversations as read' functionality

export default function Home() {
  const { data: session } = useSession();

  const reloadSessionHandler = () => {
    const event = new Event("visibilitychange");
    document.dispatchEvent(event);
  };

  return (
    <>
      <Head>
        <title>Kurilnica</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box>
        {session?.user.username ? (
          <ChatComponent session={session} />
        ) : (
          <AuthComponent
            session={session}
            reloadSession={reloadSessionHandler}
          />
        )}
      </Box>
    </>
  );
}

export async function getServerSideProps(context: NextPageContext) {
  // fetch session on serverside and return it as props so that useSession will have it available at render time
  const session = await getSession(context);

  return {
    props: {
      session,
    },
  };
}
