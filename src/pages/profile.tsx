import {Button, Stack, TextInput, Title} from "@mantine/core";
import React, {useEffect, useState} from "react";
import {QueryComponent} from "../components/QueryComponent";
import {api} from "../utils/api";

export default function ProfilePage() {
  const userDetailsQuery = api.user.profile.useQuery();
  const useUpdate = api.user.update.useMutation();

  const [introduction, setIntroduction] = useState<string>("");

  useEffect(() => {
    if (userDetailsQuery.data?.introduction) {
      setIntroduction(userDetailsQuery.data.introduction);
    }
  }, [userDetailsQuery.data]);

  const updateCall = () => {
    if (userDetailsQuery.data) {
      useUpdate.mutate({
        ...userDetailsQuery.data,
        introduction: introduction,
      });
    }
  };

  // TODO change profile picture, location

  return (
    <QueryComponent resourceName={"Profile"} query={userDetailsQuery}>
      <Stack>
        <Title order={2}>{userDetailsQuery.data?.name}</Title>
        <TextInput
          label="Introduction"
          placeholder="Introduction"
          value={introduction}
          onChange={(event) => setIntroduction(event.currentTarget.value)}
        />
        <Button onClick={updateCall}>Update</Button>
      </Stack>
    </QueryComponent>
  );
}
