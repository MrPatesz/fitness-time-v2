import {AppShell, Header, Navbar, NavLink} from "@mantine/core";
import {useSession} from "next-auth/react";
import Link from "next/link";
import {useRouter} from "next/router";
import {FunctionComponent} from "react";
import {Adjustments, CalendarEvent, News, Users} from "tabler-icons-react";
import {HeaderComponent} from "./HeaderComponent";

export const ApplicationShell: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const welcomeRoute = "/welcome";

  const router = useRouter();
  const {data: session} = useSession({
    required: true,
    onUnauthenticated() {
      if (router.route !== welcomeRoute) {
        router.replace(welcomeRoute);
      }
    },
  });

  return (
    <AppShell
      hidden={!session}
      navbar={
        <Navbar width={{base: 200}} p="xs">
          {[
            {label: "Calendar", route: "/calendar", icon: CalendarEvent},
            {label: "Feed", route: "/feed", icon: News},
            {label: "My Events", route: "/my-events", icon: Adjustments},
            {label: "Users", route: "/users", icon: Users},
          ].map((link) => (
            <Link
              href={link.route}
              as={link.route}
              passHref
              key={link.label}
            >
              <NavLink
                label={link.label}
                icon={<link.icon size={20}/>}
                active={router.route.includes(link.route)}
              />
            </Link>
          ))}
        </Navbar>
      }
      header={
        <Header height={56} p="xs">
          <HeaderComponent username={session?.user?.name}/>
        </Header>
      }
      styles={(theme) => ({
        main: {
          backgroundColor:
            theme.colorScheme === "dark"
              ? theme.colors.dark[8]
              : theme.colors.gray[0],
        },
      })}
    >
      {children}
    </AppShell>
  );
};
