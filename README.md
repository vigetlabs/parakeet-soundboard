# Intern Project 2025: Soundboard Extension + Web App

## Structure

- `api/` - Rails API backend
- `extension/` - Chrome extension (injects + plays sounds)
- `ui/` - React TypeScript frontend for Website

## Development

### Prerequisites

- Ruby 3.4.4 (asdf)
- Node.js
- Docker

### Set up

```bash
cd api && bundle install
cd ui && pnpm install
cd extension && pnpm install
```

### Environment Variables

- There should be environment variables at the top of each repository (`api/.env`, `ui/.env`, `services/.env` and `extension/.env`)
- There are `.env.example` files in each of the directories to copy. For `api/.env`, contents are in 1Password.

### Set up

#### Pre-commit hooks
Check if you have the [pre-commit package](https://pre-commit.com/) installed on your machine with `pre-commit --version`. If the package is not installed, run the following commands:
```bash
brew install pre-commit
pre-commit --version
```

Once the package is installed, install the `.pre-commit-config.yaml` hook into the `.git/hooks` directory by running `pre-commit install`

#### API
To set up the API and the database, first ensure you have Docker installed on your machine by referring to the following documentation depending on operating system:
- [Install Docker on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) 
- [Install Docker Desktop on Mac](https://docs.docker.com/desktop/setup/install/mac-install/) 
- [Install Docker Desktop on Windows](https://docs.docker.com/desktop/setup/install/windows-install/) 

Once Docker is installed run the following Makefile commands to set up and start the local development environment:
```bash
make dev-build
make start-api
```

#### UI & Extension
```bash
cd ui && pnpm run dev
cd extension && pnpm run dev
```

### Load extension

- Go to `chrome://extensions/`
- Enable developer mode in the top right
- Click Load unpacked in the top left
- Choose the folder that `pnpm run dev` told you to (likely `.output/chrome-mv3-dev`)

### Build extension (production)

- Make sure to update the version in `wxt.config.ts`, roughly following Major.Minor.Patch. The newly uploaded package must be a higher version than the last.
- Run `pnpm run build -- --mode production`
- This creates the extension with the `.env.production` variables - connecting it to the production website and api.
- Load unpacked or upload to Chrome Web Store (folder is likely `.output/chrome-mv3`)

### Environments

Staging: https://staging.parakeet.vigetx.com

Production: https://parakeet.vigetx.com

### Server

Direct server access is available over SSH:

##### Connect to the server (requires your SSH public key to be on the server)

```bash
ssh deploy@3.218.132.243
```
