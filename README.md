# intern-project-2025

# Soundboard Extension + Web App

## Structure

- `api/` - Rails API backend
- `web-ui/` - React TypeScript frontend
- `extension/` - Chrome extension (injects + plays sounds)

## Development

### Prerequisites
TODO

### Set up
```bash
cd api && bundle install
cd web-ui && pnpm install
```

### Database
TODO

### Run servers
```bash
cd api && bundle exec rails server
cd web-ui && pnpm start
```

### Load extension
    - Go to `chrome://extensions`
    - Load unpacked: `./extension` folder
