import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { prerender } from "prerender-macro/prerender";

describe("Kitajs/html", () => {
  describe("prerender", () => {
    it("should work with default module", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "default",
        componentProps: { name: "Kitajs/html" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toBe("<div>Foo, Kitajs/html!</div>");
    });
    it("should work with named module", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "Bar",
        componentProps: { name: "Kitajs/html" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toBe("<div>Bar, Kitajs/html!</div>");
    });
  });
});
