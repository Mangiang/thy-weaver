import {
  colorizeEmiter,
  colorizeLabel,
  loadConfig,
} from "@thy-weaver/core/plugin_helpers";
import { cp } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ora from "ora";
import pico from "picocolors";
const serverMainPath = resolve(
  fileURLToPath(import.meta.url),
  "../..",
  "server/main.ts",
);
const serverWorkerPath = resolve(
  fileURLToPath(import.meta.url),
  "../..",
  "server/worker.ts",
);

export const runBunCompilation = async () => {
  const startStamp = Date.now();
  const {
    bundler: { filesystem },
  } = await loadConfig();

  const spinner = ora({
    prefixText: colorizeEmiter("PLUGIN"),
  });

  spinner.start("Copying server files");
  await cp(serverMainPath, `${filesystem!.stagingDir!}/main.ts`);
  await cp(serverWorkerPath, `${filesystem!.stagingDir!}/worker.ts`);
  spinner.succeed("Server files copied!");

  const packageData = JSON.parse(await Bun.file("./package.json").text());

  spinner.start("Compiling executable");
  await Bun.build({
    compile: {
      outfile: `${packageData.name}_${packageData.version.replaceAll(".", "-")}`,
      windows: { hideConsole: false },
    },
    entrypoints: [
      filesystem!.stagingDir! + "/main.ts",
      filesystem!.stagingDir! + "/worker.ts",
    ],
    outdir: filesystem!.dist!,
    minify: true,
    sourcemap: true,
  }).catch((error) => {
    spinner.fail(
      ` ${colorizeLabel("ERROR")} Failed to compile executable:\n${error}\n`,
    );
    return;
  });
  spinner.succeed(
    `Executable compiled in ${pico.yellow(`${Date.now() - startStamp}ms`)}`,
  );
};
