import {initials} from "@dicebear/collection";
import {createAvatar} from "@dicebear/core";
import {Box, useMantineTheme} from "@mantine/core";
import Image from "next/image";
import {FunctionComponent, useMemo} from "react";
import {BasicUserType} from "../../models/User";

const UserImage: FunctionComponent<{
  user: BasicUserType;
  size?: number;
}> = ({user, size = 100}) => {
  const theme = useMantineTheme();
  const radius = theme.fn.radius(theme.defaultRadius);
  const themeColor = theme.fn.themeColor(user.themeColor ?? theme.primaryColor);

  const avatar = useMemo(() => {
      return createAvatar(initials, {
        seed: user.name,
        backgroundColor: [themeColor.slice(1)],
      }).toDataUriSync();
    }, [user],
  );

  if (!user.name) {
    return (
      <Box sx={{
        width: size,
        height: size,
        borderRadius: radius,
        backgroundColor: themeColor,
      }}/>
    );
  }

  return (
    <Image
      src={avatar}
      alt="Avatar"
      width={size} height={size}
      style={{borderRadius: radius}}
    />
  );
};

export default UserImage;
