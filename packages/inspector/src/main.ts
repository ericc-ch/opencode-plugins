import type { Plugin } from "@opencode-ai/plugin"
import type { ReadableStreamController } from "node:stream/web"

import { Hono } from "hono"
import { streamSSE } from "hono/streaming"
import fs from "node:fs"
import path from "node:path"

export interface InspectorPluginOptions {
  /**
   * @default 6969
   */
  port?: number
}

const DEFAULT_PORT = 6969

export const inspector = (options: InspectorPluginOptions = {}): Plugin => {
  const port = options.port ?? DEFAULT_PORT

  return () => {
    const hooksHistory: Array<unknown> = []
    const activeControllers = new Set<ReadableStreamController<unknown>>()

    function broadcast(data: unknown) {
      hooksHistory.push(data)

      for (const controller of activeControllers) {
        controller.enqueue(data)
      }
    }

    const app = new Hono()
      .get("/", (c) => {
        const html = fs.readFileSync(
          path.join(import.meta.dirname, "./assets/inspector-view.html"),
          "utf8",
        )

        return c.text(html, 200, {
          "Content-Type": "text/html",
        })
      })
      .get("/hooks", (c) => {
        return streamSSE(c, async (sse) => {
          const hooksStream = new ReadableStream<unknown>({
            start(controller) {
              activeControllers.add(controller)

              for (const hook of hooksHistory) {
                controller.enqueue(hook)
              }

              sse.onAbort(() => {
                activeControllers.delete(controller)
              })
            },
          })

          const reader = hooksStream.getReader()

          while (true) {
            const { value, done } = await reader.read()
            if (done) break

            await sse.writeSSE({
              data: JSON.stringify(value),
              event: "hook",
            })
          }
        })
      })

    // Ping otherwise bun will close the connection
    const interval = setInterval(() => {
      broadcast({ hook: "ping" })
    }, 5_000)

    const server = Bun.serve({
      fetch: app.fetch,
      port,
    })

    process.on("exit", () => {
      clearInterval(interval)
      void server.stop()
    })

    return {
      event: (input) => {
        broadcast({ hook: "event", input })
      },
      "chat.message": (input, output) => {
        broadcast({ hook: "chat.message", input, output })
      },
      "chat.params": (input, output) => {
        broadcast({ hook: "chat.params", input, output })
      },
      "permission.ask": (input, output) => {
        broadcast({ hook: "permission.ask", input, output })
      },
      "tool.execute.after": (input, output) => {
        broadcast({ hook: "tool.execute.after", input, output })
      },
      "tool.execute.before": (input, output) => {
        broadcast({ hook: "tool.execute.before", input, output })
      },
    }
  }
}
