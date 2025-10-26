import { tweenode } from "tweenode";
import { loadConfig } from "./config/config_handler.ts";
import {
  colorizeEmiter,
  colorizeLabel,
  fancyLogFormater,
  resolveToProjectRoot,
} from "./utils.ts";
import ora from "ora";
import pico from "picocolors";
import { moveFiles, runRolldownn } from "./build_commands.ts";
import { runBunCompilation } from "./compile_commands.ts";

const { bundler } = await loadConfig();
const { filesystem } = bundler;

const tweego = await tweenode({
  build: {
    input: {
      storyDir: resolveToProjectRoot(filesystem!.projectFiles!.storyDir!),
      scripts: filesystem!.stagingDir + "/app.bundle.js",
      styles: filesystem!.stagingDir + "/app.bundle.css",
      htmlHead: resolveToProjectRoot(filesystem!.projectFiles!.htmlHead!),
      modules: [
        filesystem!.stagingDir + "/vendor.bundle.css",
        filesystem!.stagingDir + "/vendor.bundle.js",
      ],
    },
    output: {
      mode: "file",
      fileName: resolveToProjectRoot(filesystem!.dist + "/index.html"),
    },
  },
  debug: {
    writeToLog: true,
  },
});

const runTweego = async () => {
  const spinner = ora({
    prefixText: colorizeEmiter("TWEENODE"),
  });

  spinner.start("Compiling story...");
  const startStamp = Date.now();
  try {
    await tweego.process();

    spinner.succeed(
      `Story compiled in ${pico.yellow(`${Date.now() - startStamp}ms`)}`,
    );
  } catch (error) {
    spinner.fail(
      ` ${colorizeLabel("ERROR")} Failed to compile story:\n${error}\n`,
    );
  }
};

export const runBuild = async () => {
  console.log(
    `\n${pico.bgMagenta(pico.bold(" ThyWeaver - Running in build mode "))}\n`,
  );

  const startStamp = Date.now();

  await runRolldownn();
  await moveFiles();
  await runTweego();

  return new Promise((resolve) => {
    console.log(
      `\n${pico.bgGreen(
        pico.bold(` Build finished in ${Date.now() - startStamp}ms `),
      )}ㅤ\n`,
    );

    return resolve;
  });
};

export const runCompile = async () => {
  console.log(
    `\n${pico.bgMagenta(pico.bold(" ThyWeaver - Running in compile mode "))}\n`,
  );
  const spinner = ora({
    prefixText: colorizeEmiter("BUNDLER"),
  });
  spinner.start("Compiling executable ...");

  const startStamp = Date.now();

  if (typeof Bun === 'undefined') {
    spinner.fail(
      ` ${colorizeLabel("ERROR")} Cannot compile without Bun. Please make sure Bun is accessible and run \`bun --bun run compile\`.`,
    );
    return;
  }

  try {
    await runRolldownn();
    await moveFiles();
    await runTweego();

    await runBunCompilation();
  } catch (error) {
    spinner.fail(
      ` ${colorizeLabel("ERROR")} Failed to compile executable:\n${error}\n`,
    );
  }

  return new Promise((resolve) => {
    spinner.succeed(
      `Story compiled in ${pico.yellow(`${Date.now() - startStamp}ms`)}`,
    );
    console.log(
      `\n${pico.bgGreen(
        pico.bold(` Compilation finished in ${Date.now() - startStamp}ms `),
      )}ㅤ\n`,
    );

    return resolve;
  });
}
