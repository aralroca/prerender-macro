import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { prerender } from "prerender-macro/prerender";

describe("Preact", () => {
  describe("prerender", () => {
    it("should work with default export", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "default",
        componentProps: { name: "Preact" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result.type).toBe("div");
      expect(result.props).toStrictEqual({
        dangerouslySetInnerHTML: {
          __html: "<div>Foo, Preact!</div>",
        },
      });
    });
    it("should work with named export", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "Bar",
        componentProps: { name: "Preact" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result.type).toBe("div");
      expect(result.props).toStrictEqual({
        dangerouslySetInnerHTML: {
          __html: "<div>Bar, Preact!</div>",
        },
      });
    });
  });
});
