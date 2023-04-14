import {
  ActionIcon,
  Avatar,
  Button,
  Card,
  Center,
  Group,
  Loader,
  ScrollArea, SimpleGrid,
  Stack,
  Text,
  TextInput,
  useMantineTheme
} from "@mantine/core";
import {showNotification} from "@mantine/notifications";
import {useSession} from "next-auth/react";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import {useRouter} from "next/router";
import {Minus, Plus} from "tabler-icons-react";
import i18nConfig from "../../../next-i18next.config.mjs";
import {QueryComponent} from "../../components/QueryComponent";
import {RichTextDisplay} from "../../components/rich-text/RichTextDisplay";
import {api} from "../../utils/api";
import {getLongDateFormatter} from "../../utils/formatters";
import {getBackgroundColor, getInitials} from "../../utils/utilFunctions";
import {useInView} from "react-intersection-observer";
import {useEffect, useMemo, useRef} from "react";

export default function GroupDetailsPage() {
  const theme = useMantineTheme();
  const {query: {id}, isReady, locale} = useRouter();
  const {data: session} = useSession();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);
  const {ref, inView} = useInView();
  const viewport = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => viewport.current?.scrollTo({top: viewport.current?.scrollHeight});

  useEffect(() => {
    scrollToBottom();
  }, [viewport.current])

  const groupId = parseInt(id as string);
  const groupQuery = api.group.getById.useQuery(groupId, {
    enabled: isReady,
  });
  const useJoinGroup = api.group.join.useMutation({
    onSuccess: (_data, {join}) => groupQuery.refetch().then(() =>
      showNotification({
        color: "green",
        title: t(join ? "notification.group.join.title" : "notification.group.leave.title"),
        message: t(join ? "notification.group.join.message" : "notification.group.leave.message"),
      })
    ),
  });
  const {
    data,
    fetchNextPage,
    isFetching,
    hasNextPage,
    isLoading,
    error,
    refetch: refetchMessages,
  } = api.groupChat.getMessages.useInfiniteQuery({groupId}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });
  const useCreateMessage = api.groupChat.create.useMutation({
    onSuccess: () => refetchMessages().then(() =>
      showNotification({
        color: "green",
        title: t("notification.message.sent.title"),
        message: t("notification.message.sent.message"),
      })
    ),
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().then(() => {
        setTimeout(() => {
          const numberOfPages = data?.pages.length ?? 1;
          const scrollRatio = 1 - numberOfPages / (numberOfPages + 1);
          viewport.current?.scrollTo({top: viewport.current?.scrollHeight * scrollRatio});
        }, 100);
      });
    }
  }, [inView])

  const messages = useMemo(() => {
    if (!data) return [];

    return [...data.pages].reverse().flatMap(page => page.messages);
  }, [data?.pages])

  return (
    <QueryComponent resourceName={t("resource.groupDetails")} query={groupQuery}>
      {groupQuery.data && (
        <Stack sx={{height: "100%"}}>
          <Group position="apart" align="start">
            <Stack>
              <Group align="end">
                <Text weight="bold" size="xl">
                  {groupQuery.data.name}
                </Text>
                <Link
                  href={`/users/${groupQuery.data.creator.id}`}
                  locale={locale}
                  passHref
                >
                  <Text color="dimmed">
                    {groupQuery.data.creator.name}
                  </Text>
                </Link>
              </Group>
              <Text>
                {longDateFormatter.format(groupQuery.data.createdAt)}
              </Text>
            </Stack>
            <Avatar.Group>
              {groupQuery.data.members.slice(0, 5).map(user => (
                <Avatar
                  key={user.id}
                  variant="filled"
                  radius="xl"
                  size="lg"
                  src={user.image}
                  color={theme.fn.themeColor(theme.primaryColor)}
                >
                  <Text weight="normal" size={10}>
                    {getInitials(user.name)}
                  </Text>
                </Avatar>
              ))}
              {groupQuery.data.members.length > 5 && (
                <Avatar
                  variant="light"
                  radius="xl"
                  size="lg"
                  color={theme.fn.themeColor(theme.primaryColor)}
                >
                  +{groupQuery.data.members.length - 5}
                </Avatar>
              )}
              {groupQuery.data.creatorId !== session?.user.id &&
                (!groupQuery.data.members.find(m => m.id === session?.user.id) ? (
                  <Avatar
                    variant="filled"
                    radius="xl"
                    color={theme.fn.themeColor(theme.primaryColor)}
                  >
                    <ActionIcon
                      variant="filled"
                      color={theme.fn.themeColor(theme.primaryColor)}
                      onClick={() => useJoinGroup.mutate({id: groupId, join: true})}
                    >
                      <Plus/>
                    </ActionIcon>
                  </Avatar>
                ) : (
                  <Avatar
                    variant="filled"
                    radius="xl"
                    color={theme.fn.themeColor(theme.primaryColor)}
                  >
                    <ActionIcon
                      variant="filled"
                      color={theme.fn.themeColor(theme.primaryColor)}
                      onClick={() => useJoinGroup.mutate({id: groupId, join: false})}
                    >
                      <Minus/>
                    </ActionIcon>
                  </Avatar>
                ))}
            </Avatar.Group>
          </Group>
          {groupQuery.data.description && (
            <Card withBorder sx={theme => ({backgroundColor: getBackgroundColor(theme)})}>
              <RichTextDisplay richText={groupQuery.data.description} maxHeight={400}/>
            </Card>
          )}
          {groupQuery.data.members.find(m => m.id === session?.user.id) && (
            <SimpleGrid cols={2} sx={{flexGrow: 1}}>
              <Card
                withBorder
                sx={theme => ({
                  backgroundColor: getBackgroundColor(theme),
                  height: "100%"
                })}
              >
                Events
              </Card>
              <Card
                withBorder
                sx={theme => ({
                  backgroundColor: getBackgroundColor(theme),
                  height: "100%",
                })}
              >
                <ScrollArea
                  viewportRef={viewport}
                  h={200}
                  // sx={{height: "100%",}}
                >
                  <Stack>
                    <Center ref={ref} sx={{width: "100%"}}>
                      {isFetching && (
                        <Loader/>
                      )}
                    </Center>
                    {error ? (
                      <Card withBorder>{t("queryComponent.error", {resourceName: t("resource.chat")})}</Card>
                    ) : isLoading ? (
                      <Center sx={{height: "100%", width: "100%"}}>
                        <Loader/>
                      </Center>
                    ) : (
                      messages.map(m => (
                        <Card
                          key={m.id}>{m.user.name}: {m.message} - {getLongDateFormatter(locale as string).format(m.postedAt)}</Card>
                      ))
                    )}
                  </Stack>
                </ScrollArea>
                <Group>
                  <TextInput defaultValue={"heloka"}/>
                  <Button
                    onClick={() => useCreateMessage.mutate({groupId, createMessage: {message: "heloka"}})}
                  >
                    Post
                  </Button>
                </Group>
              </Card>
            </SimpleGrid>
          )}
        </Stack>
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
