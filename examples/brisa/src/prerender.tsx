import { type Config } from "prerender-macro";
import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";

export const prerenderConfig = {
  render: async (Component, props) =>
    dangerHTML(await renderToString(<Component {...props} />)),
} satisfies Config;
