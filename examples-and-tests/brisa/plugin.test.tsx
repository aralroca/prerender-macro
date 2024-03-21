import { join } from "node:path";
import { describe, it, expect } from "bun:test";
import { prerenderPluginTransformation } from "prerender-macro";

const toInline = (s: string) => s.replace(/\s*\n\s*/g, "");
const normalizeQuotes = (s: string) => toInline(s).replaceAll("'", '"');
const configPath = join(import.meta.dir, "config.tsx");

describe("Brisa", () => {
  describe("plugin", () => {
    it('should not transform if there is not an import attribute with type "prerender"', () => {
      const input = `
      import StaticComponent from "@/components/static";
      import DynamicComponent from "@/components/dynamic";

      export default function Test() {
        return (
          <div>
            <StaticComponent />
            <DynamicComponent />
          </div>
        );
      }
    `;
      const output = normalizeQuotes(
        prerenderPluginTransformation(input, configPath),
      );
      const expected = normalizeQuotes(input);

      expect(output).toBe(expected);
    });
    it("should transform a static component without props", () => {
      const input = `
      import StaticComponent from "@/components/static" with { type: "prerender" };
      import DynamicComponent from "@/components/dynamic";

      export default function Test() {
        return (
          <div>
            <StaticComponent />
            <DynamicComponent />
          </div>
        );
      }
    `;
      const output = normalizeQuotes(
        prerenderPluginTransformation(input, configPath),
      );
      const expected = normalizeQuotes(`
      import { prerender as __prerender__macro } from "prerender-macro/prerender" with { "type": "macro" };
      import StaticComponent from "@/components/static" with { type: "prerender" };
      import DynamicComponent from "@/components/dynamic";

      export default function Test() {
        return (
          <div>
            {__prerender__macro({ componentPath: "@/components/static", componentModuleName: "default", componentProps: {} })}
            <DynamicComponent />
          </div>
        );
      }
    `);

      expect(output).toBe(expected);
    });
  });
});
