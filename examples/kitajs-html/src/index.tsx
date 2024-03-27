import DynamicComponent from "./components/dynamic-component";
import StaticComponent from "./components/static-component" with { type: "prerender" };

Bun.serve({
  port: 1234,
  fetch: async (request: Request) => {
    const page = await (
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
      </html>
    );

    return new Response(page, {
      headers: new Headers({ "Content-Type": "text/html" }),
    });
  },
});

console.log("Server running at http://localhost:1234");
