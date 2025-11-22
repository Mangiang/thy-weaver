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
import { PluginExecutableOptions } from ".";
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

export const runBunCompilation = async (options: PluginExecutableOptions) => {
  const startStamp = Date.now();
  const {
    bundler: { filesystem },
    devServer,
  } = await loadConfig();

  const spinner = ora({
    prefixText: colorizeEmiter("PLUGIN"),
  });

  const packageData = JSON.parse(await Bun.file("./package.json").text());

  spinner.start("Copying server files");
  await cp(serverMainPath, `${filesystem!.stagingDir!}/main.ts`);
  await cp(serverWorkerPath, `${filesystem!.stagingDir!}/worker.ts`);
  await Bun.write(
    `${filesystem!.stagingDir!}/config.json`,
    JSON.stringify({
      title: options.windowTitle ? options.windowTitle : packageData.name,
      port: options.server?.port ? options.server?.port : devServer?.port,
      mediaPath: "/media",
    }),
  );
  spinner.succeed("Server files copied!");

  spinner.start("Compiling executable");
  try {
    await Bun.build({
      compile: {
        outfile: `${packageData.name}_${packageData.version.replaceAll(".", "-")}`,
        windows:
          process.platform === "win32"
            ? {
                hideConsole: options.windowsSpecific?.hideConsole,
                title: options.windowTitle
                  ? options.windowTitle
                  : packageData.name,
                version: packageData.version,
              }
            : undefined,
      },

      entrypoints: [
        filesystem!.stagingDir! + "/main.ts",
        filesystem!.stagingDir! + "/worker.ts",
      ],
      outdir: filesystem!.dist!,
      minify: true,
      sourcemap: true,
    });
    spinner.succeed(
      `Executable compiled in ${pico.yellow(`${Date.now() - startStamp}ms`)}`,
    );
  } catch (error) {
    spinner.fail(
      ` ${colorizeLabel("ERROR")} Failed to compile executable:\n${error}\n`,
    );
  }
};
