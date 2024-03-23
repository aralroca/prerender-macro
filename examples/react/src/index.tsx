import DynamicComponent from "./components/dynamic-component";
import StaticComponent from "./components/static-component" with { type: "prerender" };
import { renderToString } from "react-dom/server";

Bun.serve({
  port: 1234,
  fetch: async () => {
    return new Response(
      renderToString(
        <html>
          <head>
            <title>Prerender Macro</title>
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
