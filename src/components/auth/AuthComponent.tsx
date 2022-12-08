import { useMutation } from "@apollo/client";
import { Button, Center, Stack, Text, Image, Input } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import userOperations from "../../graphql/operations/user";
import {
  CreateUsernameMutationInput,
  CreateUsernameMutationOutput,
  IAuthComponentProps,
} from "../../interfaces/graphqlInterfaces";

const AuthComponent: React.FC<IAuthComponentProps> = ({
  session,
  reloadSession,
}) => {
  const [username, setUsername] = useState("");

  // createUsername mutation
  const [createUsername, { data, loading, error }] = useMutation<
    CreateUsernameMutationOutput,
    CreateUsernameMutationInput
  >(userOperations.Mutations.createUsername);

  console.log("heres data", data, loading, error);

  const submitUsernameHandler = async () => {
    if (!username) {
      console.log("no username");
      return;
    }
    try {
      await createUsername({ variables: { username } });
      setUsername("");
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
