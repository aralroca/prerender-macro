type PrerenderParams = {
  componentPath: string;
  componentModuleName?: string;
  componentProps?: Record<string, unknown>;
  renderToStringPath: string;
  renderToStringModuleName: string;
  injectStringIntoJSXPath: string;
  injectStringIntoJSXModuleName: string;
};

export async function prerender({
  componentPath,
  componentModuleName = "default",
  componentProps = {},
  renderToStringPath = "brisa/server",
  renderToStringModuleName = "renderToString",
  injectStringIntoJSXPath = "brisa",
  injectStringIntoJSXModuleName = "dangerHTML",
}: PrerenderParams) {
  const Component = (await import(componentPath))[componentModuleName];
  const renderToString = (await import(renderToStringPath))[
    renderToStringModuleName
  ];
  const injectStringIntoJSX = (await import(injectStringIntoJSXPath))[
    injectStringIntoJSXModuleName
  ];

  return injectStringIntoJSX(renderToString(<Component {...componentProps} />));
}
