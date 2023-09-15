import {FunctionComponent} from 'react';
import {Badge, Divider, Group, Text} from '@mantine/core';
import {IconStar} from '@tabler/icons';
import {useRouter} from 'next/router';
import {useTranslation} from 'next-i18next';
import {api} from '../../utils/api';
import {usePusher} from '../../hooks/usePusher';
import {InvalidateEvent} from '../../utils/enums';
import {BasicGroupType} from '../../models/Group';

export const GroupBadge: FunctionComponent<{
  group: BasicGroupType;
}> = ({group}) => {
  const {locale = 'en', push: pushRoute} = useRouter();
  const {t} = useTranslation('common');

  // TODO don't do this for all events on FeedPage
  const groupRatingQuery = api.rating.getAverageRatingForGroup.useQuery(group.id, {
    enabled: Boolean(group.id),
  });
  usePusher({
    event: InvalidateEvent.RatingGetAverageRatingForGroup,
    id: group.id
  }, () => void groupRatingQuery.refetch());

  // TODO Link or onClick as input prop!
  //  <Link
  //    href={`/groups/${group.id}`}
  //    locale={locale}
  //    passHref
  //  >

  return (
    <Badge
      color={group.creator.themeColor}
      variant="outline"
      title={t('myEvents.group')}
      onClick={(e) => {
        e.preventDefault();
        void pushRoute(`/groups/${group.id}`, undefined, {locale});
      }}
      sx={theme => ({
        cursor: 'pointer',
        ':hover': {
          backgroundColor: theme.fn.themeColor(group.creator.themeColor),
          color: theme.white, // TODO black/white according to ColorScheme
        },
      })}
    >
      <Group spacing={4}>
        <Text>{group.name}</Text>
        {groupRatingQuery.data?.count && (
          <>
            <Divider orientation="vertical" color={group.creator.themeColor}/>
            <Group spacing={2}>
              <Text>{groupRatingQuery.data.averageStars?.toFixed(1)}</Text>
              <IconStar size={10}/>
            </Group>
          </>
        )}
      </Group>
    </Badge>
  );
};
