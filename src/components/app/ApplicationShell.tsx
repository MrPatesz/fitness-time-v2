import {
  ActionIcon,
  AppShell,
  Burger,
  Button,
  Group,
  Header,
  MediaQuery,
  Navbar,
  NavLink,
  Title,
  useMantineTheme
} from "@mantine/core";
import {useDisclosure, useMediaQuery} from "@mantine/hooks";
import {signOut, useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import Link from "next/link";
import {useRouter} from "next/router";
import {FunctionComponent} from "react";
import {Adjustments, CalendarEvent, Logout, News, UserCircle, Users} from "tabler-icons-react";
import {getBackgroundColor} from "../../utils/utilFunctions";

export const ApplicationShell: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const [showNavbar, {close: closeNavbar, toggle: toggleNavbar}] = useDisclosure(false);

  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {route, replace: replaceRoute, locale, defaultLocale} = useRouter();
  const {t} = useTranslation("common");
  const {data: session} = useSession({
    required: true,
    onUnauthenticated() {
      if (route !== welcomeRoute) {
        replaceRoute(welcomeRoute, undefined, {locale});
      }
    },
  });

  const localePrefix = locale !== defaultLocale ? `/${locale}` : "";
  const calendarRoute = `${localePrefix}/calendar`;
  const profileRoute = `${localePrefix}/profile`;
  const welcomeRoute = `${localePrefix}/welcome`;
  const feedRoute = `${localePrefix}/feed`;
  const myEventsRoute = `${localePrefix}/my-events`;
  const usersRoute = `${localePrefix}/users`;

  return (
    <AppShell
      hidden={!session}
      header={
        <Header height={56} p="xs">
          <Group align="center" position="apart" pl={xs ? "xs" : 1}>
            <Group>
              <MediaQuery largerThan="xs" styles={{display: "none"}}>
                <Burger
                  opened={showNavbar}
                  onClick={toggleNavbar}
                  size="sm"
                  color={theme.colors.gray[6]}
                />
              </MediaQuery>
              <Link href="/" locale={locale} passHref>
                <Title order={2}>{t("application.name")}</Title>
              </Link>
            </Group>

            {xs ? (
              <Button
                variant="light"
                onClick={() => signOut({callbackUrl: welcomeRoute})}
              >
                {t("button.logout")}
              </Button>
            ) : (
              <ActionIcon
                size="lg"
                color={theme.primaryColor}
                onClick={() => signOut({callbackUrl: welcomeRoute})}
              >
                <Logout/>
              </ActionIcon>
            )}
          </Group>
        </Header>
      }
      navbarOffsetBreakpoint="xs"
      navbar={
        <Navbar width={{base: 211}} p="xs" hiddenBreakpoint="xs" hidden={!showNavbar} zIndex={401}>
          <Navbar.Section grow>
            {[
              {label: t("navbar.calendar"), route: calendarRoute, icon: CalendarEvent},
              {label: t("navbar.feed"), route: feedRoute, icon: News},
              {label: t("navbar.myEvents"), route: myEventsRoute, icon: Adjustments},
              {label: t("navbar.users"), route: usersRoute, icon: Users},
            ].map((link) => (
              <Link
                href={link.route}
                locale={locale}
                passHref
                key={link.label}
                onClick={closeNavbar}
              >
                <NavLink
                  label={link.label}
                  icon={<link.icon size={20}/>}
                  active={route.includes(link.route)}
                />
              </Link>
            ))}
          </Navbar.Section>
          <Navbar.Section sx={(xs && route.includes(calendarRoute)) ? {marginBottom: 241} : undefined}>
            <Link
              href={profileRoute}
              locale={locale}
              passHref
              onClick={closeNavbar}
            >
              <NavLink
                label={session?.user?.name}
                icon={<UserCircle size={20}/>}
                active={route.includes(profileRoute)}
              />
            </Link>
          </Navbar.Section>
        </Navbar>
      }
      styles={{
        main: {
          backgroundColor: getBackgroundColor(theme),
        }
      }}
    >
      {children}
    </AppShell>
  );
};
