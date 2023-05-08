import {FunctionComponent} from 'react';
import {ActionIcon, Avatar, Text, useMantineTheme} from "@mantine/core";
import {getInitials} from "../../utils/utilFunctions";
import {Minus, Plus} from "tabler-icons-react";
import {BasicUserType} from "../../models/user/User";
import {useSession} from "next-auth/react";

export const MembersComponent: FunctionComponent<{
  members: BasicUserType[];
  isCreator: boolean;
  onJoin: (join: boolean) => void;
}> = ({members, isCreator, onJoin}) => {
  const theme = useMantineTheme();
  const {data: session} = useSession();

  const limit = 5;

  return (
    <Avatar.Group>
      {members.slice(0, limit).map(user => (
        <Avatar
          key={user.id}
          variant="filled"
          radius="xl"
          size="lg"
          src={user.image}
          color={theme.fn.themeColor(theme.primaryColor)}
        >
          <Text weight="normal" size={10}>
            {getInitials(user.name)}
          </Text>
        </Avatar>
      ))}
      {members.length > limit && (
        <Avatar
          variant="light"
          radius="xl"
          size="lg"
          color={theme.fn.themeColor(theme.primaryColor)}
        >
          +{members.length - limit}
        </Avatar>
      )}
      {!isCreator &&
        (!members.find(m => m.id === session?.user.id) ? (
          <Avatar
            variant="filled"
            radius="xl"
            color={theme.fn.themeColor(theme.primaryColor)}
          >
            <ActionIcon
              variant="filled"
              color={theme.fn.themeColor(theme.primaryColor)}
              onClick={() => onJoin(true)}
            >
              <Plus/>
            </ActionIcon>
          </Avatar>
        ) : (
          <Avatar
            variant="filled"
            radius="xl"
            color={theme.fn.themeColor(theme.primaryColor)}
          >
            <ActionIcon
              variant="filled"
              color={theme.fn.themeColor(theme.primaryColor)}
              onClick={() => onJoin(false)}
            >
              <Minus/>
            </ActionIcon>
          </Avatar>
        ))}
    </Avatar.Group>
  );
};
