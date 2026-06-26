const http = require("http");

const targetHost = "127.0.0.1";
const targetPort = 5174;
const listenPort = Number(process.env.PORT || 5175);

const server = http.createServer((req, res) => {
  const proxy = http.request(
    {
      hostname: targetHost,
      port: targetPort,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: `${targetHost}:${targetPort}`
      }
    },
    (upstream) => {
      res.writeHead(upstream.statusCode || 502, upstream.headers);
      upstream.pipe(res);
    }
  );

  proxy.on("error", (err) => {
    res.writeHead(502, { "content-type": "text/plain" });
    res.end(`Preview bridge error: ${err.message}`);
  });

  req.pipe(proxy);
});

server.listen(listenPort, "0.0.0.0", () => {
  console.log(`Phone preview listening on http://0.0.0.0:${listenPort}/`);
});
