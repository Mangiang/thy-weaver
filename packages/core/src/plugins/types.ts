import type { Command } from "commander";

export interface PluginContext {
  config: any;
}

export interface Plugin {
  name: string;
  configureCli?: (program: Command) => void | Promise<void>;
}
export type PluginConstructor<Options = any> = (options?: Options) => Plugin;
