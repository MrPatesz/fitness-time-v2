import {ScrollArea, Spoiler, TypographyStylesProvider} from '@mantine/core';
import {useTranslation} from 'next-i18next';
import {FunctionComponent, useMemo, useRef} from 'react';
import {BorderComponent} from '../BorderComponent';

export const RichTextDisplay: FunctionComponent<{
  richText: string;
  maxHeight?: number;
  scroll?: boolean;
  bordered?: boolean;
}> = ({richText, maxHeight, scroll = false, bordered = false}) => {
  const {t} = useTranslation('common');
  const ref = useRef<HTMLDivElement>(null);

  const height = useMemo(() => {
    const clientHeight = ref.current?.clientHeight;
    if (maxHeight && (!clientHeight || maxHeight < clientHeight)) {
      return maxHeight;
    }
    if (!ref.current) {
      return 0;
    }
    return ref.current.clientHeight;
  }, [ref.current?.clientHeight, maxHeight]);

  if (!richText) {
    return <></>;
  }

  const richTextComponent = (
    <TypographyStylesProvider ref={ref}>
      <div dangerouslySetInnerHTML={{__html: richText}} style={{overflowWrap: 'break-word'}}/>
    </TypographyStylesProvider>
  );

  return (
    <ConditionalBorderComponent bordered={bordered}>
      {maxHeight !== height ? (
        richTextComponent
      ) : (
        scroll ? (
          <ScrollArea offsetScrollbars h={height}>
            {richTextComponent}
          </ScrollArea>
        ) : (
          <Spoiler
            maxHeight={height}
            showLabel={t('richTextDisplay.showLabel')}
            hideLabel={t('richTextDisplay.hideLabel')}
          >
            {richTextComponent}
          </Spoiler>
        )
      )}
    </ConditionalBorderComponent>
  );
};

const ConditionalBorderComponent: FunctionComponent<{
  bordered: boolean;
  children: JSX.Element;
}> = ({bordered, children}) => {
  if (!bordered) {
    return children;
  }

  return (
    <BorderComponent>
      {children}
    </BorderComponent>
  );
};
