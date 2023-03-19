import {Avatar, Text} from "@mantine/core";
import {FunctionComponent} from "react";
import {BasicUserType} from "../../models/User";

const getInitials = (username: string) => {
  const names: string[] = username.split(" ");
  let initials: string[] | string = "";

  switch (names.length) {
    case 0:
      break;
    case 1:
      initials = (names.at(0) as string).slice(0, 2).toUpperCase();
      break;
    case 2:
      initials = names.map(s => (s.at(0) as string).toUpperCase());
      break;
    default:
      initials = [
        ((names.at(0) as string).at(0) as string).toUpperCase(),
        ((names.at(-1) as string).at(0) as string).toUpperCase()
      ];
      break;
  }

  return initials;
};

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
