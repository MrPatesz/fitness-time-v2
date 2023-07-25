import {ActionIcon, Group, Modal, TextInput} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {FunctionComponent, useState} from "react";
import {PencilPlus, X} from "tabler-icons-react";
import RichTextEditor from "./RichTextEditor";
import {UseFormReturnType} from "@mantine/form";

export const RichTextField: FunctionComponent<{
  label?: string;
  placeholder?: string;
  formInputProps: ReturnType<UseFormReturnType<any>["getInputProps"]>;
}> = ({label, placeholder, formInputProps}) => {
  const {t} = useTranslation("common");

  const [opened, setOpened] = useState(false);

  return (
    <>
      <TextInput
        label={label}
        placeholder={placeholder}
        sx={{flexGrow: 1}}
        {...formInputProps}
        disabled={(formInputProps.value as string | undefined)?.includes("</")}
        rightSectionWidth={74}
        rightSection={(
          <Group spacing={4}>
            <ActionIcon
              disabled={!formInputProps.value}
              variant="transparent"
              onClick={() => formInputProps.onChange("")}
            >
              <X/>
            </ActionIcon>
            <ActionIcon
              variant="transparent"
              onClick={() => setOpened(true)}
            >
              <PencilPlus/>
            </ActionIcon>
          </Group>
        )}
      />
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={label ? t("modal.edit", {propertyName: label}) : t("modal.comment.edit")}
        size="xl"
        centered={true}
        closeOnClickOutside={false}
        zIndex={401}
      >
        <RichTextEditor
          id="rte"
          placeholder={placeholder}
          value={formInputProps.value}
          onChange={formInputProps.onChange}
        />
      </Modal>
    </>
  );
};
