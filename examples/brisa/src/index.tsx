import DynamicComponent from "./components/dynamic-component";
import StaticComponent from "./components/static-component" with { type: "prerender" };
import { renderToReadableStream } from "brisa/server";

Bun.serve({
  port: 1234,
  fetch: async (request: Request) => {
    return new Response(
      renderToReadableStream(
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
        { request },
      ),
      { headers: new Headers({ "Content-Type": "text/html" }) },
    );
  },
});

console.log("Server running at http://localhost:1234");
