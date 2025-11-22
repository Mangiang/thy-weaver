import { Webview } from "webview-bun";
import config from "./config.json";

const worker = new Worker("./worker.ts");

const webview = new Webview();
webview.title = config.title;
webview.navigate(`http://localhost:${config.port}/`);
webview.run();

worker.addEventListener("close", () => webview.destroy());
worker.terminate();
