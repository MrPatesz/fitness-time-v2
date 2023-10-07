import {
  ActionIcon,
  AppShell,
  Box,
  Burger,
  Group,
  Header,
  MantineNumberSize,
  MediaQuery,
  Navbar,
  NavLink,
  Title,
  useMantineTheme
} from '@mantine/core';
import {useDisclosure, useMediaQuery} from '@mantine/hooks';
import {signOut} from 'next-auth/react';
import {useTranslation} from 'next-i18next';
import Link from 'next/link';
import {FunctionComponent} from 'react';
import {
  Adjustments,
  CalendarEvent,
  IconProps,
  Logout,
  Map,
  News,
  Plus,
  Share,
  Ticket,
  UserCircle,
  Users
} from 'tabler-icons-react';
import {getBackgroundColor} from '../../utils/utilFunctions';
import {ColorSchemeToggle} from './ColorSchemeToggle';
import {LanguageToggle} from './LanguageToggle';
import {CenteredLoader} from '../CenteredLoader';
import {useAuthenticated} from '../../hooks/useAuthenticated';
import {useMyRouter} from '../../hooks/useMyRouter';
import {useInitializePusher} from '../../hooks/usePusher';
import {IconShare3} from '@tabler/icons-react';
import {usePrefetchPageQueries} from '../../hooks/usePrefetchPageQueries';
import {openModal} from '@mantine/modals';
import {CreateEventForm} from '../event/CreateEventForm';

const [
  feedRoute,
  calendarRoute,
  groupsRoute,
  profileRoute,
  welcomeRoute,
  eventsRoute,
  controlPanelRoute,
  usersRoute,
  mapRoute,
] = ['/', '/calendar', '/groups', '/profile', '/welcome', '/events', '/control-panel', '/users', '/map'];

const NavbarLink: FunctionComponent<{
  link: {
    icon: FunctionComponent<IconProps>;
    label: string;
    title: string;
    route: string;
    onClick: () => void;
    active: boolean;
  };
  locale: string;
}> = ({link, locale}) => (
  <Link
    href={link.route}
    locale={locale}
    passHref
    onClick={link.onClick}
  >
    <NavLink
      label={link.label}
      title={link.title}
      active={link.active}
      icon={<link.icon size={20}/>}
    />
  </Link>
);

export const ApplicationShell: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs})`);
  const {route, locale, pushRoute} = useMyRouter();
  const {t} = useTranslation('common');
  const {loading, authenticated, user} = useAuthenticated({
    required: !route.includes(welcomeRoute),
    onUnauthenticated: () => void pushRoute(welcomeRoute, undefined, {locale}),
  });

  const [showNavbar, {close: closeNavbar, toggle: toggleNavbar}] = useDisclosure(false);

  useInitializePusher();
  usePrefetchPageQueries();

  const isRouteActive = (testedRoute: string) => {
    if (testedRoute === '/') {
      return route === testedRoute;
    } else {
      return route.includes(testedRoute);
    }
  };

  const breakpoint: MantineNumberSize = 'sm';

  return (
    <AppShell
      header={
        !loading ? (
          <Header height={56} py="xs" px="md">
            <Group align="center" position="apart">
              <Group spacing="xs">
                {authenticated && (
                  <MediaQuery largerThan={breakpoint} styles={{display: 'none'}}>
                    <Burger
                      title={t('application.menu')}
                      opened={showNavbar}
                      onClick={toggleNavbar}
                      size="sm"
                      color={theme.colors.gray[6]}
                    />
                  </MediaQuery>
                )}
                {authenticated ? (
                  <Link
                    href="/"
                    locale={locale}
                    passHref
                    onClick={closeNavbar}
                    title={t('application.feed')}
                  >
                    <Title order={2}>{t(xs ? 'application.name' : 'application.shortName')}</Title>
                  </Link>
                ) : (
                  <Title order={2}>{t('application.name')}</Title>
                )}
              </Group>
              <Group spacing="xs">
                <ActionIcon
                  title={t('application.share')}
                  size="lg"
                  variant={theme.colorScheme === 'dark' ? 'outline' : 'default'}
                  onClick={() => {
                    const shareData: ShareData = {
                      url: window.location.href,
                      title: t('application.name'),
                      text: t('application.shareDescription', {username: user?.name ?? t('application.someone')}),
                    };
                    if (navigator.canShare(shareData)) {
                      void navigator.share(shareData);
                    }
                  }}
                >
                  <IconShare3/>
                </ActionIcon>
                <LanguageToggle/>
                <ColorSchemeToggle/>
                {authenticated && (
                  <ActionIcon
                    title={t('modal.event.create')}
                    size="lg"
                    variant="filled"
                    color={theme.fn.themeColor(theme.primaryColor)}
                    onClick={() => openModal({
                      title: t('modal.event.create'),
                      children: <CreateEventForm/>,
                      fullScreen: !xs,
                    })}
                  >
                    <Plus/>
                  </ActionIcon>
                )}
              </Group>
            </Group>
          </Header>
        ) : undefined
      }
      navbarOffsetBreakpoint={breakpoint}
      navbar={
        authenticated ? (
          <Navbar width={{base: 211}} p="xs" hiddenBreakpoint={breakpoint} hidden={!showNavbar} zIndex={401}>
            <Navbar.Section grow>
              {[
                {label: t('navbar.feed.label'), title: t('navbar.feed.title'), route: feedRoute, icon: News},
                {
                  label: t('navbar.calendar.label'),
                  title: t('navbar.calendar.title'),
                  route: calendarRoute,
                  icon: CalendarEvent
                },
                {label: t('navbar.map.label'), title: t('navbar.map.title'), route: mapRoute, icon: Map},
                {label: t('navbar.events.label'), title: t('navbar.events.title'), route: eventsRoute, icon: Ticket},
                {label: t('navbar.groups.label'), title: t('navbar.groups.title'), route: groupsRoute, icon: Share},
                {label: t('navbar.users.label'), title: t('navbar.users.title'), route: usersRoute, icon: Users},
              ].map((link) => (
                <NavbarLink
                  key={link.label}
                  locale={locale}
                  link={{
                    ...link,
                    active: isRouteActive(link.route),
                    onClick: closeNavbar,
                  }}
                />
              ))}
            </Navbar.Section>
            <Navbar.Section>
              <NavbarLink
                locale={locale}
                link={{
                  label: t('navbar.controlPanel.label'),
                  title: t('navbar.controlPanel.title'),
                  route: controlPanelRoute,
                  icon: Adjustments,
                  active: isRouteActive(controlPanelRoute),
                  onClick: closeNavbar,
                }}
              />
              <Group position="apart" spacing="xs" noWrap>
                <Box sx={{flexGrow: 1}}>
                  <NavbarLink
                    locale={locale}
                    link={{
                      label: user.name,
                      title: t('navbar.profile.title'),
                      route: profileRoute,
                      icon: UserCircle,
                      active: isRouteActive(profileRoute),
                      onClick: closeNavbar,
                    }}
                  />
                </Box>
                <ActionIcon
                  title={t('application.logout')}
                  size="lg"
                  variant={theme.colorScheme === 'dark' ? 'outline' : 'default'}
                  onClick={() => void signOut({callbackUrl: welcomeRoute})}
                >
                  <Logout/>
                </ActionIcon>
              </Group>
            </Navbar.Section>
          </Navbar>
        ) : undefined}
      styles={{
        main: {
          backgroundColor: getBackgroundColor(theme),
        }
      }}
    >
      {loading ? (<CenteredLoader/>) : children}
    </AppShell>
  );
};
