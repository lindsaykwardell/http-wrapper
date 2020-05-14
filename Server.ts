import { Endpoint, EndpointRoutes, QueryType } from "./types.ts";
import {
  listenAndServe,
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
