import { defineCommand, runMain } from "citty"

const main = defineCommand({
  meta: {
    name: "pkg-placeholder",
    description: "_description_",
  },
})

void runMain(main)
