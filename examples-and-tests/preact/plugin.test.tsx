import { join } from "node:path";
import { describe, it, expect } from "bun:test";
import { transpile } from "prerender-macro";

const format = (s: string) => s.replace(/\s*\n\s*/g, "").replaceAll("'", '"');
const configPath = join(import.meta.dir, "config.tsx");
const currentFile = import.meta.url.replace("file://", "");

describe("Preact", () => {
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
      const output = format(
        transpile({ code, path: currentFile, prerenderConfigPath: configPath }),
      );
      const expected = format(code);

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
      const output = format(
        transpile({ code, path: currentFile, prerenderConfigPath: configPath }),
      );
      const expected = format(`
      import Foo from "./components";
      import {Bar} from "./components";
      
      export default function Test() {
        return jsxDEV("div", {
          children: [{type: "div",props: {
            dangerouslySetInnerHTML: {__html: "<div>Foo, foo!</div>"
          }},
          key: undefined,ref: undefined,__k: null,__: null,__b: 0,__e: null,__d: undefined,__c: null,constructor: undefined,__v: 4,__i: -1,__u: 0},jsxDEV(Bar, {}, undefined, false, undefined, this)]}, undefined, true, undefined, this);
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
      const output = format(
        transpile({ code, path: currentFile, prerenderConfigPath: configPath }),
      );
      const expected = format(`
        import {Bar} from "./components";
        import Foo from "./components";
        
        export default function Test() {
          return jsxDEV("div", {
            children: [jsxDEV(Foo, {}, undefined, false, undefined, this),{
              type: "div",props: {dangerouslySetInnerHTML: {
                __html: "<div>Bar, bar!</div>"
              }
            },key: undefined,ref: undefined,__k: null,__: null,__b: 0,__e: null,__d: undefined,__c: null,constructor: undefined,__v: 8,__i: -1,__u: 0}]}, undefined, true, undefined, this);
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
      const output = format(
        transpile({ code, path: currentFile, prerenderConfigPath: configPath }),
      );
      const expected = format(`
        import {Bar} from "./components";
        
        export default function Test() {
          return {type: "div",props: {dangerouslySetInnerHTML: {__html: "<div>Bar, bar!</div>"}},key: undefined,ref: undefined,__k: null,__: null,__b: 0,__e: null,__d: undefined,__c: null,constructor: undefined,__v: 12,__i: -1,__u: 0};
        }
      `);

      expect(output).toBe(expected);
    });

    it("should transform a static component with props", () => {
      const code = `
        import Foo from "./components" with { type: "prerender" };

        export default function Test() {
          return <Foo name="Preact" nested={{ foo: ' works' }} />;
        }
    `;
      const output = format(
        transpile({ code, path: currentFile, prerenderConfigPath: configPath }),
      );
      const expected = format(`
        import Foo from "./components";
        
        export default function Test() {
          return {type: "div",props: {dangerouslySetInnerHTML: {__html: "<div>Foo, Preact works!</div>"}},key: undefined,ref: undefined,__k: null,__: null,__b: 0,__e: null,__d: undefined,__c: null,constructor: undefined,__v: 16,__i: -1,__u: 0};
        }
      `);

      expect(output).toBe(expected);
    });
  });
});
