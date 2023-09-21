import {FunctionComponent} from 'react';
import {Badge, Divider, Group, Text} from '@mantine/core';
import {IconStar} from '@tabler/icons';
import {useTranslation} from 'next-i18next';
import {api} from '../../utils/api';
import {usePusher} from '../../hooks/usePusher';
import {InvalidateEvent} from '../../utils/enums';
import {BasicUserType} from '../../models/User';
import Link from 'next/link';
import {useMyRouter} from '../../hooks/useMyRouter';

export const UserBadge: FunctionComponent<{
  user: BasicUserType;
  useLink?: boolean;
}> = ({user, useLink = false}) => {
  const {locale, pushRoute, localePrefix} = useMyRouter();
  const {t} = useTranslation('common');

  // TODO don't do this for all events on FeedPage
  const userRatingQuery = api.rating.getAverageRatingForUser.useQuery(user.id);
  usePusher({
    event: InvalidateEvent.RatingGetAverageRatingForUser,
    id: user.id
  }, () => void userRatingQuery.refetch());

  const content = (
    <Group spacing={4}>
      <Text>{user.name}</Text>
      {userRatingQuery.data?.count && (
        <>
          <Divider orientation="vertical" color={user.themeColor}/>
          <Group spacing={2}>
            <Text>{userRatingQuery.data.averageStars?.toFixed(1)}</Text>
            <IconStar size={10}/>
          </Group>
        </>
      )}
    </Group>
  );

  const href = `/users/${user.id}`;

  return useLink ? (
    <Link
      href={href}
      locale={locale}
      passHref
      title={t('myEvents.creator')}
    >
      <Badge
        color={user.themeColor}
        variant="outline"
        sx={theme => ({
          display: 'flex',
          ':hover': {
            backgroundColor: theme.fn.themeColor(user.themeColor),
            color: theme.white,
          },
        })}
      >
        {content}
      </Badge>
    </Link>
  ) : (
    <Badge
      color={user.themeColor}
      variant="outline"
      title={t('myEvents.creator')}
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
          backgroundColor: theme.fn.themeColor(user.themeColor),
          color: theme.white,
        },
      })}
    >
      {content}
    </Badge>
  );
};
