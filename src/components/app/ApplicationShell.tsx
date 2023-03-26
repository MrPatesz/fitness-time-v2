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
import {Adjustments, CalendarEvent, IconProps, Logout, Share, Ticket, UserCircle, Users} from "tabler-icons-react";
import {getBackgroundColor} from "../../utils/utilFunctions";

const NavBarLink: FunctionComponent<{
  link: {
    icon: FunctionComponent<IconProps>;
    label: string;
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
      icon={<link.icon size={20}/>}
      active={link.active}
    />
  </Link>
);

export const ApplicationShell: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const [showNavbar, {close: closeNavbar, toggle: toggleNavbar}] = useDisclosure(false);

  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {route, locale, defaultLocale} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");

  const localePrefix = locale !== defaultLocale ? `/${locale}` : "";
  const calendarRoute = `${localePrefix}/calendar`;
  const groupsRoute = `${localePrefix}/groups`;
  const profileRoute = `${localePrefix}/profile`;
  const welcomeRoute = `${localePrefix}/welcome`;
  const eventsRoute = `${localePrefix}/events`;
  const controlPanelRoute = `${localePrefix}/control-panel`;
  const usersRoute = `${localePrefix}/users`;

  const isRouteActive = (givenRoute: string) => {
    if (route === "/") {
      return false;
    }
    const actualRoute = givenRoute.split("/").at(2) as string;
    return route.includes(actualRoute);
  };

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
                variant="transparent"
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
              {label: t("navbar.events"), route: eventsRoute, icon: Ticket},
              {label: t("navbar.groups"), route: groupsRoute, icon: Share},
              {label: t("navbar.users"), route: usersRoute, icon: Users},
            ].map((link) => (
              <NavBarLink
                key={link.label}
                locale={locale as string}
                link={{
                  ...link,
                  active: isRouteActive(link.route),
                  onClick: closeNavbar,
                }}
              />
            ))}
          </Navbar.Section>
          <Navbar.Section>
            <NavBarLink
              locale={locale as string}
              link={{
                label: t("navbar.controlPanel"),
                route: controlPanelRoute,
                icon: Adjustments,
                active: isRouteActive(controlPanelRoute),
                onClick: closeNavbar,
              }}
            />
            <NavBarLink
              locale={locale as string}
              link={{
                label: session?.user?.name as string,
                route: profileRoute,
                icon: UserCircle,
                active: isRouteActive(profileRoute),
                onClick: closeNavbar,
              }}
            />
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
