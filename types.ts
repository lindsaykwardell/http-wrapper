import {
  ServerRequest,
} from "https://deno.land/std/http/server.ts";

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
