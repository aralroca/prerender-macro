import { renderToString } from "react-dom/server";

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) => {
    return renderToString(<Component {...props} />);
  },
  injectToJSX: (htmlString: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
};
