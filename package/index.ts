import type { BunPlugin } from "bun";
import ts from "typescript";

type PrerenderPluginParams = {
  renderToStringPath: string;
  renderToStringModuleName: string;
  injectStringIntoJSXPath: string;
  injectStringIntoJSXModuleName: string;
};

const defaultConfig: PrerenderPluginParams = {
  renderToStringPath: "brisa/server",
  renderToStringModuleName: "renderToString",
  injectStringIntoJSXPath: "brisa",
  injectStringIntoJSXModuleName: "dangerHTML",
};

export default function prerenderPlugin({
  renderToStringPath = defaultConfig.renderToStringPath,
  renderToStringModuleName = defaultConfig.renderToStringModuleName,
  injectStringIntoJSXPath = defaultConfig.injectStringIntoJSXPath,
  injectStringIntoJSXModuleName = defaultConfig.injectStringIntoJSXModuleName,
}: PrerenderPluginParams = defaultConfig) {
  return {
    name: "prerender-plugin",
    setup(build) {
      build.onLoad(
        { filter: /.*/, namespace: "prerender" },
        async ({ path, loader }) => {
          return {
            contents: prerenderPluginTransformation(
              await Bun.file(path).text(),
            ),
            loader,
          };
        },
      );
    },
  } satisfies BunPlugin;
}

/**
 *
 * import { prerender } from "@/utils/prerender" with { type: 'macro' };
 *
 * {prerender('@/components/static-component', 'default')}
 *
 * import { dangerHTML } from 'brisa';
 * import { renderToReadableStream } from 'brisa/server';
 *
 */
export function prerenderPluginTransformation(code: string) {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  });

  const sourceFile = ts.createSourceFile(
    "file.tsx",
    result.outputText,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );
  const imports = sourceFile.statements.filter(ts.isImportDeclaration);
  const importsWithPrerender = imports.filter(
    (node) =>
      node.attributes?.elements?.some(
        (element: any) =>
          element.name.escapedText === "type" &&
          element.value.text === "prerender",
      ),
  );

  if (!importsWithPrerender.length) return code;

  const modifiedAst = addPrerenderImportMacro(sourceFile);

  traverse(modifiedAst);

  return ts
    .createPrinter()
    .printNode(ts.EmitHint.Unspecified, modifiedAst, sourceFile);
}

function addPrerenderImportMacro(ast: ts.SourceFile) {
  const importPrerenderMacro = ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          ts.factory.createIdentifier("prerender"),
          ts.factory.createIdentifier("__prerender__macro"),
        ),
      ]),
    ),
    ts.factory.createStringLiteral("prerender-macro/prerender"),
    ts.factory.createImportAttributes(
      ts.factory.createNodeArray([
        ts.factory.createImportAttribute(
          ts.factory.createStringLiteral("type"),
          ts.factory.createStringLiteral("macro"),
        ),
      ]),
    ),
  );

  return ts.factory.updateSourceFile(ast, [
    importPrerenderMacro,
    ...ast.statements,
  ]);
}

function traverse(node: ts.Node) {
  // all call expressions:
  if (ts.isJsxElement(node)) {
    console.log(node.getText());
  }

  ts.forEachChild(node, traverse);
}
