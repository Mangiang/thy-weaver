import { colorizeEmiter, colorizeLabel } from "./utils.ts";
import ora from "ora";
import pico from "picocolors";
import { getTweego, moveFiles, runRolldownn } from "./build_commands.ts";

const runTweego = async () => {
  const tweego = await getTweego("file");

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
