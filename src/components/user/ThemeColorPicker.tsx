import {ColorSwatch, DefaultMantineColor, Group, Select, Text, useMantineTheme} from "@mantine/core";
import {useTranslation} from "next-i18next";
import {ComponentPropsWithoutRef, forwardRef, FunctionComponent} from "react";

export enum ThemeColor {
  RED = "red",
  PINK = "pink",
  GRAPE = "grape",
  VIOLET = "violet",
  INDIGO = "indigo",
  BLUE = "blue",
  CYAN = "cyan",
  TEAL = "teal",
  GREEN = "green",
  LIME = "lime",
  YELLOW = "yellow",
  ORANGE = "orange",
}

interface ItemProps extends ComponentPropsWithoutRef<"div"> {
  value: ThemeColor;
  label: string;
}

const SelectItem = forwardRef<HTMLDivElement, ItemProps>(
  ({value, label, ...others}: ItemProps, ref) => {
    const theme = useMantineTheme();
    return (
      <div ref={ref} {...others}>
        <Group noWrap>
          <ColorSwatch color={theme.fn.themeColor(value)}/>
          <Text>{label}</Text>
        </Group>
      </div>
    );
  }
);

export const ThemeColorPicker: FunctionComponent<{
  value: DefaultMantineColor;
  onChange: (newValue: DefaultMantineColor | null) => void;
}> = ({value, onChange}) => {
  const {t} = useTranslation("common");

  return (
    <Select
      label={t("themeColorPicker.label")}
      itemComponent={SelectItem}
      data={[
        {value: ThemeColor.RED, label: t("color.red") as string},
        {value: ThemeColor.PINK, label: t("color.pink") as string},
        {value: ThemeColor.GRAPE, label: t("color.grape") as string},
        {value: ThemeColor.VIOLET, label: t("color.violet") as string},
        {value: ThemeColor.INDIGO, label: t("color.indigo") as string},
        {value: ThemeColor.BLUE, label: t("color.blue") as string},
        {value: ThemeColor.CYAN, label: t("color.cyan") as string},
        {value: ThemeColor.TEAL, label: t("color.teal") as string},
        {value: ThemeColor.GREEN, label: t("color.green") as string},
        {value: ThemeColor.LIME, label: t("color.lime") as string},
        {value: ThemeColor.YELLOW, label: t("color.yellow") as string},
        {value: ThemeColor.ORANGE, label: t("color.orange") as string},
      ]}
      value={value}
      onChange={onChange}
    />
  );
};
