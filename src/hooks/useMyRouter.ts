import {useRouter} from 'next/router';

export const useMyRouter = () => {
  const {
    asPath,
    route,
    push: pushRoute,
    replace: replaceRoute,
    locale = 'en',
    defaultLocale = 'en',
  } = useRouter();

  const isDefaultLocale = locale === defaultLocale;
  const localePrefix = isDefaultLocale ? '' : `/${locale}`;

  return {
    asPath,
    route,
    pushRoute,
    replaceRoute,
    locale,
    defaultLocale,
    isDefaultLocale,
    localePrefix,
  };
};
