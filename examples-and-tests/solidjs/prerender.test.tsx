import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { prerender } from "prerender-macro/prerender";

describe("Solidjs", () => {
  describe("prerender", () => {
    it("should work with default export", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "default",
        componentProps: { name: "Solidjs" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toStrictEqual({
        type: "div",
        props: {
          innerHTML: "<div>Foo, Solidjs!</div>",
        },
      });
    });
    it("should work with named export", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "Bar",
        componentProps: { name: "Solidjs" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toStrictEqual({
        type: "div",
        props: {
          innerHTML: "<div>Bar, Solidjs!</div>",
        },
      });
    });
  });
});
