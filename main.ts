import {
  Application,
  Context,
  Router,
  Status,
} from "https://deno.land/x/oak/mod.ts";
import * as mod from "https://deno.land/std/fs/mod.ts";

(async () => {
  const router = new Router();
  router
    .get("/", (ctx: Context) => {
      ctx.response.body = "Hello World!";
    })
    .get("/read", async (ctx: Context) => {
      const text = await mod.readFileStr("./test.txt");
      ctx.response.body = text;
    })
    .get<{ param: string }>("/write/:param", async (ctx: Context) => {
      await mod.writeFileStr("./test.txt", ctx.params.param);
      const text = await mod.readFileStr("./test.txt");
      ctx.response.body = text;
    });

  const app = new Application();

  // Logger
  app.use(async (context, next) => {
    await next();
    const responseTime = context.response.headers.get("X-Response-Time");
    console.log(
      `${context.request.method} ${context.request.url} - ${responseTime}`,
    );
  });

  // Response Time
  app.use(async (context, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    context.response.headers.set("X-Response-Time", `${ms}ms`);
  });

  // Use the router
  app.use(router.routes());
  app.use(router.allowedMethods());

  // A basic 404 page
  app.use(notFound);
})();
