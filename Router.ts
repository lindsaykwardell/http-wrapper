import {
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import { Endpoint, EndpointMap } from "./types.ts";

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
