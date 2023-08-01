import {ActionIcon, Box, Group, SimpleGrid, Stack, Text, useMantineTheme} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {openModal} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import {useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import Link from 'next/link';
import {useRouter} from 'next/router';
import {useMemo} from 'react';
import {Pencil} from 'tabler-icons-react';
import i18nConfig from '../../../next-i18next.config.mjs';
import {GroupChat} from '../../components/group/GroupChat';
import {GroupFeed} from '../../components/group/GroupFeed';
import {MembersComponent} from '../../components/group/MembersComponent';
import {QueryComponent} from '../../components/QueryComponent';
import {RatingComponent} from '../../components/RatingComponent';
import {RichTextDisplay} from '../../components/rich-text/RichTextDisplay';
import {api} from '../../utils/api';
import {useLongDateFormatter} from '../../utils/formatters';
import {EditGroupForm} from '../../components/group/EditGroupForm';

export default function GroupDetailsPage() {
  const theme = useMantineTheme();
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const {query: {id}, isReady, locale = 'en'} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation('common');
  const longDateFormatter = useLongDateFormatter();

  const groupId = parseInt(id as string);
  const groupQuery = api.group.getById.useQuery(groupId, {
    enabled: isReady,
  });
  const groupRatingQuery = api.rating.getAverageRatingForGroup.useQuery(groupId, {
    enabled: isReady,
  });

  const useJoinGroup = api.group.join.useMutation({
    onSuccess: (_data, {join}) => groupQuery.refetch().then(() =>
      showNotification({
        color: 'green',
        title: t(join ? 'notification.group.join.title' : 'notification.group.leave.title'),
        message: t(join ? 'notification.group.join.message' : 'notification.group.leave.message'),
      })
    ),
  });

  const isMember = useMemo(() => {
    return Boolean(groupQuery.data?.members.find(m => m.id === session?.user.id));
  }, [groupQuery.data?.members, session?.user.id]);

  return (
    <QueryComponent resourceName={t('resource.groupDetails')} query={groupQuery}>
      {groupQuery.data && (
        <Stack sx={{height: '100%'}}>
          <Group position="apart" align="start">
            <Stack>
              <Group align="end">
                <Text weight="bold" size="xl">
                  {groupQuery.data.name}
                </Text>
                <Link
                  href={`/users/${groupQuery.data.creator.id}`}
                  locale={locale}
                  passHref
                >
                  <Text color="dimmed">
                    {groupQuery.data.creator.name}
                  </Text>
                </Link>
              </Group>
              <Group>
                <Text>
                  {longDateFormatter.format(groupQuery.data.createdAt)}
                </Text>
                {groupQuery.data?.creatorId === session?.user.id && (
                  <ActionIcon
                    size="lg"
                    variant="filled"
                    color={theme.fn.themeColor(theme.primaryColor)}
                    onClick={() => openModal({
                      title: t('modal.group.edit'),
                      children: <EditGroupForm groupId={groupId}/>,
                    })}
                  >
                    <Pencil/>
                  </ActionIcon>
                )}
              </Group>
              <RatingComponent averageRating={groupRatingQuery.data}/>
            </Stack>
            <MembersComponent
              members={groupQuery.data.members}
              isCreator={groupQuery.data.creatorId === session?.user.id}
              onJoin={(join) => useJoinGroup.mutate({id: groupId, join})}
            />
          </Group>
          {isMember ? (
            <SimpleGrid
              cols={md ? 2 : 1}
              sx={{flexGrow: 1}}
            >
              <GroupFeed groupId={groupId}/>
              <Stack>
                <RichTextDisplay bordered richText={groupQuery.data.description} maxHeight={300} scroll/>
                <Box sx={{flexGrow: 1}}>
                  <GroupChat groupId={groupId}/>
                </Box>
              </Stack>
            </SimpleGrid>
          ) : (
            <RichTextDisplay bordered richText={groupQuery.data.description}/>
          )}
        </Stack>
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ['common'], i18nConfig))},
});
