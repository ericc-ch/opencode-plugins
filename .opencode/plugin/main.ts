import { compose } from "../../packages/compose/dist/main"
import { notification } from "../../packages/notification/dist/main"

export const main = compose([notification()])
