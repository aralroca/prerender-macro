import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";

export const prerenderConfig = {
  render: async (Component: any, props: any) =>
    renderToString(<Component {...props} />),
  postRender: dangerHTML,
};
