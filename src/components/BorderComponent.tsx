import {FunctionComponent} from 'react';
import {Card} from '@mantine/core';
import {getBackgroundColor} from '../utils/utilFunctions';
import {ThemeColor} from '../utils/enums';

export const BorderComponent: FunctionComponent<{
  children: JSX.Element;
  borderColor?: ThemeColor;
}> = ({children, borderColor}) => {
  return (
    <Card
      withBorder
      sx={theme => ({
        backgroundColor: getBackgroundColor(theme),
        borderColor: borderColor ? `${theme.fn.themeColor(borderColor)} !important` : undefined,
      })}
    >
      {children}
    </Card>
  );
};
