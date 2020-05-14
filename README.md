# Deno HTTP Wrapper

### *Simple Server/Router wrapper around Deno's HTTP module*

## Intent

I really like Deno as a concept, and I especially like the default HTTP library. I feel like it doesn't need all the abstraction put on top of it to build something pretty good. 

The intent of this library is to build a lightweight wrapper around it that provides a more intuitive API around the `listenAndServe()` function. 

Some of the API is inspired by Express.js.

## Use

```javascript
import { Server, Router } from "./wrapper.ts";

const router = new Router();

router.get("/", async (req) => {
  req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "text/html",
    }),
    body: await Deno.open("./index.html"),
  });
});

const bobRouter = new Router("/bob");
bobRouter.get("/", (req) => {
  req.respond({
    status: 200,
    headers: new Headers({
      "content-type": "application/json",
    }),
    body: JSON.stringify({
      test: "This is a test",
    }),
  });
});

const app = new Server();
app.use(router.routes);
app.use(bobRouter.routes);

app.start({ port: 3000 }).then((config) =>
  console.log(`Server running on localhost:${config.port}`)
);

```

