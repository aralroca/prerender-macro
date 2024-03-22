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
  const htmlString = await config.render(Component, componentProps);

  const element = config.postRender(htmlString);

  // parse + stringify are used to avoid coercion to Bun's AST for $$typeof Symbol
  return JSON.parse(JSON.stringify(element));
}

export function postRender(element: JSX.Element) {
  element.$$typeof = Symbol.for("react.element");
  return element;
}

export const __prerender__macro = prerender;
