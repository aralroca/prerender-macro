import { join } from "node:path";
import { describe, it, expect } from "bun:test";
import { transpile } from "prerender-macro";

const toInline = (s: string) => s.replace(/\s*\n\s*/g, "");
const normalizeQuotes = (s: string) => toInline(s).replaceAll("'", '"');
const configPath = join(import.meta.dir, "config.tsx");

describe("Brisa", () => {
  describe("plugin", () => {
    it('should not transform if there is not an import attribute with type "prerender"', () => {
      const input = `
      import Foo from "@/components";
      import { Bar } from "@/components";

      export default function Test() {
        return (
          <div>
            <Foo />
            <Bar />
          </div>
        );
      }
    `;
      const output = normalizeQuotes(transpile(input, configPath));
      const expected = normalizeQuotes(input);

      expect(output).toBe(expected);
    });
    it("should transform a static component without props", () => {
      const input = `
      import Foo from "@/components" with { type: "prerender" };
      import { Bar } from "@/components";

      export default function Test() {
        return (
          <div>
            <Foo />
            <Bar />
          </div>
        );
      }
    `;
      const output = normalizeQuotes(transpile(input, configPath));
      const expected = normalizeQuotes(`
      import { prerender as __prerender__macro } from "prerender-macro/prerender" with { "type": "macro" };
      import Foo from "@/components" with { type: "prerender" };
      import { Bar } from "@/components";

      export default function Test() {
        return (
          <div>
            {__prerender__macro({ componentPath: "@/components", componentModuleName: "default", componentProps: {}, prerenderConfigPath: "${configPath}" })}
            <Bar />
          </div>
        );
      }
    `);

      expect(output).toBe(expected);
    });
  });
});
