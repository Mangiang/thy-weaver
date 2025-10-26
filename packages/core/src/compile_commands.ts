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

    const server = serve({
      routes: {
        '/': index,
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
