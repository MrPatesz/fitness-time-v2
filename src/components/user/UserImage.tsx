import {Avatar, Text} from "@mantine/core";
import {FunctionComponent} from "react";
import {BasicUserType} from "../../models/user/User";
import {getInitials} from "../../utils/utilFunctions";

const UserImage: FunctionComponent<{
  user: BasicUserType;
  size?: number;
}> = ({user, size = 100}) => {
  return (
    <Avatar
      variant="filled"
      size={size}
      src={user.image}
      color={user.themeColor}
    >
      <Text weight="normal" size={size / 1.75}>
        {getInitials(user.name)}
      </Text>
    </Avatar>
  );
};

export default UserImage;
