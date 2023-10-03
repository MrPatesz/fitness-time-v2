import {
  ColorScheme,
  ColorSchemeProvider,
  DefaultMantineColor,
  MantineProvider,
  MantineThemeOverride
} from '@mantine/core';
import {useLocalStorage} from '@mantine/hooks';
import {ModalsProvider} from '@mantine/modals';
import {Notifications} from '@mantine/notifications';
import {useSession} from 'next-auth/react';
import {FunctionComponent, useEffect, useMemo} from 'react';
import dayjs from '../../utils/dayjs';
import {useMyRouter} from '../../hooks/useMyRouter';
import {DatesProvider} from '@mantine/dates';
import {getFirstDayOfWeek} from '../../utils/utilFunctions';

export const ThemeProvider: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  const {locale} = useMyRouter();
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
    defaultRadius: 'md',
  }), [colorScheme, themeColor]);

  useEffect(() => {
    if (session?.user.themeColor) {
      setThemeColor(session.user.themeColor);
    }
  }, [session?.user.themeColor, setThemeColor]);

  useEffect(() => {
    dayjs.locale(locale);
  }, [locale]);

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={myTheme}>
        <DatesProvider settings={{locale, firstDayOfWeek: getFirstDayOfWeek(locale)}}>
          <ModalsProvider
            modalProps={{
              centered: true,
              closeOnClickOutside: false,
              zIndex: 401,
              yOffset: 0,
            }}
          >
            <Notifications/>
            {children}
          </ModalsProvider>
        </DatesProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
};
