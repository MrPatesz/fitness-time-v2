import {useRouter} from 'next/router';
import {useMemo} from 'react';
import {Select} from "@mantine/core";
import {capitalize} from "../utils/utilFunctions";

const LanguagePicker = () => {
  const {locale = "en", locales = ["en", "hu"], asPath, push: pushRoute} = useRouter();

  const options = useMemo(() => {
    const languageNames = new Intl.DisplayNames([locale], {type: 'language'});
    return locales.map(l => ({value: l, label: capitalize(languageNames.of(l) ?? l)}));
  }, [locale, locales]);

  return (
    <Select
      data={options}
      defaultValue={locale}
      onChange={(newLocale: string) => pushRoute(asPath, undefined, {locale: newLocale})}
    />
  );
};

export default LanguagePicker;
