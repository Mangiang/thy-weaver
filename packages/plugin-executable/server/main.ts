import { Webview } from "webview-bun";

const worker = new Worker("./worker.ts");

const webview = new Webview();
webview.navigate("http://localhost:3000/");
webview.run();

worker.addEventListener("close", () => webview.destroy());
worker.terminate();
