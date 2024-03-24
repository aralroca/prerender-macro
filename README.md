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

- [At glance](#at-glance)
  - [How it works?](#how-it-works)
- [Quick start](#quick-start)
  - [Install](#install)
  - [Use it in `Bun.build`](#use-it-in-bunbuild)
- [Configuration](#configuration)
- [Configuration examples in different frameworks](#configuration-examples-in-different-frameworks)
  - [Brisa](#brisa-experimental)
  - [React](#react)
  - [Preact](#preact)
  - [Add your framework example](#add-your-framework-example)
- [Contributing](#contributing)
- [License](#license)

## At glance

`prerender-macro` plugin allows to make hybrid pages between dynamic and static components, avoiding the rendering in runtime of the static ones, this rendering is done in build-time thanks to Bun's macros.

```tsx
import StaticComponent from "@/static-component" with { type: "prerender" };
import DynamicComponent from "@/dynamic-component";

// ...
return (
  <>
    <StaticComponent foo="bar" />
    <DynamicComponent />
  </>
);
```

In this way:

- The bundle is smaller because instead of carrying all the JS it only carries the prerendered HTML.
- The runtime speed of rendering is faster, it only has to render the dynamic components.

### How it works?

This plugin transforms the previous code to this code:

```tsx
import { prerender } from "prerender-macro/prerender" with { "type": "macro" };
import DynamicComponent from "@/dynamic-component";

// ...
return (
  <>
    {prerender({
      componentPath: "@/static-component",
      componentModuleName: "default",
      componentProps: { foo: "bar" },
    })}
    <DynamicComponent />
  </>
);
```

And pass it back through the [Bun transpiler](https://bun.sh/docs/api/transpiler) to run the macro. [Bun macro](https://bun.sh/docs/bundler/macros#:~:text=Bun%20Macros%20are%20import%20statements,number%20of%20browsers%20and%20runtimes) together with the prerender helper takes care of converting the component to html `string` in build-time. This way it will only be necessary in runtime to make the rendering of those dynamic.

> [!IMPORTANT]
>
> Macros can accept **component properties**, but only in limited cases. The value must be **statically known**. For more info take a look the [Bun Macros Arguments](https://bun.sh/docs/bundler/macros#arguments) documentation.

## Quick start

### Install

```sh
bun install prerender-macro
```

### Use it in `Bun.build`

To use it you have to set the `prerenderConfigPath` (**mandatory**), which is the path where you have the configuration export, if it is in the same file you can use `import.meta.url`.

```tsx
import prerenderMacroPlugin from "prerender-macro";

// The configuration should be adapted to the framework that you are using:
export const prerenderConfig = {
  render: (Component, props) => /* mandatory */,
  postRender: () => /* optional */
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

| Parameter    | Description                                                                                                         | Mandatory | Can be async |
| ------------ | ------------------------------------------------------------------------------------------------------------------- | --------- | ------------ |
| `render`     | Function to render the component on your framework ([AOT](https://en.wikipedia.org/wiki/Ahead-of-time_compilation)) | `true`    | `yes`        |
| `postRender` | Function to make a post rendering in runtime ([JIT](https://en.wikipedia.org/wiki/Just-in-time_compilation))        | `false`   | `no`         |

> [!NOTE]
>
> It is not necessary to indicate the `jsx-runtime`, it will work with the one you have and it can connect with **any JSX framework**.

## Configuration examples in different frameworks

| Framework                    | Render ahead of time | Inject ahead of time | Preserves the HTML structure |
| ---------------------------- | -------------------- | -------------------- | ---------------------------- |
| [Brisa](#brisa-experimental) | ✅                   | ✅                   | ✅                           |
| [React](#react)              | ✅                   | ❌                   | ❌                           |
| [Preact](#preact)            | ✅                   | ✅                   | ❌                           |

> [!TIP]
>
> 👉 [Add your framework](#add-your-framework-example)

### Brisa _(experimental)_

Configuration example:

```tsx
import prerenderMacroPlugin, { type PrerenderConfig } from "prerender-macro";
import { dangerHTML } from "brisa";
import { renderToString } from "brisa/server";

export const prerenderConfig = {
  render: async (Component, props) =>
    dangerHTML(await renderToString(<Component {...props} />)),
} satisfies PrerenderConfig;

export const plugin = prerenderMacroPlugin({
  prerenderConfigPath: import.meta.url,
});
```

> [!NOTE]
>
> Brisa elements can be seamlessly coerced with Bun's AST and everything can be done AOT without having to use a `postRender`.

> [!NOTE]
>
> Brisa does not add extra nodes in the HTML, so it is a prerender of the real component, without modifying its structure.

> [!WARNING]
>
> Brisa is an _experimental_ framework that we are building.

Brisa is not yet public but it will be in the next months. If you want to be updated, subscribe to my [blog newsletter](https://aralroca.com/blog).

### React

For React components, since React does not have a built-in function for injecting HTML strings directly into JSX, you need to use `dangerouslySetInnerHTML`. This allows you to bypass React's default behavior and inject raw HTML into the DOM.

Configuration example:

```tsx
import prerenderMacroPlugin, { type PrerenderConfig } from "prerender-macro";
import { renderToString } from "react-dom/server";

export const prerenderConfig = {
  render: async (Component, props) => {
    return renderToString(<Component {...props} />);
  },
  postRender: (htmlString) => (
    <div dangerouslySetInnerHTML={{ __html: htmlString }} />
  ),
} satisfies PrerenderConfig;

export const plugin = prerenderMacroPlugin({
  prerenderConfigPath: import.meta.url,
});
```

> [!IMPORTANT]
>
> React elements have the `$$typeof` symbol and therefore cannot coerce to Bun's AST. This is why it is necessary to do the `postRender` in [JIT](https://en.wikipedia.org/wiki/Just-in-time_compilation).

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `dangerouslySetInnerHTML` to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike [Brisa](#brisa-experimental), where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

### Preact

For Preact components, since Preact does not have a built-in function for injecting HTML strings directly into JSX, you need to use `dangerouslySetInnerHTML`. This allows you to bypass Preact's default behavior and inject raw HTML into the DOM.

Configuration example:

```tsx
import prerenderMacroPlugin, { type PrerenderConfig } from "prerender-macro";
import { render } from "preact-render-to-string";
import { h } from "preact";

export const prerenderConfig = {
  render: async (Component, props) => {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: render(<Component {...props} />) }}
      />
    );
  },
} satisfies PrerenderConfig;

export const plugin = prerenderMacroPlugin({
  prerenderConfigPath: import.meta.url,
});
```

> [!NOTE]
>
> Preact elements can be seamlessly coerced with Bun's AST and everything can be done AOT without having to use a `postRender`.

> [!CAUTION]
>
> **Additional `<div>` Nodes**: Using `dangerouslySetInnerHTML` attribute to inject HTML strings into JSX components results in the creation of an additional `<div>` node for each injection, which may affect the structure of your rendered output. Unlike [Brisa](#brisa-experimental), where this issue is avoided, the extra `<div>` nodes can lead to unexpected layout changes or styling issues.

### Add your framework example

This project is open-source and totally open for you to contribute by adding the JSX framework you use, I'm sure it can help a lot of people.

To add your framework you have to:

- Fork & clone
- Create a folder inside [`tests`](/tests/) with your framework that is a copy of some other framework. The same for [`examples`](/examples/).
- Make the changes and adapt the example and tests to your framework
- Update the package.json scripts to add your framework
- Update the [`README.md`](/README.md) adding the documentation of your framework.
- Open a PR with the changes.

## Contributing

See [Contributing Guide](CONTRIBUTING.md) and please follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

[MIT](LICENSE)
