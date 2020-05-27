import { contentType } from "https://deno.land/x/media_types/mod.ts";
import { Endpoint, EndpointRoutes, QueryType, EndpointMap } from "./types.ts";
import {
  listenAndServe,
  ServerRequest,
} from "https://deno.land/std/http/server.ts";
import { exists } from "https://deno.land/std/fs/exists.ts";
import { StaticHandler } from "./StaticHandler.ts";
import xmlParse from "https://denopkg.com/nekobato/deno-xml-parser/index.ts";

export class Server {
  private routes: Map<string, EndpointRoutes> = new Map();
  private staticHandler: StaticHandler | undefined;
  private bodyParsers: Map<string, (body: string) => any> = new Map();

  constructor() {
    this.bodyParsers.set("application/json", JSON.parse);
    this.bodyParsers.set("application/x-www-form-urlencoded", (body) => {
      const bodyObj: { [key: string]: string } = {};

      const formBits = body.split("&");
      for (const bit of formBits) {
        const [key, val] = bit.split("=");
        bodyObj[decodeURIComponent(key)] = decodeURIComponent(val);
      }

      return bodyObj;
    });
    this.bodyParsers.set("application/xml", xmlParse);
  }

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

  public useParser(contentType: string, func: (body: string) => any): void {
    this.bodyParsers.set(contentType, func);
  }

  public async static(localFolderPath: string, urlPrefix: string = "") {
    if (!(await exists(localFolderPath))) {
      return;
    }
    this.staticHandler = new StaticHandler(localFolderPath, urlPrefix);
  }

  private async listenAndServeHandler(req: ServerRequest) {
    const [url, queryString] = req.url.split("?");

    const pathBits = this.parsePathBits(url);

    const query: {
      [key: string]: string;
    } = {};

    if (queryString) {
      for (const param of queryString.split("&")) {
        const [key, value] = param.split("=");

        query[key] = value;
      }
    }

    for (const [routePrefix, routePrefixEndpoints] of this.routes) {
      let methodRoutes: EndpointMap | undefined = routePrefixEndpoints.get(
        req.method as QueryType,
      );
      if (methodRoutes) {
        for (const [endpoint, func] of methodRoutes) {
          const route = (routePrefix + endpoint).replace(/(\/\/)/g, "/");
          if (
            url === route ||
            this.doesRouteMatch(
              pathBits,
              this.parsePathBits(
                route,
              ),
            )
          ) {
            const param: { [key: string]: string } = {};
            if (route.includes("{")) {
              this.parsePathBits(route).forEach((bit, index) => {
                if (bit.match(/{([A-Z, a-z,0-9]+)}/)) {
                  const key = bit.replace("{", "").replace("}", "");

                  param[key] = pathBits[index];
                }
              });
            }

            func(req, {
              query,
              param,
              body: this.parseBody(
                new TextDecoder("utf-8").decode(
                  await Deno.readAll(req.body),
                ),
                req.headers,
              ),
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

  private parsePathBits(path: string): string[] {
    const bits = path.split("/");
    bits.shift();
    return bits;
  }

  private doesRouteMatch(req: string[], route: string[]): boolean {
    if (req.length !== route.length) return false;

    for (let i = 0; i < route.length; i++) {
      if (
        !(req[i] === route[i] || route[i].match(/{([A-Z, a-z,0-9]+)}/))
      ) {
        return false;
      }
    }
    return true;
  }

  private parseBody(body: string, headers: Headers): any {
    const contentType = headers.get("content-type");

    if (!contentType) return body;

    try {
      if (this.bodyParsers.get(contentType)) {
        return this.bodyParsers.get(contentType)?.(body);
      }
    } catch (e) {
      console.error(e);
      return {};
    }

    return body;
  }

  public async start(config: Deno.ListenOptions) {
    listenAndServe(config, this.listenAndServeHandler.bind(this));
    return config;
  }
}
