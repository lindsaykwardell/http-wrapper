import { Request } from "./types.ts";
import { Router } from "./Router.ts";
import {
  acceptWebSocket,
  acceptable,
  WebSocket,
  isWebSocketCloseEvent,
} from "https://deno.land/std/ws/mod.ts";
import { v4 } from "https://deno.land/std/uuid/mod.ts";

export class Socket {
  private router: Router;
  private connections: Map<string, WebSocket> = new Map();
  private events: Map<
    string,
    (msg: Broadcast, connId: string) => void
  > = new Map();

  constructor(route: string = "/ws") {
    this.router = new Router(route);

    this.router.get("/", this.conn.bind(this));
  }

  public get routes() {
    return this.router.routes;
  }

  public conn({ req }: Request): void {
    if (acceptable(req)) {
      acceptWebSocket({
        conn: req.conn,
        bufReader: req.r,
        bufWriter: req.w,
        headers: req.headers,
      }).then(async (ws: WebSocket) => {
        const connId = v4.generate();

        this.connections.set(connId, ws);

        this.broadcast({
          from: connId,
          event: "connect",
          body: `${connId} has connected`,
        });

        for await (const event of ws) {
          try {
            const msg: Broadcast = typeof event === "string"
              ? JSON.parse(event)
              : null;

            if (msg && msg.event) {
              this.events.get(msg.event)?.(msg, connId);
            } else if (!msg && isWebSocketCloseEvent(event)) {
              this.connections.delete(connId);

              this.broadcast({
                from: connId,
                event: "disconnect",
                body: `${connId} has disconnected`,
              });

              break;
            }
          } catch (e) {
            console.error(e);
            // Do nothing
          }
        }
      });
    }
  }

  public on(event: string, func: (msg: Broadcast, connId: string) => void) {
    this.events.set(event, func);
  }

  public emit(
    event: string,
    body: any,
    options?: {
      to?: string;
      from?: string;
    },
  ) {
    this.broadcast({
      event,
      body,
      to: options?.to,
      from: options?.from,
    });
  }

  public broadcast(msg: Broadcast): void {
    if (!msg.body) return;

    if (msg.to) {
      const conn = this.connections.get(msg.to);
      if (!conn) return;

      conn.send(JSON.stringify(msg));
    } else {
      for (const conn of this.connections.values()) {
        conn.send(JSON.stringify(msg));
      }
    }
  }
}

type Broadcast = {
  from?: string;
  to?: string;
  event?: string;
  body: any;
};
