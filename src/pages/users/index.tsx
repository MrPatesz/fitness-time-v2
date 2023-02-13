import {ActionIcon, Card, Group, Stack, Text, TextInput} from "@mantine/core";
import Link from "next/link";
import React, {useMemo, useState} from "react";
import {QueryComponent} from "../../components/QueryComponent";
import {UserType} from "../../models/User";
import {ArrowDown, ArrowUp, Search} from "tabler-icons-react";
import {api} from "../../utils/api";

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [ascending, setAscending] = useState<boolean>(true);

  const usersQuery = api.user.getAll.useQuery();

  const filteredList = useMemo(() => {
    if (!usersQuery.data) return [];

    return usersQuery.data
      ?.filter((a: UserType) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      ?.sort((a: UserType, b: UserType) => {
        let result = a.name.localeCompare(b.name);
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
          {filteredList.map((user: UserType) => (
            <Link
              href={"/users/[id]"}
              as={`/users/${user.id}`}
              passHref
              key={user.id}
            >
              <Card withBorder>
                <Text sx={{cursor: "pointer"}}>{user.name}</Text>
              </Card>
            </Link>
          ))}
        </Stack>
      </QueryComponent>
    </Stack>
  );
}
