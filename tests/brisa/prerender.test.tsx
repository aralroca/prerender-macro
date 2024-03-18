import { describe, expect, it } from "bun:test";
import { prerender } from "prerender-macro/prerender";
import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";

export default function TestComponent({ name }: { name: string }) {
  return <div>Hello, {name}!</div>;
}

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) =>
    renderToString(<Component {...props} />),
  injectToJSX: dangerHTML,
};

describe("Brisa", () => {
  describe("prerender", () => {
    it("should work", async () => {
      const result = await prerender({
        componentPath: import.meta.url,
        componentModuleName: "default",
        componentProps: { name: "Brisa" },
        prerenderConfigPath: import.meta.url,
      });

      expect(result).toStrictEqual({
        // HTML is special element in Brisa, different than html (lowercase)
        type: "HTML",
        props: {
          html: "<div>Hello, Brisa!</div>",
        },
      });
    });
  });
});
