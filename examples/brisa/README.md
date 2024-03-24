# `prerender-macro` Brisa Example

This is an example with Brisa SSR without hotreloading and with a build process.

To test it:

- `bun install`
- `bun run start`
- Open http://localhost:1234 to see the result
- Look at `dist/index.js` to verify how the static parts have been converted to HTML in string.

The static component is translated to html in string in build-time:

```tsx
"Static Component \uD83E\uDD76 Random number = 0.41381527597071954";
```
