import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Parakeet Soundboard",
    permissions: [
      "scripting",
      "tabs",
      "activeTab",
      "storage",
      "unlimitedStorage",
    ],
    host_permissions: ["https://meet.google.com/*"],
    web_accessible_resources: [
      {
        resources: ["sounds/*", "images/*", "svgs/*"],
        matches: ["<all_urls>"],
      },

      {
        resources: ["inject.js"],
        matches: ["https://meet.google.com/*"],
      },
    ],
  },
  dev: {
    server: {
      port: 3002,
    },
  },
});
