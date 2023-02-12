import {ActionIcon, Card, Group, Stack, Text, TextInput} from "@mantine/core";
import Link from "next/link";
import React, {useMemo, useState} from "react";
import {QueryComponent} from "../../components/QueryComponent";
import {User} from "../../models/User";
import {ArrowDown, ArrowUp, Search} from "tabler-icons-react";

export default function UsersPage() {
  return <>Users Page</>;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [ascending, setAscending] = useState<boolean>(true);

  const userService: any = undefined; // UserService();
  const usersQuery = userService.useGetAll();

  const filteredList = useMemo(() => {
    if (!usersQuery.data) return [];

    return usersQuery.data
      ?.filter((a: User) =>
        a.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
      ?.sort((a: User, b: User) => {
        let result = a.username.localeCompare(b.username);
        if (!ascending) {
          result *= -1;
        }
        return result;
      });
  }, [searchTerm, ascending, usersQuery.data]);

  return (
    <Stack>
      <Group align="end" position="apart">
        <TextInput
          sx={{width: "300px"}}
          label="Search by Username"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          icon={<Search/>}
        />
        <TextInput
          sx={{width: "300px"}}
          label="Order by"
          readOnly
          value="Username"
          rightSection={
            <ActionIcon onClick={() => setAscending(!ascending)}>
              {ascending ? <ArrowUp/> : <ArrowDown/>}
            </ActionIcon>
          }
        />
      </Group>
      <QueryComponent resourceName={"Users"} query={usersQuery}>
        <Stack>
          {filteredList.map((user: User) => (
            <Link
              key={user.id}
              href={"/users/[id]"}
              as={`/users/${user.id}`}
              passHref
              style={{textDecoration: "none"}}
            >
              <Card withBorder>
                <Text sx={{cursor: "pointer"}}>{user.username}</Text>
              </Card>
            </Link>
          ))}
        </Stack>
      </QueryComponent>
    </Stack>
  );
}
