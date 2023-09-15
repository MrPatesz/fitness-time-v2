import {FunctionComponent} from 'react';
import {Badge, Divider, Group, Text} from '@mantine/core';
import {IconStar} from '@tabler/icons';
import {useRouter} from 'next/router';
import {useTranslation} from 'next-i18next';
import {api} from '../../utils/api';
import {usePusher} from '../../hooks/usePusher';
import {InvalidateEvent} from '../../utils/enums';
import {BasicUserType} from '../../models/User';

export const UserBadge: FunctionComponent<{
  user: BasicUserType;
}> = ({user}) => {
  const {locale = 'en', push: pushRoute} = useRouter();
  const {t} = useTranslation('common');

  // TODO don't do this for all events on FeedPage
  const userRatingQuery = api.rating.getAverageRatingForUser.useQuery(user.id);
  usePusher({
    event: InvalidateEvent.RatingGetAverageRatingForUser,
    id: user.id
  }, () => void userRatingQuery.refetch());

  // TODO Link or onClick as input prop!
  //  <Link
  //    href={`/users/${user.id}`}
  //    locale={locale}
  //    passHref
  //  >

  return (
    <Badge
      color={user.themeColor}
      variant="outline"
      title={t('myEvents.creator')}
      onClick={(e) => {
        e.preventDefault();
        void pushRoute(`/users/${user.id}`, undefined, {locale});
      }}
      sx={theme => ({
        cursor: 'pointer',
        ':hover': {
          backgroundColor: theme.fn.themeColor(user.themeColor),
          color: theme.white, // TODO black/white according to ColorScheme
        },
      })}
    >
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
    </Badge>
  );
};
