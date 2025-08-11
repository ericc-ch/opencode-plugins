import os from "node:os"
import { defineConfig } from "taze"

export default defineConfig({
  concurrency: os.availableParallelism(),
  force: true,
  write: true,
  recursive: true,
})
