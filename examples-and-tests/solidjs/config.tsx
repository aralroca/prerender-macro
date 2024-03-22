import { renderToString } from "solid-js/web";

export const prerenderConfig = {
  render: async (Component: any, props: any) => {
    return renderToString(() => <Component {...props} />);
  },
  postRender: (htmlString: string) => <div innerHTML={htmlString} />,
};
