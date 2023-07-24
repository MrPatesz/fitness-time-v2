import {ActionIcon, Avatar, Card, Group, ScrollArea, Stack, Text, Tooltip, useMantineTheme} from "@mantine/core";
import {closeAllModals, openModal} from "@mantine/modals";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import Link from "next/link";
import {useRouter} from "next/router";
import {FunctionComponent} from 'react';
import {Minus, Plus} from "tabler-icons-react";
import {BasicUserType} from "../../models/user/User";
import {useSignedNumberFormatter} from "../../utils/formatters";
import {getInitials} from "../../utils/utilFunctions";
import UserImage from "../user/UserImage";

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
              <Link key={member.id} href={`/users/${member.id}`} locale={locale} passHref>
                <Card
                  withBorder
                  p={6}
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
          key={user.id}
          label={user.name}
          position="bottom"
        >
          <Avatar
            variant="filled"
            radius="xl"
            size="lg"
            src={user.image}
            color={user.themeColor}
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
