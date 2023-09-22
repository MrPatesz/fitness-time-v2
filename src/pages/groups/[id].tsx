import {ActionIcon, Group, SimpleGrid, Stack, Text, useMantineTheme} from '@mantine/core';
import {useMediaQuery} from '@mantine/hooks';
import {openModal} from '@mantine/modals';
import {showNotification} from '@mantine/notifications';
import {useSession} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
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
import {InvalidateEvent} from '../../utils/enums';
import {UserBadge} from '../../components/user/UserBadge';
import {usePathId} from '../../hooks/usePathId';
import {CenteredLoader} from '../../components/CenteredLoader';

export default function GroupDetailsPage() {
  const longDateFormatter = useLongDateFormatter();
  const theme = useMantineTheme();
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md}px)`);
  const {id: groupId, isReady} = usePathId<number>();
  const {data: session} = useSession();
  const {t} = useTranslation('common');

  const groupQuery = api.group.getById.useQuery(groupId!, {
    enabled: isReady,
  });
  const groupRatingQuery = api.rating.getAverageRatingForGroup.useQuery(groupId!, {
    enabled: isReady,
  });

  const joinGroup = api.group.join.useMutation({
    onSuccess: (_, {join}) => {
      void groupQuery.refetch(); // TODO remove: buggy on leave + rejoin
      showNotification({
        color: 'green',
        title: t(join ? 'notification.group.join.title' : 'notification.group.leave.title'),
        message: t(join ? 'notification.group.join.message' : 'notification.group.leave.message'),
      });
    },
  });

  const isCreator = groupQuery.data?.creatorId === session?.user.id;
  const isMember = useMemo(() => {
    return Boolean(groupQuery.data?.members.find(m => m.id === session?.user.id));
  }, [groupQuery.data?.members, session?.user.id]);

  return !isReady ? (
    <CenteredLoader/>
  ) : (
    <QueryComponent
      resourceName={t('resource.groupDetails')}
      query={groupQuery}
      eventInfo={{event: InvalidateEvent.GroupGetById, id: groupId}}
      loading={joinGroup.isLoading}
    >
      {groupQuery.data && (
        <Stack h="100%">
          <Group position="apart" align="start">
            <Stack>
              <Group>
                <Text weight="bold" size="xl">
                  {groupQuery.data.name}
                </Text>
                <UserBadge useLink user={groupQuery.data.creator}/>
              </Group>
              <Text>
                {t('groupTable.createdAt')}: {longDateFormatter.format(groupQuery.data.createdAt)}
              </Text>
              <QueryComponent
                resourceName={t('resource.rating')}
                query={groupRatingQuery}
                eventInfo={{event: InvalidateEvent.RatingGetAverageRatingForGroup, id: groupId}}
              >
                <RatingComponent averageRating={groupRatingQuery.data}/>
              </QueryComponent>
            </Stack>
            <Stack align="end">
              <MembersComponent
                members={groupQuery.data.members}
                isCreator={isCreator}
                onJoin={(join) => joinGroup.mutate({id: groupId, join})}
              />
              {isCreator && (
                <ActionIcon
                  title={t('modal.group.edit')}
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
            </Stack>
          </Group>
          {isMember ? (
            <>
              <RichTextDisplay
                bordered
                richText={groupQuery.data.description}
                maxHeight={100}
              />
              <SimpleGrid cols={md ? 2 : 1}>
                <GroupFeed groupId={groupId}/>
                <GroupChat groupId={groupId}/>
              </SimpleGrid>
            </>
          ) : (
            <RichTextDisplay
              bordered
              richText={groupQuery.data.description}
            />
          )}
        </Stack>
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ['common'], i18nConfig))},
});
