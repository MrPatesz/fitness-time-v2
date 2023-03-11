import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import i18nConfig from "../../next-i18next.config.mjs";
import {QueryComponent} from "../components/QueryComponent";

import {api} from "../utils/api";

export default function HomePage() {
  const allExamples = api.example.getAll.useQuery();

  return (
    <QueryComponent resourceName="Examples" query={allExamples}>
      {JSON.stringify(allExamples.data)}
    </QueryComponent>
  );
};

export const getServerSideProps = async ({locale}: { locale: string }) => ({
  props: {...(await serverSideTranslations(locale, ["common"], i18nConfig))},
});
