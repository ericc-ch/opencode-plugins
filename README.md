# opencode-plugins

A collection of plugins for [opencode](https://opencode.ai), providing composable utilities for plugin composition, debugging, and notifications.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/E1E519XS7W)

## Packages

This monorepo contains three opencode plugins:

### `opencode-plugin-compose`

Compose multiple opencode plugins into a single plugin that runs all hooks in sequence.

```ts
import { compose } from "opencode-plugin-compose";

const composedPlugin = compose([pluginA, pluginB, pluginC]);
```

**Features:**

- Sequentially executes all plugin hooks (event, chat.message, chat.params, permission.ask, tool.execute.before/after)
- Maintains hook execution order

---

### `opencode-plugin-inspector`

Real-time web interface for debugging and monitoring plugin hook events.

```ts
import { inspector } from "opencode-plugin-inspector";

const inspectorPlugin = inspector({ port: 6969 }); // port optional, defaults to 6969
```

**Features:**

- Web UI accessible at `http://localhost:6969`
- Built with React and Tailwind CSS

---

### `opencode-plugin-notification`

Desktop notifications for session idle events with customizable commands and timing.

```ts
import { notification } from "opencode-plugin-notification";

const notificationPlugin = notification({
  idleTime: 60000, // 1 minute (default)
  notificationCommand: ["notify-send", "--app-name", "opencode"], // default
  additionalCommands: [["canberra-gtk-play", "-i", "complete"]], // default
  getMessage: async ({ sessionID, client }) => {
    // Custom message logic
    return "Custom notification message";
  },
});
```

**Features:**

- Configurable idle time threshold
- Custom notification commands (defaults to `notify-send`)
- Optional sound commands

## Installation

Install individual packages:

```bash
npm install opencode-plugin-compose
npm install opencode-plugin-inspector
npm install opencode-plugin-notification
```

I would recommend installing as optional dependency

## Development

This project uses [Turborepo](https://turbo.build) for monorepo management and [pnpm](https://pnpm.io) for package management.

### Prerequisites

- Node.js 18+
- pnpm 8+
- Bun (for inspector package)

### Setup

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Start development mode (watches for changes)
pnpm run dev
```

### Working on individual packages

```bash
# Work on a specific package
cd packages/compose
pnpm run dev
```

### Scripts

- `pnpm run build` - Build all packages
- `pnpm run dev` - Start development mode for all packages
- `pnpm run lint` - Lint the codebase
- `pnpm run typecheck` - Run TypeScript type checking

## License

[MIT](./LICENSE)

## Support

If you find this project useful, consider supporting via [Ko-fi](https://ko-fi.com/E1E519XS7W).
