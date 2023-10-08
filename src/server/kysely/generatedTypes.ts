import type {ColumnType} from 'kysely';

export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export const Color = {
  red: 'red',
  pink: 'pink',
  grape: 'grape',
  violet: 'violet',
  indigo: 'indigo',
  blue: 'blue',
  cyan: 'cyan',
  teal: 'teal',
  green: 'green',
  lime: 'lime',
  yellow: 'yellow',
  orange: 'orange'
} as const;
export type Color = (typeof Color)[keyof typeof Color];
export type Account = {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
};
export type Comment = {
  id: Generated<number>;
  text: string;
  postedAt: Generated<Timestamp>;
  userId: string;
  eventId: number;
};
export type Event = {
  id: Generated<number>;
  createdAt: Generated<Timestamp>;
  updatedAt: Timestamp;
  name: string;
  start: Timestamp;
  end: Timestamp;
  description: string;
  images: Generated<string[]>;
  limit: number | null;
  price: number | null;
  locationId: number;
  creatorId: string;
  groupId: number | null;
};
export type Group = {
  id: Generated<number>;
  name: string;
  description: string;
  isPrivate: boolean;
  color1: Color;
  color2: Color;
  createdAt: Generated<Timestamp>;
  creatorId: string;
};
export type joinedGroups = {
  A: number;
  B: string;
};
export type JoinRequest = {
  createdAt: Generated<Timestamp>;
  groupId: number;
  userId: string;
};
export type Location = {
  id: Generated<number>;
  address: string;
  latitude: number;
  longitude: number;
};
export type Message = {
  id: Generated<number>;
  text: string;
  postedAt: Generated<Timestamp>;
  userId: string;
  groupId: number;
};
export type participatedEvents = {
  A: string;
  B: number;
};
export type Rating = {
  id: Generated<number>;
  stars: number;
  eventId: number;
  userId: string;
};
export type Session = {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Timestamp;
};
export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified: Timestamp | null;
  image: string;
  introduction: Generated<string>;
  themeColor: Generated<Color>;
  locationId: number | null;
};
export type VerificationToken = {
  identifier: string;
  token: string;
  expires: Timestamp;
};
export type DB = {
  _joinedGroups: joinedGroups;
  _participatedEvents: participatedEvents;
  Account: Account;
  Comment: Comment;
  Event: Event;
  Group: Group;
  JoinRequest: JoinRequest;
  Location: Location;
  Message: Message;
  Rating: Rating;
  Session: Session;
  User: User;
  VerificationToken: VerificationToken;
};
