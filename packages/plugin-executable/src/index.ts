import { fancyLogFormater, type Plugin } from "@thy-weaver/core/plugin_helpers";
import { runCompile } from "./run_compile.ts";

export default function compilePlugin(option?: any): Plugin {
  return {
    name: "executable-maker",
    configureCli(program) {
      const buildCmd = program.commands.find((cmd) => cmd.name() === "build");

      if (buildCmd) {
        buildCmd
          .command("compile")
          .description(
            "Compiles and creates a standalone executable for the game",
          )
          .action(async () => {
            console.log(option);
            if (process.versions.bun) {
              await runCompile();
            } else {
              console.log(
                fancyLogFormater("BUNDLER", "ERROR", {
                  message: "Bun is required to make executables",
                }),
              );
            }
          });
      }
    },
  };
}
