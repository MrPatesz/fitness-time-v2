import {Box, Center, Text} from "@mantine/core";
import Link from "next/link";
import {FunctionComponent} from "react";

export const LinkButton: FunctionComponent<{
  href: string;
  label: string;
}> = ({href, label}) => {
  return (
    <Link href={href} passHref>
      <Box
        sx={theme => ({
          backgroundColor: theme.fn.primaryColor(),
          color: theme.white,
          borderRadius: theme.fn.radius(theme.defaultRadius),
          width: 81.2,
          height: 36,
          ":hover": {backgroundColor: theme.fn.themeColor(theme.primaryColor, 9)}
        })}
      >
        <Center sx={{height: "100%"}}>
          <Text weight={500} size={"sm"}>
            {label}
          </Text>
        </Center>
      </Box>
    </Link>
  );
};