# prerender-macro

Bun plugin to prerender JSX components using a kind of macro.

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

This allows to make hybrid pages between dynamic and static components, avoiding the rendering in runtime of the static ones, this rendering is done in build-time thanks to Bun's macros.

In this way:

- The bundle is smaller because instead of carrying all the JS it only carries the prerendered HTML.
- The runtime speed of rendering is faster, it only has to render the dynamic components.
