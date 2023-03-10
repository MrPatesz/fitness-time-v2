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
import Link from "next/link";
import {useRouter} from "next/router";
import {FunctionComponent} from "react";
import {Adjustments, CalendarEvent, Logout, News, UserCircle, Users} from "tabler-icons-react";

export const ApplicationShell: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const calendarRoute = "/calendar";
  const profileRoute = "/profile";
  const welcomeRoute = "/welcome";

  const [showNavbar, {close: closeNavbar, toggle: toggleNavbar}] = useDisclosure(false);

  const theme = useMantineTheme();
  const xs = useMediaQuery(`(min-width: ${theme.breakpoints.xs}px)`);
  const {route, replace: replaceRoute} = useRouter();
  const {data: session} = useSession({
    required: true,
    onUnauthenticated() {
      if (route !== welcomeRoute) {
        replaceRoute(welcomeRoute);
      }
    },
  });

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
              <Link href="/" as="/" passHref>
                <Title order={2}>Fitness Time</Title>
              </Link>
            </Group>

            {xs ? (
              <Button
                variant="light"
                onClick={() => signOut({callbackUrl: welcomeRoute})}
              >
                Logout
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
              {label: "Calendar", route: calendarRoute, icon: CalendarEvent},
              {label: "Feed", route: "/feed", icon: News},
              {label: "My Events", route: "/my-events", icon: Adjustments},
              {label: "Users", route: "/users", icon: Users},
            ].map((link) => (
              <Link
                href={link.route}
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
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        }
      }}
    >
      {children}
    </AppShell>
  );
};
