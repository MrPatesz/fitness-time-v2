import {OrderBy} from "../components/event/FilterEventsComponent";
import {CreateCommentType} from "../models/Comment";
import {CreateEventType} from "../models/event/Event";
import {CreateGroupType} from "../models/group/Group";
import {CreateLocationType} from "../models/Location";
import {EventFilters} from "../pages";
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
  location: defaultCreateLocation
});

export const defaultEventFilters: EventFilters = {
  searchTerm: "",
  orderBy: OrderBy.DATE,
  ascending: false,
  tags: [],
};
