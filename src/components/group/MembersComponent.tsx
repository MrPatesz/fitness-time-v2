import {FunctionComponent} from 'react';
import {ActionIcon, Avatar, Card, Group, ScrollArea, Stack, Text, Tooltip, useMantineTheme} from "@mantine/core";
import {getInitials} from "../../utils/utilFunctions";
import {Minus, Plus} from "tabler-icons-react";
import {useSession} from "next-auth/react";
import {closeAllModals, openModal} from "@mantine/modals";
import {BasicUserType} from "../../models/user/User";
import {useTranslation} from "next-i18next";
import {useSignedNumberFormatter} from "../../utils/formatters";
import UserImage from "../user/UserImage";
import {useRouter} from "next/router";
import Link from "next/link";

export const MembersComponent: FunctionComponent<{
  members: BasicUserType[];
  isCreator: boolean;
  onJoin: (join: boolean) => void;
}> = ({members, isCreator, onJoin}) => {
  const theme = useMantineTheme();
  const {locale = "en"} = useRouter();
  const {data: session} = useSession();
  const signedNumberFormatter = useSignedNumberFormatter();
  const {t} = useTranslation("common");

  const limit = 5;
  const userColor = theme.fn.themeColor(theme.primaryColor);
  const isMember = Boolean(members.find(m => m.id === session?.user.id));

  return (
    <Avatar.Group
      sx={{cursor: "pointer"}}
      onClick={() => {
        const content = (
          <Stack spacing="xs">
            {members.map(member => (
              <Link href={`/users/${member.id}`} locale={locale} passHref>
                <Card
                  withBorder
                  p={6}
                  key={member.id}
                  onClick={() => closeAllModals()}
                >
                  <Group>
                    <UserImage user={member} size={40}/>
                    <Text>{member.name}</Text>
                  </Group>
                </Card>
              </Link>
            ))}
          </Stack>
        );
        openModal({
          title: t("modal.members.title"),
          children: members.length >= limit ? (
            <ScrollArea offsetScrollbars h={300}>
              {content}
            </ScrollArea>
          ) : (content),
        });
      }}
    >
      {members.slice(0, limit).map(user => (
        <Tooltip
          label={user.name}
          position="bottom"
        >
          <Avatar
            key={user.id}
            variant="filled"
            radius="xl"
            size="lg"
            src={user.image}
          >
            <Text weight="normal" size={25}>
              {getInitials(user.name)}
            </Text>
          </Avatar>
        </Tooltip>
      ))}
      {members.length > limit && (
        <Avatar
          variant="filled"
          radius="xl"
          size="lg"
        >
          {signedNumberFormatter.format(members.length - limit)}
        </Avatar>
      )}
      {!isCreator && (
        <Avatar
          variant="filled"
          radius="xl"
          color={userColor}
        >
          <ActionIcon
            radius="xl"
            variant="filled"
            color={userColor}
            onClick={(event) => {
              event.stopPropagation();
              onJoin(!isMember);
            }}
          >
            {isMember ? <Minus/> : <Plus/>}
          </ActionIcon>
        </Avatar>
      )}
    </Avatar.Group>
  );
};
