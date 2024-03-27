import { createElement } from "@kitajs/html";
import prerenderMacroPlugin, { type PrerenderConfig } from "prerender-macro";

export const prerenderConfig = {
  render: createElement,
} satisfies PrerenderConfig;

export const plugin = prerenderMacroPlugin({
  prerenderConfigPath: import.meta.url,
});
