import {Tabs} from "@mantine/core";
import {IconMessageCircle} from "@tabler/icons";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {Share, Ticket} from "tabler-icons-react";
import i18nConfig from "../../next-i18next.config.mjs";
import EventTable, {EventTableDisplayPlace} from "../components/event/EventTable";
import GroupTable, {GroupTableDisplayPlace} from "../components/group/GroupTable";
import CommentTable from "../components/comment/CommentTable";

export default function ControlPanelPage() {
  const {t} = useTranslation("common");

  return (
    <Tabs defaultValue="events" sx={{height: "100%"}}>
      <Tabs.List grow>
        <Tabs.Tab value="events" icon={<Ticket size={20}/>}>{t("resource.events")}</Tabs.Tab>
        <Tabs.Tab value="groups" icon={<Share size={20}/>}>{t("resource.groups")}</Tabs.Tab>
        <Tabs.Tab value="comments" icon={<IconMessageCircle size={20}/>}>{t("resource.comments")}</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="events" pt="md" sx={{height: "calc(100% - 42px)"}}>
        <EventTable eventTableDisplayPlace={EventTableDisplayPlace.CONTROL_PANEL}/>
      </Tabs.Panel>

      <Tabs.Panel value="groups" pt="md" sx={{height: "calc(100% - 42px)"}}>
        <GroupTable groupTableDisplayPlace={GroupTableDisplayPlace.CONTROL_PANEL}/>
      </Tabs.Panel>

      <Tabs.Panel value="comments" pt="md" sx={{height: "calc(100% - 42px)"}}>
        <CommentTable/>
      </Tabs.Panel>
    </Tabs>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
