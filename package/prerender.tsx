type PrerenderParams = {
  componentPath: string;
  componentModuleName?: string;
  componentProps?: Record<string, unknown>;
  prerenderConfigPath: string;
};

export async function __prerender__macro({
  componentPath,
  componentModuleName = "default",
  componentProps = {},
  prerenderConfigPath,
}: PrerenderParams) {
  const Component = (await import(componentPath))[componentModuleName];
  const config = (await import(prerenderConfigPath)).prerenderConfig;
  const htmlString = await config.renderComponentToString(
    Component,
    componentProps,
  );

  return config.injectToJSX(htmlString);
}

export const prerender = __prerender__macro;
