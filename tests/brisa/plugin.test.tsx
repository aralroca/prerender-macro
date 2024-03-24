import { join } from "node:path";
import { describe, it, expect } from "bun:test";
import { transpile, type TranspilerOptions } from "prerender-macro";

const format = (s: string) => s.replace(/\s*\n\s*/g, "").replaceAll("'", '"');
const configPath = join(import.meta.dir, "config.tsx");
const currentFile = import.meta.url.replace("file://", "");
const bunTranspiler = new Bun.Transpiler({ loader: "tsx" });

function transpileAndRunMacros(config: TranspilerOptions) {
  // Bun transpiler is needed here to run the macros
  return format(bunTranspiler.transformSync(transpile(config)));
}

describe("Brisa", () => {
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
      const output = transpileAndRunMacros({
        code,
        path: currentFile,
        pluginConfig: { prerenderConfigPath: configPath },
      });
      const expected = format(bunTranspiler.transformSync(code));

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
      const output = transpileAndRunMacros({
        code,
        path: currentFile,
        pluginConfig: { prerenderConfigPath: configPath },
      });
      const expected = format(`
      import Foo from "./components";
      import {Bar} from "./components";
      
      export default function Test() {
        return jsxDEV("div", {
          children: [{type: "HTML",props: {html: "<div>Foo, foo!</div>"}},
          jsxDEV(Bar, {}, undefined, false, undefined, this)
        ]}, undefined, true, undefined, this);
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
      const output = transpileAndRunMacros({
        code,
        path: currentFile,
        pluginConfig: { prerenderConfigPath: configPath },
      });
      const expected = format(`
        import {Bar} from "./components";
        import Foo from "./components";
        
        export default function Test() {
          return jsxDEV("div", {
            children: [jsxDEV(Foo, {}, undefined, false, undefined, this),
              {type: "HTML",props: {html: "<div>Bar, bar!</div>"}}
            ]}, undefined, true, undefined, this)
          ;}
    `);

      expect(output).toBe(expected);
    });

    it("should transform a static component from named export and a fragment", () => {
      const code = `
      import { Bar } from "./components" with { type: "prerender" };
      import Foo from "./components";

      export default function Test() {
        return (
          <>
            <Foo />
            <Bar />
          </>
        );
      }
    `;
      const output = transpileAndRunMacros({
        code,
        path: currentFile,
        pluginConfig: { prerenderConfigPath: configPath },
      });
      const expected = format(`
        import {Bar} from "./components";
        import Foo from "./components";
        
        export default function Test() {
          return jsxDEV(Fragment, {
            children: [jsxDEV(Foo, {}, undefined, false, undefined, this),
              {type: "HTML",props: {html: "<div>Bar, bar!</div>"}}
            ]}, undefined, true, undefined, this)
          ;}
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
      const output = transpileAndRunMacros({
        code,
        path: currentFile,
        pluginConfig: { prerenderConfigPath: configPath },
      });
      const expected = format(`
        import {Bar} from "./components";
        
        export default function Test() {
          return {type: "HTML",props: {html: "<div>Bar, bar!</div>"}};
        }
      `);

      expect(output).toBe(expected);
    });

    it("should transform a static component with props", () => {
      const code = `
        import Foo from "./components" with { type: "prerender" };

        export default function Test() {
          return <Foo name="Brisa" nested={{ foo: ' works' }} />;
        }
    `;
      const output = transpileAndRunMacros({
        code,
        path: currentFile,
        pluginConfig: { prerenderConfigPath: configPath },
      });
      const expected = format(`
        import Foo from "./components";
        
        export default function Test() {
          return {type: "HTML",props: {html: "<div>Foo, Brisa works!</div>"}};
        }
      `);

      expect(output).toBe(expected);
    });
  });
});
