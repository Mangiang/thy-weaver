import type { createEventStream } from "h3";

export type EventStream = ReturnType<typeof createEventStream>;
const clients = new Set<EventStream>();

export const addStream = (stream: EventStream) => {
  clients.add(stream);
};

export const removeStream = (stream: EventStream) => {
  clients.delete(stream);
};

export const broadcast = async (data: string) => {
  const promises: Promise<any>[] = [];

  for (const stream of clients) {
    promises.push(stream.push(data));
  }

  Promise.all(promises);
};
