import {EventEmitter} from "events";
import {env} from "../env.js";

// In a real app, you'd probably use Redis or something TODO

const globalForEmitter = globalThis as unknown as { emitter: EventEmitter };

export const emitter = globalForEmitter.emitter || new EventEmitter();

if (env.NODE_ENV !== "production") globalForEmitter.emitter = emitter;