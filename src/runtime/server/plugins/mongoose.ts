import { defineNitroPlugin } from "#imports";

import { CONNECT_WITH_RETRY } from "../utils";

export default defineNitroPlugin(async () => {
  await CONNECT_WITH_RETRY();
});
