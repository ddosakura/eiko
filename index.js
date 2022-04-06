import { XMLParser } from "https://esm.sh/fast-xml-parser@4.0.7";
const parser = new XMLParser();

// Start listening on port 8080 of localhost.
const server = Deno.listen({ port: 8080 });
console.log(`HTTP webserver running.  Access it at:  http://localhost:8080/`);

// Connections to the server will be yielded up as an async iterable.
for await (const conn of server) {
  // In order to not be blocking, we need to handle each connection individually
  // without awaiting the function
  serveHttp(conn);
}

async function serveHttp(conn) {
  // const jsonResponse = await fetch("https://api.github.com/users/denoland");
  // const jsonData = await jsonResponse.json();
  // console.log(jsonData);

  // const textResponse = await fetch("https://deno.land/");
  // const textData = await textResponse.text();
  // console.log(textData);

  const text = await (async () => {
    try {
      // const resp = await fetch("https://does.not.exist/");
      const resp = await fetch("https://acg.rip/.xml?term=Koumei");
      const xml = String(await resp.text());
      return JSON.stringify(parser.parse(xml), null, 2);
    } catch (error) {
      return error;
    }
  })();

  // This "upgrades" a network connection into an HTTP connection.
  const httpConn = Deno.serveHttp(conn);
  // Each request sent over the HTTP connection will be yielded as an async
  // iterator from the HTTP connection.
  for await (const requestEvent of httpConn) {
    // The native HTTP server uses the web standard `Request` and `Response`
    // objects.
    const body = text;
    // The requestEvent's `.respondWith()` method is how we send the response
    // back to the client.
    requestEvent.respondWith(
      new Response(body, {
        status: 200,
      }),
    );
  }
}
