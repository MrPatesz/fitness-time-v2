import {ColorScheme, ColorSchemeProvider, MantineProvider, MantineThemeOverride} from '@mantine/core';
import {useLocalStorage} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import {NotificationsProvider} from '@mantine/notifications';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/router';
import {FunctionComponent, useMemo} from 'react';
import dayjs from '../../utils/dayjs';
import {ThemeColor} from '../../utils/enums';

export const ThemeProvider: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const {locale = 'en'} = useRouter();
  const {data: session} = useSession();

  const [colorScheme, setColorScheme] = useLocalStorage<ColorScheme>({
    key: 'mantine-color-scheme',
    defaultValue: 'dark',
  });
  const toggleColorScheme = (value?: ColorScheme) => setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

  dayjs.locale(locale);

  const myTheme = useMemo((): MantineThemeOverride => ({
    colorScheme,
    primaryColor: session?.user.themeColor ?? ThemeColor.VIOLET,
    loader: 'dots',
    cursorType: 'pointer',
    dateFormat: 'MMMM DD, YYYY',
    defaultRadius: 'md',
    datesLocale: locale,
  }), [colorScheme, session?.user.themeColor]);

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
