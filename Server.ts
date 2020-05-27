import { Endpoint, EndpointRoutes, QueryType, EndpointMap } from "./types.ts";
import {
  listenAndServe,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import { exists } from "https://deno.land/std/fs/exists.ts";
import { StaticHandler } from "./StaticHandler.ts";

export class Server {
  private routes: Map<string, EndpointRoutes> = new Map();
  private staticHandler: StaticHandler | undefined;

  public use(endpoint: Endpoint) {
    const endpoints: EndpointRoutes = new Map();

    endpoints.set(QueryType.GET, endpoint.routes.getRoutes);
    endpoints.set(QueryType.POST, endpoint.routes.postRoutes);
    endpoints.set(QueryType.PUT, endpoint.routes.putRoutes);
    endpoints.set(QueryType.DELETE, endpoint.routes.deleteRoutes);
    endpoints.set(QueryType.HEAD, endpoint.routes.headRoutes);
    endpoints.set(QueryType.PATCH, endpoint.routes.patchRoutes);
    endpoints.set(QueryType.OPTIONS, endpoint.routes.optionsRoutes);

    this.routes.set(endpoint.uri, endpoints);
  }

  public async static(localFolderPath: string, urlPrefix: string = "") {
    if (!(await exists(localFolderPath))) {
      return;
    }
    this.staticHandler = new StaticHandler(localFolderPath, urlPrefix);
  }

  private async listenAndServeHandler(req: ServerRequest) {
    for (const [routePrefix, routePrefixEndpoints] of this.routes) {
      let methodRoutes: EndpointMap | undefined = routePrefixEndpoints.get(
        req.method as QueryType,
      );
      if (methodRoutes) {
        for (const [endpoint, func] of methodRoutes) {
          const [url, queryString] = req.url.split("?");
          const query: {
            [key: string]: string;
          } = {};

          if (queryString) {
            for (const param of queryString.split("&")) {
              const [key, value] = param.split("=");

              query[key] = value;
            }
          }

          if (url === (routePrefix + endpoint).replace(/(\/\/)/g, "/")) {
            func({
              req,
              query
            });
            return;
          }
        }
      }
    }

    if (
      this.staticHandler &&
      req.url.indexOf(this.staticHandler.staticUrlPrefix) === 0
    ) {
      this.staticHandler.process(req);
      return;
    }

    req.respond({ status: 404 });
  }

  public async start(config: Deno.ListenOptions) {
    listenAndServe(config, this.listenAndServeHandler.bind(this));
    return config;
  }
}
