import { dirname, join } from "node:path";
import { Hono } from "hono";

import index from "./index.html" with { type: "text" };
import { serveStatic } from "hono/bun";

const CWD = dirname(process.execPath);
const MEDIA_FOLDER = join(CWD, "/media");

console.log("[ WORKER ] Hello world");
console.log("\tCWD: " + CWD);
console.log("\tMedia Folder: " + MEDIA_FOLDER);

console.log("\nEmbedded files: ");
Bun.embeddedFiles.forEach((file) => {
  console.log(file);
});
console.log("\n");

const app = new Hono();

//@ts-expect-error
app.get("/", (c) => c.html(index));

app.get(
  "/media/*",
  serveStatic({
    root: MEDIA_FOLDER,
    onNotFound: (path, c) => {
      console.log(`[ WORKER ] ${path} is not found, you access ${c.req.path}`);
    },
    rewriteRequestPath: (path) => path.replace(/^\/media/, ""),
  }),
);

const server = Bun.serve({
  fetch: app.fetch,
});

console.log(`[ WORKER ] Server running on ${server.url.href}`);
