import {initials} from "@dicebear/collection";
import {createAvatar} from "@dicebear/core";
import {Box, useMantineTheme} from "@mantine/core";
import Image from "next/image";
import React, {FunctionComponent, useMemo} from "react";
import {BasicUserType} from "../models/User";

const UserImage: FunctionComponent<{
  user: BasicUserType;
}> = ({user}) => {
  const theme = useMantineTheme();
  const radius = theme.fn.radius(theme.defaultRadius);
  const themeColor = theme.fn.themeColor(theme.primaryColor);

  const avatar = useMemo(() => {
      return createAvatar(initials, {
        seed: user.name,
        backgroundColor: [themeColor.slice(1)],
      }).toDataUriSync();
    }, [user]
  );

  /*if (!!user.image) {
    return (
      <img
        src={user.image}
        alt="Avatar"
        width={100} height={100}
        style={{borderRadius: radius}}
      />
    );
  }*/

  if (!!user.name) {
    return (
      <Image
        src={avatar}
        alt="Avatar"
        width={100} height={100}
        style={{borderRadius: radius}}
      />
    );
  }

  return (
    <Box sx={{
      width: 100,
      height: 100,
      borderRadius: radius,
      backgroundColor: themeColor,
    }}/>
  );
};

export default UserImage;
