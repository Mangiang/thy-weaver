import type { Plugin } from "@thy-weaver/core/plugin_helpers";
import { Command } from "commander";

const manifest = (options?: any): Plugin => {
  console.log(options);
  return {
    name: "executable-maker",
    command: new Command("buildExec")
      .description("Compiles and creates a standalone executable for the game")
      .action(() => {
        console.log("Hello");
      }),
  };
};

export default manifest;
