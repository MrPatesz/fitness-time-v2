import {createUploadthing, type FileRouter} from 'uploadthing/next-legacy';
import {getServerAuthSession} from './auth';
import {prisma} from './db';
import {pusher} from './pusher';
import {InvalidateEvent, PusherChannel} from '../utils/enums';
import {UTApi} from 'uploadthing/server';
import {z} from 'zod';
import {ImageSchema} from '../models/Utils';

const f = createUploadthing();
const utapi = new UTApi();

export const ourFileRouter = {
  updateProfileImage: f({image: {maxFileSize: '1MB'}})
    .input(z.object({
      previousImage: ImageSchema,
    }))
    .middleware(async ({req, res, input}) => {
      // This code runs on your server before upload
      const session = await getServerAuthSession({req, res});

      if (!session?.user) throw new Error('Unauthorized');

      return {userId: session.user.id, previousImage: input.previousImage};
    })
    .onUploadComplete(async ({file, metadata: {userId, previousImage}}) => {
      // This code runs on your server after upload
      await prisma.user.update({
        where: {id: userId},
        data: {
          image: file.url,
        },
      });

      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetById, userId);
      await pusher.trigger(PusherChannel.INVALIDATE, InvalidateEvent.UserGetPaginatedUsers, null);

      if (previousImage) {
        const key = previousImage.split('/').at(-1);
        if (key) {
          await utapi.deleteFiles(key);
        }
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
