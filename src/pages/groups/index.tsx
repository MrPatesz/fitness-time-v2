import {ActionIcon, Card, Group, Stack, Text, TextInput, useMantineTheme} from "@mantine/core";
import {openModal} from "@mantine/modals";
import {IconSearch} from "@tabler/icons";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import {useRouter} from "next/router";
import {useState} from "react";
import {Plus} from "tabler-icons-react";
import i18nConfig from "../../../next-i18next.config.mjs";
import {GroupForm} from "../../components/group/GroupForm";
import {api} from "../../utils/api";
import {getLongDateFormatter} from "../../utils/formatters";

export default function GroupsPage() {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const theme = useMantineTheme();
  const {locale} = useRouter();
  const {t} = useTranslation("common");
  const longDateFormatter = getLongDateFormatter(locale as string);

  // TODO table with pagination, sorting and search (memberCount)
  const groupsQuery = api.group.getAll.useQuery();

  return (
    <Stack>
      <Group>
        <TextInput
          sx={{flexGrow: 1}}
          icon={<IconSearch/>}
          placeholder={t("filterEvents.search") as string}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.currentTarget.value)}
        />
        <ActionIcon
          size="lg"
          variant="filled"
          color={theme.fn.themeColor(theme.primaryColor)}
          onClick={() => openModal({
            title: t("modal.group.create"),
            children: <GroupForm/>,
          })}
        >
          <Plus/>
        </ActionIcon>
      </Group>
      {groupsQuery.data?.map(group => (
        <Link
          key={group.id}
          href={`/groups/${group.id}`}
          locale={locale}
          passHref
        >
          <Card withBorder>
            <Group position="apart">
              <Text>
                {group.name}
              </Text>
              <Text>
                {group.creator.name}
              </Text>
              <Text>
                {longDateFormatter.format(group.createdAt)}
              </Text>
            </Group>
          </Card>
        </Link>
      ))}
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
