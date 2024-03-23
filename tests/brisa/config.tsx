import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";
import type { Config } from "prerender-macro";

export const prerenderConfig = {
  render: async (Component, props) =>
    dangerHTML(await renderToString(<Component {...props} />)),
} satisfies Config;
