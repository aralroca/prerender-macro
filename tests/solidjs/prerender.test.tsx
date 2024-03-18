import { describe, expect, it } from "bun:test";
import React from "react";
import { prerender } from "prerender-macro/prerender";
import { renderToString } from "solid-js/web";

export default function TestComponent({ name }: { name: string }) {
  return <div>Hello, {name}!</div>;
}

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) => {
    return renderToString(() => <Component {...props} />);
  },
  injectToJSX: (htmlString: string) => <div innerHTML={htmlString} />,
};

describe("Solidjs", () => {
  describe("prerender", () => {
    it("should work", async () => {
      const result = await prerender({
        componentPath: import.meta.url,
        componentModuleName: "default",
        componentProps: { name: "Solidjs" },
        prerenderConfigPath: import.meta.url,
      });

      expect(result).toStrictEqual({
        type: "div",
        props: {
          innerHTML: "<div>Hello, Solidjs!</div>",
        },
      });
    });
  });
});
