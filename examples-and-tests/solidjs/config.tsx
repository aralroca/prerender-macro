import { renderToString } from "solid-js/web";

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) => {
    return renderToString(() => <Component {...props} />);
  },
  injectToJSX: (htmlString: string) => <div innerHTML={htmlString} />,
};
