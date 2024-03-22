import type { BunPlugin } from "bun";
import ts from "typescript";

type PrerenderPluginParams = {
  prerenderConfigPath: string;
};

export default function prerenderPlugin({
  prerenderConfigPath,
}: PrerenderPluginParams) {
  return {
    name: "prerender-plugin",
    setup(build) {
      build.onLoad(
        { filter: /.*/, namespace: "prerender" },
        async ({ path, loader }) => {
          return {
            contents: prerenderPluginTransformation(
              await Bun.file(path).text(),
              prerenderConfigPath,
            ),
            loader,
          };
        },
      );
    },
  } satisfies BunPlugin;
}

export function prerenderPluginTransformation(
  code: string,
  prerenderConfigPath: string,
) {
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
  const importsWithPrerender = getImportsWithPrerender(sourceFile);

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

function getImportsWithPrerender(sourceFile: ts.SourceFile) {
  return sourceFile.statements
    .filter(ts.isImportDeclaration)
    .filter(
      (node) =>
        node.attributes?.elements?.some(
          (element: any) =>
            element.name.getText() === "type" &&
            element.value.text === "prerender",
        ),
    )
    .flatMap((node) => {
      const namedExports = node.importClause?.namedBindings as ts.NamedImports;

      if (namedExports) {
        return namedExports.elements.map((element) => ({
          identifier: element.name.getText(),
          path: node.moduleSpecifier.getText(),
          moduleName: element.propertyName?.getText() ?? element.name.getText(),
        }));
      }

      return {
        identifier: node.importClause?.getText(),
        path: node.moduleSpecifier.getText(),
        moduleName: "default",
      };
    });
}

function traverse(node: ts.Node) {
  // all call expressions:
  if (ts.isJsxElement(node)) {
    // console.log(node.openingElement.tagName);
  }

  ts.forEachChild(node, traverse);
}
