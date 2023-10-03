import {useEffect, useMemo} from 'react';
import {api} from '../utils/api';
import {useAuthenticated} from './useAuthenticated';
import {useLocalStorage, useMediaQuery} from '@mantine/hooks';
import {CreateLocationType} from '../models/Location';
import {useMantineTheme} from '@mantine/core';
import {SortCommentByProperty, SortDirection, SortEventByProperty, SortGroupByProperty} from '../utils/enums';
import {DEFAULT_PAGE_SIZE} from '../components/event/EventTable';

const getPaginatedInputBase = <SORT_BY_PROPERTY extends SortEventByProperty | SortGroupByProperty | SortCommentByProperty | undefined>(
  sortByProperty: SORT_BY_PROPERTY,
  sortByDirection: 'asc' | 'desc' = 'desc'
) => ({
  searchQuery: '',
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
  sortBy: {
    property: sortByProperty,
    direction: sortByDirection as SortDirection,
  },
});

export const usePrefetchPageQueries = () => {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const md = useMediaQuery(`(min-width: ${theme.breakpoints.md})`);
  const {authenticated, user} = useAuthenticated();
  const queryContext = api.useContext();

  // TODO object as const: LocalStorageKeys, DefaultValues
  const [includeArchive] = useLocalStorage<boolean>({
    key: 'include-archive',
    defaultValue: true,
  });
  const [myGroupsOnly] = useLocalStorage<boolean>({
    key: 'my-groups-only',
    defaultValue: false,
  });
  const [enableMaxDistance] = useLocalStorage<boolean>({
    key: 'enable-max-distance',
    defaultValue: false,
  });
  const [maxDistance] = useLocalStorage<number>({
    key: 'fluid-max-distance',
    defaultValue: 40,
  });
  const [center] = useLocalStorage<CreateLocationType | null>({
    key: 'google-map-center',
    defaultValue: null,
  });
  const [zoom] = useLocalStorage({
    key: 'google-map-zoom',
    defaultValue: 12,
  });
  const mapMaxDistance = useMemo(() => {
    const increment = md ? 0 : xs ? 0.5 : 1;
    return 40000 / Math.pow(2, zoom + increment);
  }, [zoom, xs, md]);

  useEffect(() => {
    if (authenticated) {
      if (!queryContext.event.getCalendar.getData()) {
        void queryContext.event.getCalendar.prefetch();
      }
      if (!queryContext.user.profile.getData()) {
        void queryContext.user.profile.prefetch();
      }

      const getPaginatedEventsInput1 = {
        ...getPaginatedInputBase('start' as SortEventByProperty),
        createdOnly: false,
        archive: false,
      };
      if (!queryContext.event.getPaginatedEvents.getData(getPaginatedEventsInput1)) {
        void queryContext.event.getPaginatedEvents.prefetch(getPaginatedEventsInput1);
      }

      const getPaginatedEventsInput2 = {
        ...getPaginatedInputBase('start' as SortEventByProperty),
        createdOnly: true,
        archive: false,
      };
      if (!queryContext.event.getPaginatedEvents.getData(getPaginatedEventsInput2)) {
        void queryContext.event.getPaginatedEvents.prefetch(getPaginatedEventsInput2);
      }

      const getPaginatedGroupsInput = {
        ...getPaginatedInputBase('createdAt' as SortGroupByProperty),
        createdOnly: false,
      };
      if (!queryContext.group.getPaginatedGroups.getData(getPaginatedGroupsInput)) {
        void queryContext.group.getPaginatedGroups.prefetch(getPaginatedGroupsInput);
      }

      const getPaginatedUsersInput = {
        ...getPaginatedInputBase(undefined),
        sortBy: {direction: 'asc' as SortDirection},
      };
      if (!queryContext.user.getPaginatedUsers.getData(getPaginatedUsersInput)) {
        void queryContext.user.getPaginatedUsers.prefetch(getPaginatedUsersInput);
      }

      const getAllCreatedInput = getPaginatedInputBase('postedAt' as SortCommentByProperty);
      if (!queryContext.comment.getAllCreated.getData(getAllCreatedInput)) {
        void queryContext.comment.getAllCreated.prefetch(getAllCreatedInput);
      }
    }
  }, [authenticated, queryContext]);

  useEffect(() => {
    if (authenticated) {
      const input = {center, maxDistance: mapMaxDistance};
      if (!queryContext.event.getMap.getData(input)) {
        void queryContext.event.getMap.prefetch(input);
      }
    }
  }, [authenticated, queryContext, center, mapMaxDistance]);

  useEffect(() => {
    if (authenticated) {
      const input = {
        maxDistance: user.hasLocation && enableMaxDistance ? maxDistance : undefined,
        includeArchive,
        myGroupsOnly,
      };
      if (!queryContext.event.getFeed.getInfiniteData(input)) {
        void queryContext.event.getFeed.prefetchInfinite(input);
      }
    }
  }, [
    authenticated,
    queryContext,
    user?.hasLocation,
    enableMaxDistance,
    maxDistance,
    includeArchive,
    myGroupsOnly,
  ]);

  useEffect(() => {
    if (authenticated) {
      if (!queryContext.rating.getAverageRatingForUser.getData(user.id)) {
        void queryContext.rating.getAverageRatingForUser.prefetch(user.id);
      }
    }
  }, [authenticated, queryContext, user?.id]);
};