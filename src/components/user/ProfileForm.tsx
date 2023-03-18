import {Button, Group, Stack, TextInput, Title} from "@mantine/core";
import {useForm} from "@mantine/form";
import {showNotification} from "@mantine/notifications";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";
import {ProfileType, UpdateProfileType} from "../../models/User";
import {api} from "../../utils/api";
import {refreshSession} from "../../utils/utilFunctions";
import {LocationPicker} from "../location/LocationPicker";
import {RichTextField} from "../RichTextField";
import {ThemeColorPicker} from "./ThemeColorPicker";

export const ProfileForm: FunctionComponent<{
  user: ProfileType;
}> = ({user}) => {
  const {t} = useTranslation("common");

  const queryContext = api.useContext();
  const useUpdate = api.user.update.useMutation({
    onSuccess: () => queryContext.user.invalidate().then(() => {
      refreshSession();
      showNotification({
        color: "green",
        title: t("notification.profile.update.title"),
        message: t("notification.profile.update.message"),
      });
    })
  });

  const form = useForm<UpdateProfileType>({
    initialValues: user,
    validateInputOnChange: true,
    validate: {name: (value) => value ? null : t("profileForm.displayName.error")},
  });

  // TODO public/private information sections: edit button to open form

  return (
    <form onSubmit={form.onSubmit((data) => useUpdate.mutate(data))}>
      <Stack>
        <Title order={2}>{user.name}</Title>
        <TextInput
          withAsterisk
          data-autofocus
          label={t("profileForm.displayName.label")}
          placeholder={t("profileForm.displayName.placeholder") as string}
          {...form.getInputProps("name")}
        />
        <RichTextField
          label={t("profileForm.introduction") as string}
          placeholder={t("profileForm.introduction") as string}
          formInputProps={form.getInputProps("introduction")}
        />
        <LocationPicker
          location={form.getInputProps("location").value}
          required={false}
          placeholder={t("profileForm.location.placeholder") as string}
          description={t("profileForm.location.description") as string}
          initialAddress={form.getInputProps("location").value?.address ?? ""}
          setLocation={form.getInputProps("location").onChange}
        />
        <ThemeColorPicker
          value={form.getInputProps("themeColor").value}
          onChange={form.getInputProps("themeColor").onChange}
        />
        <Group position="apart">
          <Button onClick={form.reset} color="gray" disabled={!form.isDirty()}>
            {t("button.reset")}
          </Button>
          <Button type="submit" disabled={!form.isValid() || !form.isDirty()}>
            {t("button.submit")}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
