# Intern Project 2025: Soundboard Extension + Web App

## Structure

- `api/` - Rails API backend
- `extension/` - Chrome extension (injects + plays sounds)
- `ui/` - React TypeScript frontend for Website

## Development

### Prerequisites

TODO

### Set up

```bash
cd api && bundle install
cd ui && pnpm install
cd extension && pnpm install
```

### Environment Variables

- There should be environment variables at the top of each repository (`api/.env`, `ui/.env`, and `extension/.env`)
- You can create the ui and extension's based on the `.env.example` located in their repositories

### Database

```bash
cd api
bundle exec rails db:create db:migrate
```

TODO: seed database with default sounds

### Run servers

```bash
cd api && bundle exec rails server
cd ui && pnpm run dev
cd extension && pnpm run dev
```

### Load extension

- Go to `chrome://extensions/`
- Enable developer mode in the top right
- Click Load unpacked in the top left
- Choose the folder that `pnpm run dev` told you to
