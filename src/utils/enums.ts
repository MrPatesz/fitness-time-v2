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

export enum EventStatus {
  PLANNED = "PLANNED",
  ARCHIVE = "ARCHIVE",
}

export enum OrderBy {
  NAME = "name",
  DATE = "date",
  LOCATION = "location",
  PRICE = "price",
}

export enum FilterBy {
  FREE = "free",
  LIMITED = "limited",
}

export enum SortGroupByProperty {
  NAME = "name",
  CREATED_AT = "createdAt",
  // MEMBER_COUNT = "memberCount",
}

export enum EventTableDisplayPlace {
  CONTROL_PANEL = "CONTROL_PANEL",
  EVENTS_PAGE = "EVENTS_PAGE",
}

export enum GroupTableDisplayPlace {
  CONTROL_PANEL = "CONTROL_PANEL",
  GROUPS_PAGE = "GROUPS_PAGE",
}

export enum SortDirection {
  ASC = "asc",
  DESC = "desc",
}

export enum SortEventByProperty {
  NAME = "name",
  START = "start",
  PRICE = "price",
  LIMIT = "limit",
}

export enum SortCommentByProperty {
  MESSAGE = "message",
  POSTED_AT = "postedAt",
  EVENT = "event",
}