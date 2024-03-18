<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/aralroca/prerender-macro/assets/13313058/d51dd094-5e0a-47c8-a7e0-0599feeea09f" height="128">
      <img src="https://github.com/aralroca/prerender-macro/assets/13313058/b73f8012-0dc2-4d96-aeda-b4a1b235cc9e" height="128">
    </picture>
    <h1 align="center">Prerender Macro</h1>
</p>

<p align="center">Bun plugin to <b>prerender</b> JSX components using a kind of <b>macro</b>.</p>

<div align="center">

[![npm version](https://badge.fury.io/js/prerender-macro.svg)](https://badge.fury.io/js/prerender-macro)
![npm](https://img.shields.io/npm/dw/prerender-macro)
[![size](https://img.shields.io/bundlephobia/minzip/prerender-macro)](https://bundlephobia.com/package/prerender-macro)
[![PRs Welcome][badge-prwelcome]][prwelcome]
<a href="https://github.com/aralroca/prerender-macro/actions?query=workflow%3ATest" alt="Tests status">
<img src="https://github.com/aralroca/prerender-macro/workflows/Test/badge.svg" /></a>
<a href="https://twitter.com/intent/follow?screen_name=aralroca">
<img src="https://img.shields.io/twitter/follow/aralroca?style=social&logo=x"
            alt="follow on Twitter"></a>

</div>

[badge-prwelcome]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prwelcome]: http://makeapullrequest.com

<p align="center">Work in every JSX Framework.</p>

<div align="center">
  <a href="#usage-with-brisa-experimental">Brisa</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#usage-with-react">React</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#usage-with-solidjs">Solidjs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#usage-with-preact">Preact</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/sponsors/aralroca">Sponsors</a>
  <br />
</div>

## About `prerender-macro`

This allows to make hybrid pages between dynamic and static components, avoiding the rendering in runtime of the static ones, this rendering is done in build-time thanks to Bun's macros.

```tsx
import StaticComponent from "@/components/static-component" with { type: "prerender" };
import DynamicComponent from "@/components/dynamic-component";

// ...
return (
  <>
    <StaticComponent />
    <DynamicComponent />
  </>
);
```

In this way:

- The bundle is smaller because instead of carrying all the JS it only carries the prerendered HTML.
- The runtime speed of rendering is faster, it only has to render the dynamic components.

## Getting started

### Install

```sh
bun install prerender-macro
```

## Use it in `Bun.build`

```tsx
import prerenderMacroPlugin from "prerender-macro";

// The configuration should be adapted to the framework that you are using:
export const prerenderConfig = {
  renderComponentToString: (Component, props): string => /* */,
  injectToJSX: (htmlString: string): JSX.Element => /* */
};

Bun.build({
  plugins: [prerenderMacroPlugin({ prerenderConfigPath: import.meta.url })],
  entrypoints,
  outdir,
  root,
});
```

## Configuration

The `prerender-macro` plugin needs this mandatory configuration to work:

| Parameter             | Description                                                     | Mandatory |
| --------------------- | --------------------------------------------------------------- | --------- |
| `prerenderConfigPath` | String path of the file with the `prerenderConfig` named export | `true`    |

The configuration can be in another file, but it is mandatory that it has the named export `prerenderConfig`.

It is necessary to do it this way because this configuration will be executed when doing the prerender inside a Bun macro, and at this point we cannot pass it from the plugin because it would need to be serialized, so it is better that you directly access it.

The `prerenderConfig` named export needs this mandatory configuration to work:

| Parameter                 | Description                                               | Mandatory |
| ------------------------- | --------------------------------------------------------- | --------- |
| `renderComponentToString` | Function to transform `Component` and `props` to `string` | `true`    |
| `injectToJSX`             | Function to inject `string` to `JSX.Element`              | `true`    |

> [!NOTE]
>
> It is not necessary to indicate the `jsx-runtime`, it will work with the one you have and it can connect with **any JSX framework**.

## Examples

## Usage with Brisa _(experimental)_

Example:

```tsx
import prerenderMacroPlugin from "prerender-macro";
import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";

export const prerenderConfig = {
  renderComponentToString: (Component, props) => {
    return renderToString(<Component {...props} />);
  },
  injectToJSX: dangerHTML,
};

export const plugin = prerenderMacroPlugin({
  prerenderConfigPath: import.meta.url,
});
```

> [!WARNING]
>
> Brisa is an _experimental_ framework that we are building.

Brisa is not yet public but it will be in the next months. If you want to be updated, subscribe to my [blog newsletter](https://aralroca.com/blog).

## Usage with React

For React components, since React does not have a built-in function for injecting HTML strings directly into JSX, you need to use `dangerouslySetInnerHTML`. This allows you to bypass React's default behavior and inject raw HTML into the DOM.

Example:

```tsx
import prerenderMacroPlugin from "prerender-macro";
import { renderToString } from "react-dom/server";

export const prerenderConfig = {
  renderComponentToString: async (Component, props) => {
    return renderToString(<Component {...props} />);
  },
  injectToJSX: (htmlString) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
};

export const plugin = prerenderMacroPlugin({
  prerenderConfigPath: import.meta.url,
});
```

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `dangerouslySetInnerHTML` to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike Brisa, where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

## Usage with Solidjs

For Solidjs components, since Solidjs does not have a built-in function for injecting HTML strings directly into JSX, you need to use `textContent` attribute. This allows you to bypass Solidjs's default behavior and inject raw HTML into the DOM.

Besides, the solidjs `renderComponentToString` has to be slightly modified.

Example:

```tsx

```

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `textContent` attribute to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike Brisa, where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

## Usage with Preact

For Preact components, since Preact does not have a built-in function for injecting HTML strings directly into JSX, you need to use `dangerouslySetInnerHTML`. This allows you to bypass Preact's default behavior and inject raw HTML into the DOM.

Example:

```tsx
import prerenderMacroPlugin from "prerender-macro";
import { render } from "preact-render-to-string";
import { h } from "preact";

export const prerenderConfig = {
  renderComponentToString: async (Component: any, props: any) => {
    return render(<Component {...props} />);
  },
  injectToJSX: (htmlString: string) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
};

export const plugin = prerenderMacroPlugin({
  prerenderConfigPath: import.meta.url,
});
```

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `dangerouslySetInnerHTML` attribute to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike Brisa, where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

## Contributing

See [Contributing Guide](CONTRIBUTING.md) and please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
