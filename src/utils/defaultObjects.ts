import {CreateEventType} from "../models/Event";
import {CreateLocationType} from "../models/Location";
import dayjs from "./dayjs";

export const googleMapsLibraries: (
  | "places"
  | "drawing"
  | "geometry"
  | "localContext"
  | "visualization"
  )[] = ["places"];

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
  equipment: "",
  limit: null,
  price: null,
  location: defaultCreateLocation
});
