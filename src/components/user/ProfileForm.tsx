import {Button, Group, Stack, TextInput, Title} from "@mantine/core";
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
    initialValues: {...user, introduction: user.introduction ?? ""},
    validateInputOnChange: true,
    validate: {name: (value) => value ? null : "Display name is required"},
  });

  // TODO public/private information sections: edit button to open form

  return (
    <form onSubmit={form.onSubmit((data) => useUpdate.mutate(data))}>
      <Stack>
        <Title order={2}>{user.name}</Title>
        <TextInput
          label="Display name"
          placeholder="Other users will see this name."
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Introduction"
          placeholder="Introduction"
          {...form.getInputProps("introduction")}
        />
        <LocationPicker
          location={form.getInputProps("location").value}
          required={false}
          placeholder="Where do you stay?"
          description="This is used to filter events by distance. Only you can see this information."
          initialAddress={form.getInputProps("location").value?.address}
          setLocation={form.getInputProps("location").onChange}
        />
        <Group position="apart">
          <Button onClick={form.reset} color="gray" disabled={!form.isDirty()}>
            Reset
          </Button>
          <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
            Submit
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
