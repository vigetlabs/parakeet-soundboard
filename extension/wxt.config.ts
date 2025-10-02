import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  srcDir: "src",
  manifest: {
    name: "Parakeet Soundboard",
    version: "1.1",
    permissions: ["scripting", "activeTab", "storage", "unlimitedStorage"],
    host_permissions: ["https://meet.google.com/*"],
    web_accessible_resources: [
      {
        resources: ["images/*", "svgs/*"],
        matches: ["<all_urls>"],
      },

      {
        resources: ["inject.js"],
        matches: ["https://meet.google.com/*"],
      },
    ],
    key: "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA13fgU4joRpSr2xzzqS7y1XB4EvJquG95jKV2seh5DKMKWPN8ULHON3npeikAVyffGG48nKFAsMml0detH8fxMozfAMeBxeET32ZMoJdspZKYn22AYCIy+RBMRZQKeTlckjI5lrpJ/mS206IkzBtZ3d9LGfL7tkjS/ejV/5yKFyAOBlHLbZOGIcYnOxdgxDszfWEnl/L2qk58ODuM4I/c5gIB+qKs4d0lvUmIkRKgKq5T92c1NLKTIdxybKpaUN8MDT+5wxswCVTE1DdymEbOYr18f7nvCH63wlVNkAwW7ky63XHBo7lypWkQysXQ0PW6YTEYeHnMbjb/P9ax4IG4rwIDAQAB",
  },
  dev: {
    server: {
      port: 3002,
    },
  },
});
