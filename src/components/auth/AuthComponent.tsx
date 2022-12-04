import { Button, Center, Stack, Text, Image, Input } from "@chakra-ui/react";
import { Session } from "next-auth";
import { signIn } from "next-auth/react";
import { useState } from "react";

interface IAuthComponentProps {
  session: Session | null;
  reloadSession: () => void;
}

const AuthComponent: React.FC<IAuthComponentProps> = ({
  session,
  reloadSession,
}) => {
  const [username, setUsername] = useState("");

  const submitUsernameHandler = async () => {
    try {
      // createUsername mutation to send our username to the graphQL api
    } catch (error) {
      console.log("submitUsernameHandler error: ", error);
    }
  };
  return (
    <>
      <Center height="100vh">
        <Stack align={`center`} spacing={`6`}>
          {session ? (
            <>
              <Text fontSize={`3xl`}>Create a username</Text>
              <Input
                placeholder={`Enter a username`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <Button width={`100%`} onClick={submitUsernameHandler}>
                Save
              </Button>
            </>
          ) : (
            <>
              <Text fontSize={`3xl`}>KurilnicaQL</Text>
              <Button
                onClick={() => signIn()}
                leftIcon={
                  <Image
                    height={`20px`}
                    src={`/images/googlelogo.png`}
                    alt={`google_logo`}
                  />
                }
              >
                Continue with Google
              </Button>
            </>
          )}
        </Stack>
      </Center>
    </>
  );
};

export default AuthComponent;
