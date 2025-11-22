import { fancyLogFormater, type Plugin } from "@thy-weaver/core/plugin_helpers";
import { runCompile } from "./run_compile.ts";
import type { Build } from "bun";

export type Target = Build.Target;

export interface PluginExecutableOptions {
  windowTitle?: string;
  windowsSpecific?: {
    hideConsole?: boolean;
  };
  server?: {
    port: number;
  };
}

export default function compilePlugin(
  options: PluginExecutableOptions = {},
): Plugin {
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
            if (process.versions.bun) {
              await runCompile(options);
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
