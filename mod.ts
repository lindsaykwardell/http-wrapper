import {
  listenAndServe,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

export class Server {
  private routes: Map<string, EndpointRoutes> = new Map();

  public use(endpoint: Endpoint) {
    const endpoints: EndpointRoutes = new Map();

    endpoints.set(QueryType.GET, endpoint.routes.getRoutes);
    endpoints.set(QueryType.POST, endpoint.routes.postRoutes);
    endpoints.set(QueryType.PUT, endpoint.routes.putRoutes);
    endpoints.set(QueryType.DELETE, endpoint.routes.deleteRoutes);

    this.routes.set(endpoint.uri, endpoints);
  }

  public async start(config: Deno.ListenOptions) {
    for (const [route, thing] of this.routes) {
      for (const [queryType, thing2] of thing) {
        for (const [endpoint, func] of thing2) {
          console.log((route + endpoint).replace(/(\/\/)/g, "/"));
        }
      }
    }

    listenAndServe(config, async (req) => {
      for (const [route, thing] of this.routes) {
        for (const [queryType, thing2] of thing) {
          for (const [endpoint, func] of thing2) {
            if (
              req.method === queryType &&
              req.url === (route + endpoint).replace(/(\/\/)/g, "/")
            ) {
              func(req);
            }
          }
        }
      }
    });

    return config;
  }
}

export enum QueryType {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
}

export type EndpointMap = Map<string, (req: ServerRequest) => void>;
export type EndpointRoutes = Map<QueryType, EndpointMap>;

export type Endpoint = {
  uri: string;
  routes: {
    getRoutes: EndpointMap;
    postRoutes: EndpointMap;
    putRoutes: EndpointMap;
    deleteRoutes: EndpointMap;
  };
};

export class Router {
  private root: string = "/";

  constructor(root = "/") {
    this.root = root;
  }

  private _get: EndpointMap = new Map();
  private _post: EndpointMap = new Map();
  private _put: EndpointMap = new Map();
  private _delete: EndpointMap = new Map();

  public get(route: string, func: (req: ServerRequest) => void) {
    const withoutSlash = route === "/" ? "" : route.replace(/(\/\/)/g, "/");
    const withSlash = withoutSlash + "/";
    this._get.set(withoutSlash, func);
    if (!(withoutSlash === "" && this.root === "/")) {
      this._get.set(withSlash, func);
    }
  }

  public post(route: string, func: (req: ServerRequest) => void) {
    const withoutSlash = route === "/" ? "" : route.replace(/(\/\/)/g, "/");
    const withSlash = withoutSlash + "/";
    this._post.set(withoutSlash, func);
    if (!(withoutSlash === "" && this.root === "/")) {
      this._post.set(withSlash, func);
    }
  }

  public put(route: string, func: (req: ServerRequest) => void) {
    const withoutSlash = route === "/" ? "" : route.replace(/(\/\/)/g, "/");
    const withSlash = withoutSlash + "/";
    this._put.set(withoutSlash, func);
    if (!(withoutSlash === "" && this.root === "/")) {
      this._put.set(withSlash, func);
    }
  }

  public delete(route: string, func: (req: ServerRequest) => void) {
    const withoutSlash = route === "/" ? "" : route.replace(/(\/\/)/g, "/");
    const withSlash = withoutSlash + "/";
    this._delete.set(withoutSlash, func);
    if (!(withoutSlash === "" && this.root === "/")) {
      this._delete.set(withSlash, func);
    }
  }

  public get routes(): Endpoint {
    return {
      uri: this.root,
      routes: {
        getRoutes: this._get,
        postRoutes: this._post,
        putRoutes: this._put,
        deleteRoutes: this._delete,
      },
    };
  }
}
