import {ActionIcon, Card, Group, Stack, Text, TextInput} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import Link from "next/link";
import {useRouter} from "next/router";
import {useMemo, useState} from "react";
import {ArrowDown, ArrowUp, Search} from "tabler-icons-react";
import i18nConfig from "../../../next-i18next.config.mjs";
import {QueryComponent} from "../../components/QueryComponent";
import {api} from "../../utils/api";

export default function UsersPage() {
  const {locale} = useRouter();
  const {t} = useTranslation("common");

  const usersQuery = api.user.getAll.useQuery();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [ascending, setAscending] = useState<boolean>(true);

  const filteredList = useMemo(() => {
    if (!usersQuery.data) return [];

    return usersQuery.data
      ?.filter((a) =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      ?.sort((a, b) => {
        let result = a.name.localeCompare(b.name);
        if (!ascending) {
          result *= -1;
        }
        return result;
      });
  }, [searchTerm, ascending, usersQuery.data]);

  return (
    <Stack>
      <Group align="end" position="apart">
        <TextInput
          sx={{width: "300px"}}
          label={t("usersPage.search")}
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          icon={<Search/>}
        />
        <TextInput
          sx={{width: "300px"}}
          label={t("common.orderBy")}
          readOnly
          value={t("common.name") as string}
          rightSection={
            <ActionIcon onClick={() => setAscending(!ascending)}>
              {ascending ? <ArrowUp/> : <ArrowDown/>}
            </ActionIcon>
          }
        />
      </Group>
      <QueryComponent resourceName={t("resource.users")} query={usersQuery}>
        <Stack>
          {filteredList.map((user) => (
            <Link
              href={`/users/${user.id}`}
              locale={locale}
              passHref
              key={user.id}
            >
              <Card withBorder>
                <Text sx={{cursor: "pointer"}}>{user.name}</Text>
              </Card>
            </Link>
          ))}
        </Stack>
      </QueryComponent>
    </Stack>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
