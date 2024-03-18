<p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="https://github.com/aralroca/prerender-macro/assets/13313058/d51dd094-5e0a-47c8-a7e0-0599feeea09f" height="128">
      <img src="https://github.com/aralroca/prerender-macro/assets/13313058/b73f8012-0dc2-4d96-aeda-b4a1b235cc9e" height="128">
    </picture>
    <h1 align="center">Prerender Macro</h1>
</p>

<p align="center">Bun plugin to prerender JSX components using a kind of macro.</p>

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

<div align="center">
  <a href="#usage-with-brisa-experimental">Brisa</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#usage-with-react">React</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#usage-with-solidjs">Solidjs</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#usage-with-qwik">Qwik</a>
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

Bun.build({
  entrypoints,
  outdir,
  root,
  plugins: [prerenderMacroPlugin()],
});
```

## Configuration

The `prerender-macro` plugin supports the following configuration options:

| Parameter                    | Description                                        | Default Value      |
| ---------------------------- | -------------------------------------------------- | ------------------ |
| `renderToString.from`        | Path to the module providing `renderToString`      | `"brisa/server"`   |
| `renderToString.module`      | Name of the `renderToString` module                | `"renderToString"` |
| `injectStringIntoJSX.from`   | Path to the module providing `injectStringIntoJSX` | `"brisa"`          |
| `injectStringIntoJSX.module` | Name of the `injectStringIntoJSX` module           | `"dangerHTML"`     |

## Usage with Brisa _(experimental)_

It should work by default, since the plugin defaults are integrated with Brisa. By default, the plugin uses the following configuration:

```json
{
  "renderToString": {
    "from": "brisa/server",
    "module": "renderToString"
  },
  "injectStringIntoJSX": {
    "from": "brisa",
    "module": "dangerHTML"
  }
}
```

> [!WARNING]
>
> Brisa is an _experimental_ framework that we are building.

Brisa is not yet public but it will be in the next months. If you want to be updated, subscribe to my [blog newsletter](https://aralroca.com/blog).

## Usage with React

For React components, since React does not have a built-in function for injecting HTML strings directly into JSX, you need to use `dangerouslySetInnerHTML`. This allows you to bypass React's default behavior and inject raw HTML into the DOM. Here's how you can do it:

```tsx
// Define the function to create a JSX element with injected HTML string
function createInjectedElement(htmlString: string) {
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
}
```

The configuration that would have to be passed in the plugin:

```json
{
  "renderToString": {
    "from": "react-dom/server",
    "module": "renderToString"
  },
  "injectStringIntoJSX": {
    "from": "custom/utils",
    "module": "createInjectedElement"
  }
}
```

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `dangerouslySetInnerHTML` to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike Brisa, where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

## Usage with Solidjs

For Solidjs components, since Solidjs does not have a built-in function for injecting HTML strings directly into JSX, you need to use `textContent` attribute. This allows you to bypass Solidjs's default behavior and inject raw HTML into the DOM.

Besides, the solidjs `renderToString` has to be slightly modified.

Here's how you can do it:

```tsx
import { renderToString as solidRenderToString } from "solid-js/web";

export const renderToString = (element) => solidRenderToString(() => element);
export const injectStringIntoJSX = (htmlString) => (
  <div textContent={htmlString} />
);
```

The configuration that would have to be passed in the plugin:

```json
{
  "renderToString": {
    "from": "custom/utils",
    "module": "renderToString"
  },
  "injectStringIntoJSX": {
    "from": "custom/utils",
    "module": "injectStringIntoJSX"
  }
}
```

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `textContent` attribute to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike Brisa, where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

## Usage with Qwik

For Qwik components, since Qwik does not have a built-in function for injecting HTML strings directly into JSX, you need to use `dangerouslySetInnerHTML`. This allows you to bypass Qwik's default behavior and inject raw HTML into the DOM. Here's how you can do it:

```tsx
// Define the function to create a JSX element with injected HTML string
function createInjectedElement(htmlString: string) {
  return <div dangerouslySetInnerHTML={{ __html: htmlString }} />;
}
```

The configuration that would have to be passed in the plugin:

```json
{
  "renderToString": {
    "from": "@builder.io/qwik/server",
    "module": "renderToString"
  },
  "injectStringIntoJSX": {
    "from": "custom/utils",
    "module": "createInjectedElement"
  }
}
```

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `dangerouslySetInnerHTML` attribute to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike Brisa, where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

## Contributing

See [Contributing Guide](CONTRIBUTING.md) and please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
