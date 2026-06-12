# Parakeet Soundboard — Chrome Extension

Make meetings brighter with Parakeet! A Chrome extension that injects and plays
sounds into Google Meet calls.

Built with [WXT](https://wxt.dev/) + React + TypeScript.

## Development

### Prerequisites

- Node.js
- [pnpm](https://pnpm.io/)

### Set up

```bash
yarn install
```

### Environment Variables

- Copy `.env.example` to `.env` and adjust as needed.
- `.env` points the extension at a local API/website; `.env.production` points it
  at the hosted production API/website (used by `--mode production` builds).

### Run (development)

```bash
yarn dev
```

### Load the extension

- Go to `chrome://extensions/`
- Enable developer mode in the top right
- Click **Load unpacked** in the top left
- Choose the folder that `yarn dev` told you to (likely `.output/chrome-mv3-dev`)

### Build (production)

- Update the version in `wxt.config.ts`, roughly following Major.Minor.Patch. A
  newly uploaded package must have a higher version than the last.
- Run `yarn build --mode production`
- This builds the extension with the `.env.production` variables — connecting it
  to the production website and API.
- Load unpacked or upload to the Chrome Web Store (folder is likely `.output/chrome-mv3`)

### Environments

- Staging: https://staging.parakeet.vigetx.com
- Production: https://parakeet.vigetx.com
