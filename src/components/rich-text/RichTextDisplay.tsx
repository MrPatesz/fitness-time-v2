import {ScrollArea, Spoiler, TypographyStylesProvider} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";

export const RichTextDisplay: FunctionComponent<{
  richText: string;
  maxHeight: number;
  scroll?: boolean;
}> = ({richText, maxHeight, scroll = false}) => {
  const {t} = useTranslation("common");

  const richTextComponent = (
    <TypographyStylesProvider>
      <div dangerouslySetInnerHTML={{__html: richText}} style={{overflowWrap: "break-word"}}/>
    </TypographyStylesProvider>
  );

  return scroll ? (
    <ScrollArea offsetScrollbars h={maxHeight}>
      {richTextComponent}
    </ScrollArea>
  ) : (
    <Spoiler
      maxHeight={maxHeight}
      showLabel={t("richTextDisplay.showLabel")}
      hideLabel={t("richTextDisplay.hideLabel")}
    >
      {richTextComponent}
    </Spoiler>
  );
};
