import {useRouter} from 'next/router';

export const useMyRouter = () => {
  const {
    route,
    push: pushRoute,
    replace: replaceRoute,
    locale = 'en',
    defaultLocale = 'en',
    asPath,
  } = useRouter();

  const isDefaultLocale = locale === defaultLocale;

  return {
    route,
    pushRoute,
    replaceRoute,
    locale,
    defaultLocale,
    isDefaultLocale,
    localePrefix: isDefaultLocale ? '' : `/${locale}`,
    asPath,
  };
};
