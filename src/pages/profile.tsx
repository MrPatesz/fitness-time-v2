import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import i18nConfig from "../../next-i18next.config.mjs";
import {QueryComponent} from "../components/QueryComponent";
import {ProfileForm} from "../components/user/ProfileForm";
import {api} from "../utils/api";

export default function ProfilePage() {
  const {t} = useTranslation("common");

  const userDetailsQuery = api.user.profile.useQuery();

  return (
    <QueryComponent resourceName={t("resource.profile")} query={userDetailsQuery}>
      {userDetailsQuery.data && (
        <ProfileForm
          user={userDetailsQuery.data}
        />
      )}
    </QueryComponent>
  );
}

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
