import { compose } from "../../packages/compose/dist/main"
import { forceAgent } from "../../packages/copilot/dist/main"
import { inspector } from "../../packages/inspector/dist/main"

export const main = compose([forceAgent(), inspector()])
