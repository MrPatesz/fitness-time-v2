import {FunctionComponent} from "react";
import {signOut} from "next-auth/react";
import {Button, Group, Text, Title} from "@mantine/core";
import Link from "next/link";

export const HeaderComponent: FunctionComponent<{
  username: string | undefined | null;
}> = ({username}) => {
  return (
    <Group align="center" position="apart">
      <Link href="/" as="/" passHref>
        <Title order={2}>Fitness Time</Title>
      </Link>

      <Group>
        <Link href="/profile" as="/profile" passHref>
          <Text size="lg" weight="bold">
            {username}
          </Text>
        </Link>
        <Button
          variant="light"
          onClick={() => signOut({callbackUrl: "/welcome"})}
        >
          Logout
        </Button>
      </Group>
    </Group>
  );
};
