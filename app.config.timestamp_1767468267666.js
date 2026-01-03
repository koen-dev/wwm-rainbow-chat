// app.config.ts
import { defineConfig } from "@tanstack/start/config";
var app_config_default = defineConfig({
  server: {
    preset: "static",
    prerender: {
      routes: ["/"],
      crawlLinks: true
    }
  },
  vite: {
    base: process.env.BASE_PATH || "/"
  }
});
export {
  app_config_default as default
};
