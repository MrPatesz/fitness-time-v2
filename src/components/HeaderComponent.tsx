import {Button, Group, Text, Title} from "@mantine/core";
import {signOut} from "next-auth/react";
import Link from "next/link";
import {FunctionComponent} from "react";

export const HeaderComponent: FunctionComponent<{
  username: string | undefined | null;
}> = ({username}) => {
  return (
    <Group align="center" position="apart" pl="sm">
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
