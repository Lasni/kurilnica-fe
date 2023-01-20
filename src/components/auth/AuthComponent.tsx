import { useMutation } from "@apollo/client";
import { Button, Center, Stack, Text, Image, Input } from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useState } from "react";
import toast from "react-hot-toast";
import userOperations from "../../graphql/operations/user";
import {
  CreateUsernameUseMutationInput,
  CreateUsernameUseMutationOutput,
  IAuthComponentProps,
} from "../../interfaces/graphqlInterfaces";

const AuthComponent: React.FC<IAuthComponentProps> = ({
  session,
  reloadSession,
}) => {
  const [username, setUsername] = useState("");

  // createUsername mutation
  const [createUsername, { loading, error }] = useMutation<
    CreateUsernameUseMutationOutput,
    CreateUsernameUseMutationInput
  >(userOperations.Mutations.createUsername);

  const submitUsernameHandler = async () => {
    if (!username) {
      return;
    }
    try {
      const { data } = await createUsername({ variables: { username } });

      if (!data?.createUsername) {
        throw new Error();
      }

      if (data.createUsername.error) {
        const {
          createUsername: { error },
        } = data;
        throw new Error(error);
      }

      // reload session to get new username
      reloadSession();
      toast.success("Username successfully updated.");

      setUsername("");
    } catch (error: any) {
      toast.error(error?.message);
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
              <Button
                width={`100%`}
                onClick={submitUsernameHandler}
                isLoading={loading}
              >
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
