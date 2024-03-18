import { describe, expect, it } from "bun:test";
import { prerender } from "prerender-macro/prerender";
import { renderToString } from "react-dom/server";

export default function TestComponent({ name }: { name: string }) {
  return <div>Hello, {name}!</div>;
}

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) => {
    return renderToString(<Component {...props} />);
  },
  injectToJSX: (htmlString: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
};

describe("React", () => {
  describe("prerender", () => {
    it("should work", async () => {
      const result = await prerender({
        componentPath: import.meta.url,
        componentModuleName: "default",
        componentProps: { name: "React" },
        prerenderConfigPath: import.meta.url,
      });

      expect(result).toStrictEqual(
        <div
          dangerouslySetInnerHTML={{
            __html: "<div>Hello, <!-- -->React<!-- -->!</div>",
          }}
        />,
      );
    });
  });
});
