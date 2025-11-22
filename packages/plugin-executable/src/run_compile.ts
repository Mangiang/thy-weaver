import {
  colorizeEmiter,
  colorizeLabel,
  getTweego,
  loadConfig,
  moveFiles,
  runRolldownn,
} from "@thy-weaver/core/plugin_helpers";
import { resolve } from "node:path";
import ora from "ora";
import pico from "picocolors";
import { runBunCompilation } from "./compile_commands.ts";
import { PluginExecutableOptions } from "./index.ts";

const runTweego = async () => {
  const tweego = await getTweego("string");

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

export const runCompile = async (options: PluginExecutableOptions) => {
  const {
    bundler: { filesystem },
  } = await loadConfig();

  console.log(
    `\n${pico.bgMagenta(pico.bold(" ThyWeaver - Running in compile mode "))}\n`,
  );

  const startStamp = Date.now();

  await runRolldownn();
  const result = await runTweego();
  if (result) {
    await Bun.write(resolve(filesystem!.stagingDir!, "index.html"), result!);
  } else {
    return;
  }
  await moveFiles();
  await runBunCompilation(options);

  return new Promise((resolve) => {
    console.log(
      `\n${pico.bgGreen(
        pico.bold(` Compilation finished in ${Date.now() - startStamp}ms `),
      )}ㅤ\n`,
    );

    return resolve;
  });
};
