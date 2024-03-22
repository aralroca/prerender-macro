import { join } from "node:path";
import { describe, it, expect } from "bun:test";
import { transpile } from "prerender-macro";
import { prerenderConfig as config } from "./config";

const toInline = (s: string) => s.replace(/\s*\n\s*/g, "");
const normalizeQuotes = (s: string) => toInline(s).replaceAll("'", '"');
const configPath = join(import.meta.dir, "config.tsx");
const currentFile = import.meta.url.replace("file://", "");

describe("React", () => {
  describe("plugin", () => {
    it('should not transform if there is not an import attribute with type "prerender"', () => {
      const code = `
      import Foo from "./components";
      import { Bar } from "./components";

      export default function Test() {
        return (
          <div>
            <Foo />
            <Bar />
          </div>
        );
      }
    `;
      const output = normalizeQuotes(
        transpile({
          code,
          path: currentFile,
          prerenderConfigPath: configPath,
          config,
        }),
      );
      const expected = normalizeQuotes(code);

      expect(output).toBe(expected);
    });
    it("should transform a static component", () => {
      const code = `
      import Foo from "./components" with { type: "prerender" };
      import { Bar } from "./components";

      export default function Test() {
        return (
          <div>
            <Foo />
            <Bar />
          </div>
        );
      }
    `;
      const output = normalizeQuotes(
        transpile({
          code,
          path: currentFile,
          prerenderConfigPath: configPath,
          config,
        }),
      );
      const expected = normalizeQuotes(`
        import prerenderConfig from "prerender-macro";
        import Foo from "./components";
        import {Bar} from "./components";
        
        export default function Test() {
          return jsxDEV("div", {children: [
            prerenderConfig.postRender(
              "<div>Foo, <!-- -->foo<!-- -->!</div>"
            ),
          jsxDEV(Bar, {}, undefined, false, undefined, this)]}, undefined, true, undefined, this);
        }
    `);

      expect(output).toBe(expected);
    });

    it("should transform a static component from named export", () => {
      const code = `
      import { Bar } from "./components" with { type: "prerender" };
      import Foo from "./components";

      export default function Test() {
        return (
          <div>
            <Foo />
            <Bar />
          </div>
        );
      }
    `;
      const output = normalizeQuotes(
        transpile({
          code,
          path: currentFile,
          prerenderConfigPath: configPath,
          config,
        }),
      );
      const expected = normalizeQuotes(`
        import prerenderConfig from "prerender-macro";
        import {Bar} from "./components";
        import Foo from "./components";
        
        export default function Test() {
          return jsxDEV("div", {children: [
            jsxDEV(Foo, {}, undefined, false, undefined, this),
            prerenderConfig.postRender(
              "<div>Bar, <!-- -->bar<!-- -->!</div>"
            )
          ]}, undefined, true, undefined, this);
        }
    `);

      expect(output).toBe(expected);
    });

    it("should transform a static component when is not inside JSX", () => {
      const code = `
        import { Bar } from "./components" with { type: "prerender" };

        export default function Test() {
          return <Bar />;
        }
    `;
      const output = normalizeQuotes(
        transpile({
          code,
          path: currentFile,
          prerenderConfigPath: configPath,
          config,
        }),
      );
      const expected = normalizeQuotes(`
        import prerenderConfig from "prerender-macro";
        import {Bar} from "./components";
        
        export default function Test() {
          return prerenderConfig.postRender(
            "<div>Bar, <!-- -->bar<!-- -->!</div>"
          );
        }
      `);

      expect(output).toBe(expected);
    });

    it("should transform a static component with props", () => {
      const code = `
        import Foo from "./components" with { type: "prerender" };

        export default function Test() {
          return <Foo name="React" nested={{ foo: ' works' }} />;
        }
    `;
      const output = normalizeQuotes(
        transpile({
          code,
          path: currentFile,
          prerenderConfigPath: configPath,
          config,
        }),
      );
      const expected = normalizeQuotes(`
        import prerenderConfig from "prerender-macro";
        import Foo from "./components";
        
        export default function Test() {
          return prerenderConfig.postRender(
            "<div>Foo, <!-- -->React<!-- --> works<!-- -->!</div>"
          );
        }
      `);

      expect(output).toBe(expected);
    });
  });
});
