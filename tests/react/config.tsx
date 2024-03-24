import { renderToString } from "react-dom/server";
import type { PrerenderConfig } from "prerender-macro";

export const prerenderConfig = {
  render: async (Component: any, props: any) => {
    return renderToString(<Component {...props} />);
  },
  postRender: (htmlString: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
} satisfies PrerenderConfig;
