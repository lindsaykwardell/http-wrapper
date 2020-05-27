import { Endpoint, EndpointMap, Request } from "./types.ts";

export class Router {
  private root: string = "/";

  constructor(root = "/") {
    this.root = root;
  }

  private _get: EndpointMap = new Map();
  private _post: EndpointMap = new Map();
  private _put: EndpointMap = new Map();
  private _delete: EndpointMap = new Map();
  private _patch: EndpointMap = new Map();
  private _head: EndpointMap = new Map();
  private _options: EndpointMap = new Map();

  private process(
    route: string,
    func: (req: Request) => void,
    target: EndpointMap,
  ) {
    const withoutSlash = route === "/" ? "" : route.replace(/(\/\/)/g, "/");
    const withSlash = withoutSlash + "/";
    target.set(withoutSlash, func);
    if (!(withoutSlash === "" && this.root === "/")) {
      target.set(withSlash, func);
    }
  }

  public get(route: string, func: (req: Request) => void) {
    this.process(route, func, this._get);
  }

  public post(route: string, func: (req: Request) => void) {
    this.process(route, func, this._post);
  }

  public put(route: string, func: (req: Request) => void) {
    this.process(route, func, this._put);
  }

  public delete(route: string, func: (req: Request) => void) {
    this.process(route, func, this._delete);
  }

  public head(route: string, func: (req: Request) => void) {
    this.process(route, func, this._head);
  }

  public options(route: string, func: (req: Request) => void) {
    this.process(route, func, this._options);
  }

  public patch(route: string, func: (req: Request) => void) {
    this.process(route, func, this._patch);
  }

  public get routes(): Endpoint {
    return {
      uri: this.root,
      routes: {
        getRoutes: this._get,
        postRoutes: this._post,
        putRoutes: this._put,
        deleteRoutes: this._delete,
        optionsRoutes: this._options,
        headRoutes: this._head,
        patchRoutes: this._patch,
      },
    };
  }
}
