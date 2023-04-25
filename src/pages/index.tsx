import {Card, Center, Loader, Stack} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import i18nConfig from "../../next-i18next.config.mjs";
import {EventGrid} from "../components/event/EventGrid";
import {api} from "../utils/api";
import {useEffect} from "react";
import {useInView} from "react-intersection-observer";

export default function FeedPage() {
  const {t} = useTranslation("common");
  const {ref, inView} = useInView();

  const {
    data,
    fetchNextPage,
    isFetching,
    hasNextPage,
    isLoading,
    error,
  } = api.event.getFeed.useInfiniteQuery({}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage().then();
    }
  }, [inView, data?.pages.length])

  return (
    <Stack>
      {error ? (
        <Card withBorder>{t("queryComponent.error", {resourceName: t("resource.feed")})}</Card>
      ) : isLoading ? (
        <Center sx={{height: "100%", width: "100%"}}>
          <Loader/>
        </Center>
      ) : (
        <EventGrid events={data?.pages.flatMap(page => page.events) ?? []}/>
      )}
      <Center ref={ref} sx={{height: "100%", width: "100%"}}>
        {isFetching && !isLoading && (
          <Loader/>
        )}
      </Center>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
