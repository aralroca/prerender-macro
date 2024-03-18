import type { BunPlugin } from "bun";

type PrerenderPluginParams = {
  renderToStringPath: string;
  renderToStringModuleName: string;
  injectStringIntoJSXPath: string;
  injectStringIntoJSXModuleName: string;
};

const filter = new RegExp(`*.(ts|js)x$`);
const defaultConfig: PrerenderPluginParams = {
  renderToStringPath: "brisa/server",
  renderToStringModuleName: "renderToString",
  injectStringIntoJSXPath: "brisa",
  injectStringIntoJSXModuleName: "dangerHTML",
};

export default function prerenderPlugin({
  renderToStringPath = defaultConfig.renderToStringPath,
  renderToStringModuleName = defaultConfig.renderToStringModuleName,
  injectStringIntoJSXPath = defaultConfig.injectStringIntoJSXPath,
  injectStringIntoJSXModuleName = defaultConfig.injectStringIntoJSXModuleName,
}: PrerenderPluginParams = defaultConfig) {
  return {
    name: "prerender-plugin",
    setup(build) {
      build.onLoad({ filter }, async ({ path, loader }) => ({
        contents: prerenderPluginTransformation(await Bun.file(path).text()),
        loader,
      }));
    },
  } satisfies BunPlugin;
}

/**
 *
 * import { prerender } from "@/utils/prerender" with { type: 'macro' };
 *
 * {prerender('@/components/static-component', 'default')}
 *
 * import { dangerHTML } from 'brisa';
 * import { renderToReadableStream } from 'brisa/server';
 *
 */
export function prerenderPluginTransformation(code: string) {
  return code;
}
