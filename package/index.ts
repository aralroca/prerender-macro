import type { BunPlugin } from "bun";
import { dirname } from "node:path";
import ts from "typescript";

export type PluginConfig = {
  prerenderConfigPath: string;
};

export type PrerenderConfig = {
  render: (
    Component: any,
    props: any,
  ) => JSX.Element | string | Promise<JSX.Element | string>;
  postRender?: (htmlString: string) => JSX.Element;
};

export type TranspilerOptions = {
  code: string;
  path: string;
  pluginConfig: PluginConfig;
  prerenderConfig?: PrerenderConfig;
};

export default function plugin(pluginConfig: PluginConfig) {
  if (!pluginConfig?.prerenderConfigPath) {
    throw new Error("prerender-macro: prerenderConfigPath config is required");
  }
  return {
    name: "prerender-plugin",
    async setup(build) {
      build.onLoad({ filter: /\.(tsx|jsx)$/ }, async ({ path, loader }) => {
        const code = await Bun.file(path).text();
        const prerenderConfig = (await import(pluginConfig.prerenderConfigPath))
          ?.prerenderConfig;

        try {
          const contents = transpile({
            code,
            path,
            pluginConfig,
            prerenderConfig,
          });

          return { contents, loader };
        } catch (e) {
          console.error(e);
          return { contents: code, loader };
        }
      });
    },
  } satisfies BunPlugin;
}

export function transpile({
  code,
  path,
  pluginConfig,
  prerenderConfig,
}: TranspilerOptions) {
  const sourceFile = createSourceFile(code);
  const importsWithPrerender = getImportsWithPrerender(sourceFile, path);

  if (!importsWithPrerender.length) return code;

  let modifiedAst = addExtraImports(sourceFile, pluginConfig, prerenderConfig);

  modifiedAst = replaceJSXToMacroCall(
    modifiedAst,
    importsWithPrerender,
    pluginConfig,
    prerenderConfig,
  ) as ts.SourceFile;

  return ts
    .createPrinter()
    .printNode(ts.EmitHint.Unspecified, modifiedAst, sourceFile);
}

function createSourceFile(code: string) {
  const result = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext,
      jsx: ts.JsxEmit.Preserve,
    },
  });

  return ts.createSourceFile(
    "file.tsx",
    result.outputText,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TSX,
  );
}

function getImportsWithPrerender(sourceFile: ts.SourceFile, path: string) {
  const dir = dirname(path);

  return sourceFile.statements.filter(isPrerenderImport).flatMap((node) => {
    const namedExports = node.importClause?.namedBindings as ts.NamedImports;

    if (namedExports) {
      return namedExports.elements.map((element) => ({
        identifier: element.name.getText(),
        path: Bun.resolveSync(
          (node.moduleSpecifier as any).text ?? node.moduleSpecifier.getText(),
          dir,
        ),
        moduleName: element.propertyName?.getText() ?? element.name.getText(),
      }));
    }

    return {
      identifier: node.importClause?.getText(),
      path: Bun.resolveSync(
        (node.moduleSpecifier as any).text ?? node.moduleSpecifier.getText(),
        dir,
      ),
      moduleName: "default",
    };
  });
}

function isPrerenderImport(node: ts.Node): node is ts.ImportDeclaration {
  return (
    ts.isImportDeclaration(node) &&
    Boolean(
      node.attributes?.elements?.some(
        (element: any) =>
          element.name.getText() === "type" &&
          element.value.text === "prerender",
      ),
    )
  );
}

function addExtraImports(
  ast: ts.SourceFile,
  pluginConfig: PluginConfig,
  prerenderConfig?: PrerenderConfig,
) {
  const allImports = [...ast.statements];

  allImports.unshift(
    ts.factory.createImportDeclaration(
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
    ),
  );

  if (prerenderConfig?.postRender) {
    allImports.unshift(
      ts.factory.createImportDeclaration(
        undefined,
        ts.factory.createImportClause(
          false,
          undefined,
          ts.factory.createNamedImports([
            ts.factory.createImportSpecifier(
              false,
              undefined,
              ts.factory.createIdentifier("prerenderConfig"),
            ),
          ]),
        ),
        ts.factory.createStringLiteral(pluginConfig.prerenderConfigPath),
      ),
    );
  }

  return ts.factory.updateSourceFile(ast, allImports);
}

/**
 *
 * Replace
 *  <StaticComponent />
 * to
 * __prerender__macro({
 *  componentPath: "path/to/component.tsx",
 *  componentModuleName: "StaticComponent",
 *  componentProps: {},
 *  prerenderConfigPath: "path/to/config.tsx"
 * });
 *
 */
function replaceJSXToMacroCall(
  node: ts.Node,
  imports: any[],
  pluginConfig: PluginConfig,
  prerenderConfig?: PrerenderConfig,
  context?: ts.TransformationContext,
): ts.Node {
  if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
    const module = imports.find((i) => i.identifier === node.tagName.getText());

    if (module) {
      const props: ts.ObjectLiteralElementLike[] = [];

      for (const attr of node.attributes.properties) {
        if (ts.isJsxAttribute(attr)) {
          const propName = attr.name.getText();
          let propValue = attr.initializer as ts.Expression;

          if (ts.isJsxExpression(propValue)) {
            propValue = propValue.expression as ts.Expression;
          }

          props.push(
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier(propName),
              propValue,
            ),
          );
        }
      }

      let macroCall = ts.factory.createCallExpression(
        ts.factory.createIdentifier("__prerender__macro"),
        undefined,
        [
          ts.factory.createObjectLiteralExpression([
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier("componentPath"),
              ts.factory.createStringLiteral(module.path),
            ),
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier("componentModuleName"),
              ts.factory.createStringLiteral(module.moduleName),
            ),
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier("componentProps"),
              ts.factory.createObjectLiteralExpression(props),
            ),
            ts.factory.createPropertyAssignment(
              ts.factory.createIdentifier("prerenderConfigPath"),
              ts.factory.createStringLiteral(pluginConfig.prerenderConfigPath),
            ),
          ]),
        ],
      );

      // Wrap with postRender function
      if (prerenderConfig?.postRender) {
        macroCall = ts.factory.createCallExpression(
          ts.factory.createPropertyAccessExpression(
            ts.factory.createIdentifier("prerenderConfig"),
            ts.factory.createIdentifier("postRender"),
          ),
          undefined,
          [macroCall],
        );
      }

      if (
        node.parent &&
        (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))
      ) {
        return ts.factory.createJsxExpression(undefined, macroCall);
      }

      return macroCall;
    }
  }

  return ts.visitEachChild(
    node,
    (child) =>
      replaceJSXToMacroCall(
        child,
        imports,
        pluginConfig,
        prerenderConfig,
        context,
      ),
    context,
  );
}

declare global {
  var jsxRuntime: string | undefined;
}
