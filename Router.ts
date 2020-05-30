import { ServerRequest } from "https://deno.land/std/http/server.ts";
import { Endpoint, EndpointMap, RouteVariables } from "./types.ts";

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
    func: (req: ServerRequest, vars: RouteVariables) => void,
    target: EndpointMap,
  ) {
    const withoutSlash = route === "/" ? "" : route.replace(/(\/\/)/g, "/");
    const withSlash = withoutSlash + "/";
    target.set(withoutSlash, func);
    if (!(withoutSlash === "" && this.root === "/")) {
      target.set(withSlash, func);
    }
  }

  /**
   * Register a GET endpoint
   * 
   * @param route - URI to call this function
   * @param func - The function that will be run when this endpoint is called.
   */
  public get(
    route: string,
    func: (req: ServerRequest, vars: RouteVariables) => void,
  ) {
    this.process(route, func, this._get);
  }

  /**
   * Register a POST endpoint
   * 
   * @param route - URI to call this function
   * @param func - The function that will be run when this endpoint is called.
   */
  public post(
    route: string,
    func: (req: ServerRequest, vars: RouteVariables) => void,
  ) {
    this.process(route, func, this._post);
  }

  /**
   * Register a PUT endpoint
   * 
   * @param route - URI to call this function
   * @param func - The function that will be run when this endpoint is called.
   */
  public put(
    route: string,
    func: (req: ServerRequest, vars: RouteVariables) => void,
  ) {
    this.process(route, func, this._put);
  }

  /**
   * Register a DELETE endpoint
   * 
   * @param route - URI to call this function
   * @param func - The function that will be run when this endpoint is called.
   */
  public delete(
    route: string,
    func: (req: ServerRequest, vars: RouteVariables) => void,
  ) {
    this.process(route, func, this._delete);
  }

  /**
   * Register a HEAD endpoint
   * 
   * @param route - URI to call this function
   * @param func - The function that will be run when this endpoint is called.
   */
  public head(
    route: string,
    func: (req: ServerRequest, vars: RouteVariables) => void,
  ) {
    this.process(route, func, this._head);
  }

  /**
   * Register an OPTIONS endpoint
   * 
   * @param route - URI to call this function
   * @param func - The function that will be run when this endpoint is called.
   */
  public options(
    route: string,
    func: (req: ServerRequest, vars: RouteVariables) => void,
  ) {
    this.process(route, func, this._options);
  }

  /**
   * Register a PATCH endpoint
   * 
   * @param route - URI to call this function
   * @param func - The function that will be run when this endpoint is called.
   */
  public patch(
    route: string,
    func: (req: ServerRequest, vars: RouteVariables) => void,
  ) {
    this.process(route, func, this._patch);
  }

  /**
   * Getter used to register all endpoints in this router with the Server.
   */
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
