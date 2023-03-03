import {ColorSwatch, DefaultMantineColor, Group, Select, Text, useMantineTheme} from "@mantine/core";
import {forwardRef, FunctionComponent} from "react";

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

const themeColorValues = [
  {value: ThemeColor.RED, label: "Red"},
  {value: ThemeColor.PINK, label: "Pink"},
  {value: ThemeColor.GRAPE, label: "Grape"},
  {value: ThemeColor.VIOLET, label: "Violet"},
  {value: ThemeColor.INDIGO, label: "Indigo"},
  {value: ThemeColor.BLUE, label: "Blue"},
  {value: ThemeColor.CYAN, label: "Cyan"},
  {value: ThemeColor.TEAL, label: "Teal"},
  {value: ThemeColor.GREEN, label: "Green"},
  {value: ThemeColor.LIME, label: "Lime"},
  {value: ThemeColor.YELLOW, label: "Yellow"},
  {value: ThemeColor.ORANGE, label: "Orange"},
];

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
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
  value: DefaultMantineColor | null;
  onChange: (newValue: DefaultMantineColor | null) => void;
}> = ({value, onChange}) => {
  return (
    <Select
      label="Theme Color"
      placeholder="Violet"
      itemComponent={SelectItem}
      data={themeColorValues}
      value={value}
      onChange={onChange}
    />
  );
};
