import { render } from "preact-render-to-string";
import { h } from "preact";
import type { PrerenderConfig } from "prerender-macro";

export const prerenderConfig = {
  render: async (Component, props) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: render(<Component {...props} />) }}
      />
    );
  },
} satisfies PrerenderConfig;
