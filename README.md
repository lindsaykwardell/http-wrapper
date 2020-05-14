# Deno HTTP Wrapper

### *Simple Server/Router wrapper around Deno's HTTP module*

## Intent

I really like Deno as a concept, and I especially like the default HTTP library. I feel like it doesn't need all the abstraction put on top of it to build something pretty good. 

The intent of this library is to build a lightweight wrapper around it that provides a more intuitive API around the `listenAndServe()` function. 

Some of the API is inspired by Express.js.

## Example

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

## Use

There are two classes: `Server` and `Router`.

`Router` currently supports four HTTP methods: 
- GET
- POST
- PUT
- DELETE

New routes are created as follows:

```javascript
const router = new Router();
```

`new Router()` accepts a string for its constructor of new route (see example above).

A new endpoint for the given route can be added by using its specific method:

```javascript
router.get("/", (req) => {
  // Perform actions on request
})
```

The request is the standard `ServerRequest` object native to Deno. It is not modified in any way, and you can interact with it directly. The purpose of this library is to make it easy to work with, not to change the interface.

When you are ready to apply your route and start your server, run the following:

```javascript

const app = new Server();

app.use(router.routes) // router.routes is a getter, so you do not need to invoke it as a function.

// Using promises to know when the server is up
app.start({ port: 3000 }).then((config) =>
  console.log(`Server running on localhost:${config.port}`)
);

// Using await to know when the server is up
await app.start({port: 3000});

console.log("Server running on localhost:3000");
```

The benefit of using promises is having the config object returned that you passed in, but it isn't important if you don't want to see it.

## License

This project is MIT Licensed.