import { describe, expect, it } from "bun:test";
import { prerender } from "prerender-macro/prerender";
import { render } from "preact-render-to-string";
import { h } from "preact";

export default function TestComponent({ name }: { name: string }) {
  return <div>Hello, {name}!</div>;
}

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) => {
    return render(<Component {...props} />);
  },
  injectToJSX: (htmlString: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
};

describe("Preact", () => {
  describe("prerender", () => {
    it("should work", async () => {
      const result = await prerender({
        componentPath: import.meta.url,
        componentModuleName: "default",
        componentProps: { name: "Preact" },
        prerenderConfigPath: import.meta.url,
      });

      expect(result.type).toBe("div");
      expect(result.props).toStrictEqual({
        dangerouslySetInnerHTML: {
          __html: "<div>Hello, Preact!</div>",
        },
      });
    });
  });
});
