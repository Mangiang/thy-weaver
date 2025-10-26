import pico from "picocolors";
import { loadConfig } from "./config/config_handler.ts";

const { bundler } = await loadConfig();
const { filesystem } = bundler;

export const runBunCompilation = async () => {
  await Bun.write(filesystem!.dist + "index.ts", `
    import { Webview } from "webview-bun";
    const worker = new Worker("./worker.ts");
    worker.addEventListener("close", () => webview.destroy());

    const webview = new Webview();
    webview.navigate("http://localhost:3000/");
    webview.run();

    worker.terminate();
  `);

  await Bun.write(filesystem!.dist + "worker.ts", `
    import { serve } from 'bun';
    import index from './index.html';
    import { dirname } from 'path';

    const BASE_MEDIA_PATH = "/media/";
    const EXE_DIR = dirname(process.execPath);

    const server = serve({
      routes: {
        '/': index,
      },
      fetch(req) {
        const filepath = new URL(req.url).pathname;
        if (req.method === 'GET') {
          if (filepath.startsWith('/favicon')) {
            const filePath = \`\${ EXE_DIR }\${ BASE_MEDIA_PATH }favicon.svg\`;
            const file = Bun.file(filePath);
            return new Response(file);
          } else if (filepath.startsWith(BASE_MEDIA_PATH)) {
            const filePath = \`\${ EXE_DIR }\${ new URL(req.url).pathname }\`;
            const file = Bun.file(filePath);
            return new Response(file);
          }
        }

        return new Response('Not Found', { status: 404 });
      },
    });
  `);

  const packageData = JSON.parse(await Bun.file("./package.json").text());
  await Bun.build({
    compile: {
      outfile: packageData.name,
      windows: {
        hideConsole: true
      }
    },
    entrypoints: [filesystem!.dist + "index.ts", filesystem!.dist + "worker.ts"],
    outdir: filesystem!.build,
    minify: true,
    sourcemap: true,
  });
}
