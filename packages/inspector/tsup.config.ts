import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["src/main.ts"],
  publicDir: "/src/assets",

  format: ["esm"],
  target: "esnext",
  platform: "node",

  dts: true,
  removeNodeProtocol: false,
  sourcemap: true,
  clean: true,
})
