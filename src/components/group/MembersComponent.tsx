import {ActionIcon, Avatar, Card, Group, Stack, Text, Tooltip, useMantineTheme} from '@mantine/core';
import {closeAllModals, openModal} from '@mantine/modals';
import {useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import Link from 'next/link';
import {FunctionComponent} from 'react';
import {Minus, Plus} from 'tabler-icons-react';
import {BasicUserType} from '../../models/User';
import {useSignedNumberFormatter} from '../../utils/formatters';
import {getInitials} from '../../utils/utilFunctions';
import UserImage from '../user/UserImage';
import {useMediaQuery} from '@mantine/hooks';
import {useMyRouter} from '../../hooks/useMyRouter';

export const MembersComponent: FunctionComponent<{
  members: BasicUserType[];
  isCreator: boolean;
  onJoin: (join: boolean) => void;
}> = ({members, isCreator, onJoin}) => {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {locale} = useMyRouter();
  const {data: session} = useSession();
  const signedNumberFormatter = useSignedNumberFormatter();
  const {t} = useTranslation('common');

  const limit = 5;
  const userColor = theme.fn.themeColor(theme.primaryColor);
  const isMember = Boolean(members.find(m => m.id === session?.user.id));

  return (
    <Avatar.Group
      sx={{cursor: 'pointer'}}
      onClick={() => openModal({
        title: t('modal.members.title'),
        children: (
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
        ),
        fullScreen: !xs && members.length >= limit * 1.5,
      })}
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
            title={t(isMember ? 'groupDetails.leave' : 'groupDetails.join')}
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
