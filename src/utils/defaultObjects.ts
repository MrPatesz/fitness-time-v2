import {CreateEventType} from "../models/Event";
import {CreateLocationType} from "../models/Location";

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
  start: initialInterval ?
    initialInterval.start :
    new Date(new Date().setHours(new Date().getHours() + 1)),
  end: initialInterval ?
    initialInterval.end :
    new Date(new Date().setHours(new Date().getHours() + 2)),
  description: "",
  equipment: "",
  limit: null,
  price: null,
  location: defaultCreateLocation
});
