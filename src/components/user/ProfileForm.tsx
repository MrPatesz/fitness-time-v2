import {Button, Stack, TextInput, Title} from "@mantine/core";
import {useForm} from "@mantine/form";
import React, {FunctionComponent} from "react";
import {ProfileType, UpdateProfileType} from "../../models/User";
import {api} from "../../utils/api";
import {LocationPicker} from "../LocationPicker";

export const ProfileForm: FunctionComponent<{
  user: ProfileType;
}> = ({user}) => {
  const queryContext = api.useContext();
  const useUpdate = api.user.update.useMutation({
    onSuccess: () => queryContext.user.invalidate(),
  });

  const form = useForm<UpdateProfileType>({
    initialValues: user,
  });

  console.log(user);

  return (
    <form onSubmit={form.onSubmit((data) => useUpdate.mutate(data))}>
      <Stack>
        <Title order={2}>{user.name}</Title>
        <TextInput
          label="Introduction"
          placeholder="Introduction"
          {...form.getInputProps("introduction")}
        />
        <LocationPicker
          required={false}
          placeholder="Where do you stay?"
          initialAddress={form.getInputProps("location").value?.address}
          setLocation={form.getInputProps("location").onChange}
        />
        <Button type="submit">Update</Button>
      </Stack>
    </form>
  );
};
