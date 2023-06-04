import {Card, Checkbox, Group, Slider, Stack, Text, useMantineTheme} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import i18nConfig from "../../next-i18next.config.mjs";
import {api} from "../utils/api";
import {useEffect, useMemo, useRef, useState} from "react";
import {formatDistance, getBackgroundColor} from "../utils/utilFunctions";
import {useIntersection} from "@mantine/hooks";
import {EventGrid} from "../components/event/EventGrid";
import {CenteredLoader} from "../components/CenteredLoader";
import {BasicEventType} from "../models/event/Event";

export default function FeedPage() {
  const [fluidMaxDistance, setFluidMaxDistance] = useState<number>(100);
  const [maxDistance, setMaxDistance] = useState<number>(100);
  const [enableMaxDistance, setEnableMaxDistance] = useState<boolean>(true);

  const theme = useMantineTheme();
  const {t} = useTranslation("common");
  const lastEventRef = useRef<HTMLElement>(null);
  const {ref, entry} = useIntersection({
    root: lastEventRef.current,
    threshold: 1,
  });

  const userDetailsQuery = api.user.profile.useQuery();
  const userHasLocation = Boolean(userDetailsQuery.data?.location);
  const {
    data,
    isFetching,
    fetchNextPage,
    hasNextPage,
    error,
  } = api.event.getFeed.useInfiniteQuery({maxDistance: userHasLocation && enableMaxDistance ? maxDistance : undefined}, {
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage) {
      fetchNextPage();
    }
  }, [entry]);

  const events: BasicEventType[] = useMemo(() => {
    return data?.pages.flatMap(page => page.events) ?? [];
  }, [data?.pages])

  return (
    <Stack>
      {userHasLocation && (
        <Card withBorder sx={{backgroundColor: getBackgroundColor(theme)}}>
          <Stack spacing="xs">
            <Group position="apart">
              <Group spacing={4}>
                <Text>{t("feedPage.maxDistance")}</Text>
                <Text
                  weight="bold"
                  color={enableMaxDistance ? theme.primaryColor : "dimmed"}
                >
                  {formatDistance(fluidMaxDistance)}
                </Text>
              </Group>
              <Checkbox
                label={t("feedPage.useMaxDistance")}
                checked={enableMaxDistance}
                onChange={(e) => setEnableMaxDistance(e.currentTarget.checked)}
              />
            </Group>
            <Slider
              step={10}
              min={10}
              max={200}
              label={null}
              disabled={!enableMaxDistance}
              value={fluidMaxDistance}
              onChange={setFluidMaxDistance}
              onChangeEnd={setMaxDistance}
            />
          </Stack>
        </Card>
      )}
      {error ? (
        <Card withBorder>{t("queryComponent.error", {resourceName: t("resource.feed")})}</Card>
      ) : (
        <EventGrid ref={ref} events={events}/>
      )}
      {isFetching && <CenteredLoader/>}
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
