import {FunctionComponent} from 'react';
import {Badge, Group, Text} from '@mantine/core';
import {IconStarFilled} from '@tabler/icons-react';
import {useTranslation} from 'next-i18next';
import {api} from '../../utils/api';
import {usePusher} from '../../hooks/usePusher';
import {InvalidateEvent} from '../../utils/enums';
import {BasicGroupType} from '../../models/Group';
import Link from 'next/link';
import {useMyRouter} from '../../hooks/useMyRouter';

export const GroupBadge: FunctionComponent<{
  group: BasicGroupType;
  useLink?: boolean;
}> = ({group, useLink = false}) => {
  const {locale, pushRoute, localePrefix} = useMyRouter();
  const {t} = useTranslation('common');

  // TODO don't do this for all events on FeedPage
  const groupRatingQuery = api.rating.getAverageRatingForGroup.useQuery(group.id, {
    enabled: Boolean(group.id),
  });
  usePusher({
    event: InvalidateEvent.RatingGetAverageRatingForGroup,
    id: group.id
  }, () => void groupRatingQuery.refetch());

  const href = `/groups/${group.id}`;

  const rightSection = !!groupRatingQuery.data?.count && (
    <Group spacing={2}>
      <Text>{groupRatingQuery.data.averageStars?.toFixed(1)}</Text>
      <IconStarFilled size={10}/>
    </Group>
  );

  return useLink ? (
    <Link
      href={href}
      locale={locale}
      passHref
      title={t('myEvents.group')}
    >
      <Badge
        color={group.creator.themeColor}
        variant="outline"
        sx={theme => ({
          display: 'flex',
          ':hover': {
            backgroundColor: theme.fn.themeColor(group.creator.themeColor),
            color: theme.white,
          },
        })}
        rightSection={rightSection}
      >
        {group.name}
      </Badge>
    </Link>
  ) : (
    <Badge
      color={group.creator.themeColor}
      variant="outline"
      title={t('myEvents.group')}
      onClick={(e) => {
        e.preventDefault();
        void pushRoute(href, undefined, {locale});
      }}
      onAuxClick={(e) => {
        e.preventDefault();
        window.open(`${localePrefix}${href}`);
      }}
      sx={theme => ({
        cursor: 'pointer',
        ':hover': {
          backgroundColor: theme.fn.themeColor(group.creator.themeColor),
          color: theme.white,
        },
      })}
      rightSection={rightSection}
    >
      {group.name}
    </Badge>
  );
};
