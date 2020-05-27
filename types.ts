import { ServerRequest } from "https://deno.land/std/http/server.ts";

export enum QueryType {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  DELETE = "DELETE",
  OPTIONS = "OPTIONS",
  HEAD = "HEAD",
  PATCH = "PATCH",
}

export type EndpointMap = Map<string, (req: ServerRequest, vars: RouteVariables) => void>;
export type EndpointRoutes = Map<QueryType, EndpointMap>;

export type Endpoint = {
  uri: string;
  routes: {
    getRoutes: EndpointMap;
    postRoutes: EndpointMap;
    putRoutes: EndpointMap;
    deleteRoutes: EndpointMap;
    optionsRoutes: EndpointMap;
    headRoutes: EndpointMap;
    patchRoutes: EndpointMap;
  };
};

export type RouteVariables = {
  query: {
    [key: string]: string;
  };
  param: {
    [key: string]: string;
  },
  body: any
};
