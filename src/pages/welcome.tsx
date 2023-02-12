import React from "react";
import {signIn, useSession} from "next-auth/react";
import {useRouter} from "next/router";
import {Button, Card, Group, Stack,} from "@mantine/core";

export default function WelcomePage() {
  const router = useRouter();
  const {data: session} = useSession();

  const goToLoginPage = () => signIn(undefined, {callbackUrl: "/"});

  if (session) {
    router.replace("/");
  }

  return (
    <Stack align="center" justify="center" sx={{height: "100vh"}}>
      <Card withBorder>
        <h1 style={{marginTop: 0}}>Welcome to Fitness Time!</h1>
        <Group position="center">
          <Button onClick={goToLoginPage}>Login</Button>
        </Group>
      </Card>
    </Stack>
  );
}
