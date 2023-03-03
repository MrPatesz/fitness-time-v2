import {Button, Group, Stack, TextInput, Title} from "@mantine/core";
import {useForm} from "@mantine/form";
import {showNotification} from "@mantine/notifications";
import {FunctionComponent} from "react";
import {ProfileType, UpdateProfileType} from "../../models/User";
import {api} from "../../utils/api";
import {refreshSession} from "../../utils/utilFunctions";
import {LocationPicker} from "../location/LocationPicker";
import {ThemeColorPicker} from "./ThemeColorPicker";

export const ProfileForm: FunctionComponent<{
  user: ProfileType;
}> = ({user}) => {
  const queryContext = api.useContext();
  const useUpdate = api.user.update.useMutation({
    onSuccess: () => queryContext.user.invalidate().then(() => {
      refreshSession();
      showNotification({
        color: "green",
        title: "Updated profile!",
        message: "Your profile has been modified.",
      });
    })
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
          withAsterisk
          data-autofocus
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
          initialAddress={form.getInputProps("location").value?.address ?? ""}
          setLocation={form.getInputProps("location").onChange}
        />
        <ThemeColorPicker
          value={form.getInputProps("themeColor").value}
          onChange={form.getInputProps("themeColor").onChange}
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
