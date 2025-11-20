import { fancyLogFormater, type Plugin } from "@thy-weaver/core/plugin_helpers";
import { Command } from "commander";

const manifest = (): Plugin => {
  return {
    name: "executable-maker",
    command: new Command("buildExec")
      .description("Compiles and creates a standalone executable for the game")
      .action(() => {
        if (process.versions.bun) {
          console.log("Hello");
        } else {
          console.log(
            fancyLogFormater("BUNDLER", "ERROR", {
              message: "Bun is required to make executables",
            }),
          );
        }
      }),
  };
};

export default manifest;
