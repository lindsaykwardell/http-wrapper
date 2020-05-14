import {
  listenAndServe,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

export class Server {
  private router: Router = new Router();

  public useRouter(router: Router) {
    this.router = router;
  }

  public async start(config: Deno.ListenOptions) {
    listenAndServe(config, async (req) => {
      const {
        getRoutes,
        postRoutes,
        putRoutes,
        deleteRoutes,
      } = this.router.routes;

      for (const [route, func] of getRoutes) {
        if (req.method === "GET" && req.url === route) {
          func(req);
        }
      }

      for (const [route, func] of postRoutes) {
        if (req.method === "POST" && req.url === route) {
          func(req);
        }
      }

      for (const [route, func] of putRoutes) {
        if (req.method === "PUT" && req.url === route) {
          func(req);
        }
      }

      for (const [route, func] of deleteRoutes) {
        if (req.method === "DELETE" && req.url === route) {
          func(req);
        }
      }
    });

    return config;
  }
}

export class Router {
  private _get: Map<string, (req: ServerRequest) => void> = new Map();
  private _post: Map<string, (req: ServerRequest) => void> = new Map();
  private _put: Map<string, (req: ServerRequest) => void> = new Map();
  private _delete: Map<string, (req: ServerRequest) => void> = new Map();

  public get(route: string, func: (req: ServerRequest) => void) {
    this._get.set(route, func);
  }

  public post(route: string, func: (req: ServerRequest) => void) {
    this._post.set(route, func);
  }

  public put(route: string, func: (req: ServerRequest) => void) {
    this._put.set(route, func);
  }

  public delete(route: string, func: (req: ServerRequest) => void) {
    this._delete.set(route, func);
  }

  public get routes() {
    return {
      getRoutes: this._get,
      postRoutes: this._post,
      putRoutes: this._put,
      deleteRoutes: this._delete,
    };
  }
}
