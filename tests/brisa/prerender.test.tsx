import { join } from "node:path";
import { describe, expect, it } from "bun:test";
import { prerender } from "prerender-macro/prerender";

describe("Brisa", () => {
  describe("prerender", () => {
    it("should work with default module", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "default",
        componentProps: { name: "Brisa" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toStrictEqual({
        // HTML is special element in Brisa, different than html (lowercase)
        type: "HTML",
        props: {
          html: "<div>Foo, Brisa!</div>",
        },
      });
    });
    it("should work with named module", async () => {
      const result = await prerender({
        componentPath: join(import.meta.dir, "components.tsx"),
        componentModuleName: "Bar",
        componentProps: { name: "Brisa" },
        prerenderConfigPath: join(import.meta.dir, "config.tsx"),
      });

      expect(result).toStrictEqual({
        // HTML is special element in Brisa, different than html (lowercase)
        type: "HTML",
        props: {
          html: "<div>Bar, Brisa!</div>",
        },
      });
    });
  });
});
