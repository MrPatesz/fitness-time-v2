import {FunctionComponent} from 'react';
import {Card} from '@mantine/core';
import {getBackgroundColor} from '../utils/utilFunctions';

export const BorderComponent: FunctionComponent<{
  children: JSX.Element;
}> = ({children}) => {
  return (
    <Card withBorder sx={theme => ({backgroundColor: getBackgroundColor(theme)})}>
      {children}
    </Card>
  );
};
