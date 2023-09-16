import {
  ColorScheme,
  ColorSchemeProvider,
  DefaultMantineColor,
  MantineProvider,
  MantineThemeOverride
} from '@mantine/core';
import {useLocalStorage} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import {NotificationsProvider} from '@mantine/notifications';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import {FunctionComponent, useEffect, useMemo} from 'react';
import dayjs from '../../utils/dayjs';

export const ThemeProvider: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const {locale = 'en'} = useRouter();
  const {data: session} = useSession();

  const [themeColor, setThemeColor] = useLocalStorage<DefaultMantineColor>({
    key: 'mantine-theme-color',
    defaultValue: 'dark',
  });
  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'dark',
  });
  const toggleColorScheme = (value?: ColorScheme) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  const myTheme = useMemo((): MantineThemeOverride => ({
    colorScheme,
    primaryColor: themeColor,
    loader: 'dots',
    cursorType: 'pointer',
    dateFormat: 'MMMM DD, YYYY',
    defaultRadius: 'md',
    datesLocale: locale,
  }), [colorScheme, themeColor, locale]);

  useEffect(() => {
    if (session?.user.themeColor) {
      setThemeColor(session.user.themeColor);
    }
  }, [session?.user.themeColor]);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale, dayjs]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={myTheme}>
        <ModalsProvider
          modalProps={{
            centered: true,
            closeOnClickOutside: false,
            zIndex: 401,
          }}
        >
          <NotificationsProvider>
            {children}
          </NotificationsProvider>
        </ModalsProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
