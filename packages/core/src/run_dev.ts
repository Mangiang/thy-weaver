import type { tweenode } from "tweenode";
import { loadConfig } from "./config/config_handler.ts";
import {
  colorizeEmiter,
  colorizeLabel,
  resolveToProjectRoot,
  updateState,
} from "./utils.ts";
import ora from "ora";
import pico from "picocolors";
import { getTweego, runRolldownn } from "./build_commands.ts";
import { watch } from "chokidar";
import { startServer } from "./dev_server/main.ts";
import { broadcast } from "./dev_server/streams.ts";

let tweego: Awaited<ReturnType<typeof tweenode>> | undefined = undefined;

const runTweego = async () => {
  tweego = await getTweego("string");

  const spinner = ora({
    prefixText: colorizeEmiter("TWEENODE"),
  });
  let result: string | undefined;
  spinner.start("Compiling story...");
  const startStamp = Date.now();
  try {
    result = await tweego.process();

    spinner.succeed(
      `Story compiled in ${pico.yellow(`${Date.now() - startStamp}ms`)}`,
    );
  } catch (error) {
    spinner.fail(
      ` ${colorizeLabel("ERROR")} Failed to compile story:\n${error}\n`,
    );
  }

  return result;
};

const devBuilder = async (): Promise<string | undefined> => {
  const startStamp = Date.now();

  await runRolldownn();
  const html = await runTweego();

  return new Promise((resolve) => {
    console.log(
      `\n${pico.bgGreen(
        pico.bold(` Build finished in ${Date.now() - startStamp}ms `),
      )}ㅤ\n`,
    );

    return resolve(html);
  });
};

export const runDev = async () => {
  const { bundler } = await loadConfig();

  console.log(
    `\n${pico.bgMagenta(pico.bold(" ThyWeaver - Running in dev mode "))}ㅤ\n`,
  );

  devBuilder().then(async (firstResult) => {
    if (firstResult) {
      updateState(firstResult);
    }

    const server = await startServer();

    console.log(pico.yellow(pico.bold("Waiting for file changes...")));
    console.log(
      `${pico.yellow(
        pico.bold(
          `Dev Server available at ${pico.cyan(`http://localhost:${server.options.port}/`)}`,
        ),
      )}\n`,
    );

    watch(resolveToProjectRoot("src"), {
      interval: bundler.watcherDelay,
      ignoreInitial: true,
      awaitWriteFinish: {
        pollInterval: 50,
      },
    }).on("all", async () => {
      process.stdout.write("\x1Bc");
      console.log(
        `\n${pico.bgMagenta(pico.bold(" ThyWeaver - Running in dev mode "))}ㅤ\n`,
      );

      const result = await devBuilder();
      if (result) {
        updateState(result);
        await broadcast("update");
      }

      console.log(pico.yellow(pico.bold("Waiting for file changes...")));
      console.log(
        `${pico.yellow(
          pico.bold(
            `Dev Server available at ${pico.cyan(`http://localhost:${server.options.port}/`)}`,
          ),
        )}\n`,
      );
    });
  });
};

if (tweego !== undefined) {
  process.on("SIGTERM", () => {
    //@ts-ignore
    tweego.kill();
    process.exit();
  });

  process.on("SIGINT", () => {
    //@ts-ignore
    tweego.kill();
    process.exit();
  });
}
