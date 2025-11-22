import type { Command } from "commander";
import type { ThyWevearOptions } from "../main.ts";

export interface PluginContext {
  config: ThyWevearOptions;
}

export interface Plugin {
  name: string;
  configureCli?: (
    program: Command,
    context: PluginContext,
  ) => void | Promise<void>;
}
export type PluginConstructor<Options = any> = (options?: Options) => Plugin;
