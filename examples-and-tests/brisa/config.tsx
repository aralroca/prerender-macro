import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";

export const prerenderConfig = {
  render: async (Component: any, props: any) =>
    dangerHTML(await renderToString(<Component {...props} />)),
};
