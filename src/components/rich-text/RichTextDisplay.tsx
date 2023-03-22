import {Spoiler, TypographyStylesProvider} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {FunctionComponent} from "react";

export const RichTextDisplay: FunctionComponent<{
  richText: string;
  maxHeight: number;
}> = ({richText, maxHeight}) => {
  const {t} = useTranslation("common");

  return (
    <Spoiler
      maxHeight={maxHeight}
      showLabel={t("richTextDisplay.showLabel")}
      hideLabel={t("richTextDisplay.hideLabel")}
    >
      <TypographyStylesProvider>
        <div dangerouslySetInnerHTML={{__html: richText}} style={{overflowWrap: "break-word"}}/>
      </TypographyStylesProvider>
    </Spoiler>
  );
};
