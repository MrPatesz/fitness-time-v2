import {CreateCommentType} from "../models/Comment";
import {CreateEventType} from "../models/Event";
import {CreateGroupType} from "../models/Group";
import {CreateLocationType} from "../models/Location";
import dayjs from "./dayjs";

export const googleMapsLibraries: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
  )[] = ["places"];

export const defaultCreateComment: CreateCommentType = {
  message: "",
};

export const defaultCreateGroup: CreateGroupType = {
  name: "",
  description: "",
};

export const defaultCreateLocation: CreateLocationType = {
  address: "",
  latitude: 0,
  longitude: 0,
};

export const getDefaultCreateEvent = (initialInterval?: {
  start: Date;
  end: Date;
}): CreateEventType => ({
  name: "",
  start: initialInterval?.start ?? dayjs(new Date()).add(1, "hours").toDate(),
  end: initialInterval?.end ?? dayjs(new Date()).add(2, "hours").toDate(),
  description: "",
  limit: null,
  price: null,
  location: defaultCreateLocation,
  groupId: null,
});
