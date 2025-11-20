import type { Command } from "commander";
import type { Plugin, PluginContext } from "./types.ts";

export const createPluginManager = (plugins: Plugin[], config: any) => {
  const context: PluginContext = {
    config,
  };

  const runParallel = async (hookName: keyof Plugin, ...args: any[]) => {
    const promises = plugins.map((plugin) => {
      const hook = plugin[hookName];

      if (typeof hook === "function") {
        //@ts-ignore
        return hook(...args);
      }
    });
    await Promise.all(promises);
  };

  const runSequential = async <T>(
    hookName: keyof Plugin,
    initialValue: T,
    ...args: any[]
  ): Promise<T> => {
    let value = initialValue;
    for (const plugin of plugins) {
      const hook = plugin[hookName];
      if (typeof hook === "function") {
        //@ts-ignore
        const result = await hook(value, ...args);

        if (result != null) {
          value = result;
        }
      }
    }

    return value;
  };

  const registerCommands = async (program: Command) => {
    await runParallel("configureCli", program);
  };

  return {
    context,
    runParallel,
    runSequential,
    registerCommands,
  };
};
