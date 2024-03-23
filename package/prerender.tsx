type PrerenderParams = {
  componentPath: string;
  componentModuleName?: string;
  componentProps?: Record<string, unknown>;
  prerenderConfigPath: string;
};

export async function prerender({
  componentPath,
  componentModuleName = "default",
  componentProps = {},
  prerenderConfigPath,
}: PrerenderParams) {
  const Component = (await import(componentPath))[componentModuleName];
  const config = (await import(prerenderConfigPath)).prerenderConfig;
  return await config.render(Component, componentProps);
}

export const __prerender__macro = prerender;
