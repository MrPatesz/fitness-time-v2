import { Button, TextInput, Stack, Title } from "@mantine/core";
import React, { useEffect, useState } from "react";
import { QueryComponent } from "../components/QueryComponent";

export default function ProfilePage() {
  return <>Profile Page</>;

  // const userService = UserService();
  const userService: any = undefined;
  const userDetailsQuery = userService.useGetProfile();
  const useUpdate = userService.useUpdate();

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

  // TODO change password, profile picture, location

  return (
    <QueryComponent resourceName={"Profile"} query={userDetailsQuery}>
      <Stack>
        <Title order={2}>{userDetailsQuery.data?.username}</Title>
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
