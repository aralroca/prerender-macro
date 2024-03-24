import DynamicComponent from "./components/dynamic-component";
import StaticComponent from "./components/static-component" with { type: "prerender" };
import { renderToString } from "brisa/server";

Bun.serve({
  port: 1234,
  fetch: async () => {
    return new Response(
      await renderToString(
        <html>
          <head>
            <title>Prerender Macro | Brisa example</title>
            <meta charSet="utf-8" />
          </head>
          <body>
            <StaticComponent name="Static" />
            <DynamicComponent name="Dynamic" />
            <a href="/">Refresh</a>
          </body>
        </html>,
      ),
      { headers: new Headers({ "Content-Type": "text/html" }) },
    );
  },
});

console.log("Server running at http://localhost:1234");
