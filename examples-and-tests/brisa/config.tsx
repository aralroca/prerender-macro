import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) =>
    renderToString(<Component {...props} />),
  injectToJSX: dangerHTML,
};
