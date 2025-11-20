import { defineConfig } from "tsdown";

export default defineConfig({
  entry: {
    main: "./src/main.ts",
    cli: "./src/cli.ts",
    reload_agent: "./src/dev_server/reload_agent.ts",
    plugin_helpers: "./src/plugin_helpers.ts",
  },
  sourcemap: true,
  dts: true,
});
