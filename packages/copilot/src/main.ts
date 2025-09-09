import type { Plugin } from "@opencode-ai/plugin"

interface ForceAgentOptions {
  selfMessage?: (originalMessage: string) => string
}

const DEFAULT_SELF_MESSAGE: ForceAgentOptions["selfMessage"] = (original) =>
  `<user_query>${original}</user_query>`

export const forceAgent = (options: ForceAgentOptions = {}): Plugin => {
  const selfMessage = options.selfMessage ?? DEFAULT_SELF_MESSAGE

  return ({ client }) => {
    return {
      async "chat.message"(_, output) {
        const session = (await client.session.list()).data?.at(0)
        if (!session) {
          await client.app.log({
            body: {
              level: "error",
              message: "First session is not found",
              service: "copilot-force-agent",
            },
          })
          throw new Error("First session is not found")
        }

        const messages = (
          await client.session.messages({
            path: {
              id: session.id,
            },
          })
        ).data

        if (!messages) {
          await client.app.log({
            body: {
              level: "error",
              message: "Session messages are not found",
              service: "copilot-force-agent",
            },
          })
          throw new Error("Session messages are not found")
        }

        if (messages.length > 0) {
          await client.app.log({
            body: {
              level: "info",
              message: "Not first message, skipping",
              service: "copilot-force-agent",
            },
          })
          return
        }

        const textParts = output.parts.filter((part) => part.type === "text")
        const nonTextParts = output.parts.filter((part) => part.type !== "text")

        const newPart = textParts.at(0)
        if (!newPart) {
          await client.app.log({
            body: {
              level: "error",
              message: "Text part is not found",
              service: "copilot-force-agent",
            },
          })
          throw new Error("Text part is not found")
        }

        newPart.text = selfMessage(
          textParts.map((part) => part.text).join("\n"),
        )

        output.message.role = "assistant"
        output.parts = [newPart, ...nonTextParts]
      },
    }
  }
}
