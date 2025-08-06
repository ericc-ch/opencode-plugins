import type { Plugin } from "@opencode-ai/plugin"

import child from "node:child_process"

type Client = Parameters<Plugin>[0]["client"]

export interface NotificationPluginOptions {
  /**
   * Idle time in milliseconds. Defaults to 1 minute
   * @default 1000 * 60
   */
  idleTime?: number
  notificationCommand?: Array<string>
  getMessage?: (params: {
    sessionID: string
    client: Client
  }) => Promise<string> | string
}

const DEFAULT_IDLE_TIME: NotificationPluginOptions["idleTime"] = 1000 * 60
const DEFAULT_NOTIFICATION_COMMAND: NotificationPluginOptions["notificationCommand"] =
  [
    "notify-send",
    "--app-name",
    "opencode",
    "$MESSAGE",
    "&&",
    "canberra-gtk-play",
    "-i",
    "complete",
  ]

const defaultGetMessage: NotificationPluginOptions["getMessage"] = async ({
  sessionID,
  client,
}) => {
  let message = "Task completed"

  const sessions = (await client.session.list()).data
  const session = sessions?.find((session) => session.id === sessionID)

  if (session) {
    message = session.title
  }

  return message
}

let lastUserMessage = Date.now()
export const notification = (options: NotificationPluginOptions): Plugin => {
  const idleTime = options.idleTime ?? DEFAULT_IDLE_TIME
  const notificationCommand =
    options.notificationCommand ?? DEFAULT_NOTIFICATION_COMMAND
  const getMessage = options.getMessage ?? defaultGetMessage

  return ({ client }) => {
    // Function scope is also executed once, during init

    return {
      event: async ({ event }) => {
        if (
          event.type === "message.updated"
          && event.properties.info.role === "user"
        ) {
          lastUserMessage = Date.now()
          await client.app.log({
            body: {
              level: "info",
              message: `Set lastUserMessage to ${lastUserMessage}`,
              service: "notification",
            },
          })
        }

        if (event.type === "session.idle") {
          const timeSince = Date.now() - lastUserMessage
          if (timeSince < idleTime) {
            await client.app.log({
              body: {
                level: "info",
                message: `Skipping notification, time since last user message: ${timeSince}`,
                service: "notification",
              },
            })
            return
          }

          const message = await getMessage({
            sessionID: event.properties.sessionID,
            client,
          })

          await client.app.log({
            body: {
              level: "info",
              message,
              service: "notification",
            },
          })

          child.spawnSync(notificationCommand.join(" "), {
            env: {
              MESSAGE: message,
            },
          })
        }
      },
    }
  }
}

export default notification
