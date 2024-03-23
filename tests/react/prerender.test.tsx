import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { prerender } from "prerender-macro/prerender";

describe("React", () => {
  describe("prerender", () => {
    it("should work with default export", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "default",
        componentProps: { name: "React" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toBe("<div>Foo, <!-- -->React<!-- -->!</div>");
    });
    it("should work with named export", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "Bar",
        componentProps: { name: "React" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toBe("<div>Bar, <!-- -->React<!-- -->!</div>");
    });
  });
});
