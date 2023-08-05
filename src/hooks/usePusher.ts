import {useEffect} from 'react';
import {InvalidateEvent, PusherChannel} from '../utils/enums';
import {pusherClient} from '../utils/pusher';
import {z} from 'zod';
import {IdSchema} from '../models/Utils';

export interface EventInfo {
  event: InvalidateEvent;
  id?: number | string;
}

export const usePusher = (
  eventInfo: EventInfo | undefined,
  onEvent: () => void,
) => {
  useEffect(() => {
    const handleEvent = (rawData: unknown) => {
      if (eventInfo) {
        const data = IdSchema.or(z.string().min(1)).optional().parse(rawData);
        if (!data || data === eventInfo.id) {
          onEvent();
        }
      }
    };

    if (eventInfo) {
      pusherClient.subscribe(PusherChannel.INVALIDATE);
      pusherClient.bind(eventInfo.event, handleEvent);
    }

    return () => {
      if (eventInfo) {
        pusherClient.unbind(eventInfo.event, handleEvent);
        pusherClient.unsubscribe(PusherChannel.INVALIDATE);
      }
    };
  }, []);
};
