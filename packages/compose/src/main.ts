import type { Plugin, PluginInput, Hooks } from "@opencode-ai/plugin"

export const compose = (plugins: Array<Plugin>): Plugin => {
  return async (input: PluginInput): Promise<Hooks> => {
    const initializedPlugins = await Promise.all(
      plugins.map(async (plugin) => {
        const result = await plugin(input)
        return result
      }),
    )

    return {
      event: async ({ event }) => {
        for (const plugin of initializedPlugins) {
          if (plugin.event) {
            await plugin.event({ event })
          }
        }
      },

      "chat.message": async (input, output) => {
        for (const plugin of initializedPlugins) {
          if (plugin["chat.message"]) {
            await plugin["chat.message"](input, output)
          }
        }
      },

      "chat.params": async (input, output) => {
        for (const plugin of initializedPlugins) {
          if (plugin["chat.params"]) {
            await plugin["chat.params"](input, output)
          }
        }
      },

      "permission.ask": async (input, output) => {
        for (const plugin of initializedPlugins) {
          if (plugin["permission.ask"]) {
            await plugin["permission.ask"](input, output)
          }
        }
      },

      "tool.execute.before": async (input, output) => {
        for (const plugin of initializedPlugins) {
          if (plugin["tool.execute.before"]) {
            await plugin["tool.execute.before"](input, output)
          }
        }
      },

      "tool.execute.after": async (input, output) => {
        for (const plugin of initializedPlugins) {
          if (plugin["tool.execute.after"]) {
            await plugin["tool.execute.after"](input, output)
          }
        }
      },
    }
  }
}

export default compose
