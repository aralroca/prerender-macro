# `prerender-macro` Kitajs/html Example

This is an example with kitajs-html SSR without hotreloading and with a build process.

To test it:

- Clone the repo: `git clone git@github.com:aralroca/prerender-macro.git`
- Install dependencies: `cd prerender-macro && bun install`
- Run demo: `bun run demo:kitajs-html`
- Open http://localhost:1234 to see the result
- Look at `examples/kitajs-html/dist/index.js` to verify how the static parts have been converted to HTML in string.

The static component is translated to html in string in build-time:

```tsx
"Static Component \uD83E\uDD76 Random number = 0.41381527597071954";
```
