import { render } from "preact-render-to-string";
import { h } from "preact";

export const prerenderConfig = {
  render: async (Component: any, props: any) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: render(<Component {...props} />) }}
      />
    );
  },
};
