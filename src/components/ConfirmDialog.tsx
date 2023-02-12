import {Button, Group, Modal} from "@mantine/core";
import {FunctionComponent} from "react";

export const ConfirmDialog: FunctionComponent<{
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
}> = ({title, open, onClose, onConfirm}) => {
  return (
    <Modal
      opened={open}
      onClose={onClose}
      title={title}
      closeOnClickOutside={false}
      withCloseButton={false}
    >
      <Group position="apart">
        <Button color="gray" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          Confirm
        </Button>
      </Group>
    </Modal>
  );
};
