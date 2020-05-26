import { ServerRequest } from "https://deno.land/std/http/server.ts";
import { parse, join, sep } from "https://deno.land/std/path/mod.ts";
import { contentType } from "https://deno.land/x/media_types/mod.ts";

export class StaticHandler {
  private localFolderPath: string = "";
  public staticUrlPrefix: string = "";

  constructor(localFolderPath: string, urlPrefix: string = "") {
    this.localFolderPath = localFolderPath;
    this.staticUrlPrefix = urlPrefix;
    if (!urlPrefix) {
      this.staticUrlPrefix = parse(localFolderPath).base;
    }
    if (this.staticUrlPrefix[0] !== "/") {
      this.staticUrlPrefix = `/${this.staticUrlPrefix}`;
    }
  }

  public async process(req: ServerRequest) {
    let responseObject: any = { status: 200 };
    try {
      let localFile = join(
        this.localFolderPath,
        req.url.replace(this.staticUrlPrefix, "").replace("/", sep)
      );

      if (localFile === this.localFolderPath) {
        localFile += "/index.html";
      }

      let data = await Deno.readFile(localFile);
      if (!data) {
        throw new Deno.errors.NotFound();
      }
      responseObject.body = data;
      responseObject.headers = new Headers({
        "content-type":
          contentType(localFile.split(".").reverse()[0]) ||
          "application/octet-stream",
      });
    } catch (error) {
      responseObject.status = 401;
      if (error.name === "NotFound") {
        responseObject.status = 404;
      }
    }
    req.respond(responseObject);
  }
}
