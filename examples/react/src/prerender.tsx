import { type Config } from "prerender-macro";
import { renderToString } from "react-dom/server";

export const prerenderConfig = {
  render: async (Component, props) => {
    return renderToString(<Component {...props} />);
  },
  postRender: (htmlString) => {
    return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
  },
} satisfies Config;
