import { ParsedUrlQuery } from "querystring";
import Koa, { Context } from "koa";
import KoaRouter from "koa-router";
import koaBody from "koa-body";
import glob from "glob";
import cors from "koa2-cors";

interface BaseResponse {
  status: number;
  data: unknown;
  message: string;
}
export interface MockModule {
  url: string;
  method: "get" | "post" | "put" | "delete";
  data: BaseResponse | ((query: ParsedUrlQuery, data: unknown) => BaseResponse);
  timeout?: number; // 模拟接口延迟时间
}

function sleep(timeout?: number) {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

const app = new Koa();
const router = new KoaRouter();

app.use(koaBody());
app.use(cors());
app.use(router.routes());

glob(".mock/**/*.js", function (_, files) {
  files.forEach(async (file) => {
    const modules = (await import(`${process.cwd()}/${file}`)).default as MockModule[];
    modules.forEach?.((module) => {
      const { url, method, data, timeout } = module;
      router[method](url, async (ctx: Context) => {
        const {
          status = 0,
          data: resData = null,
          message = "",
        } = typeof data === "function" ? data(ctx.query, ctx.request.body) : data;
        await sleep(timeout);
        ctx.body = JSON.stringify({
          status,
          data: resData,
          message,
        });
      });
    });
  });
});

app.listen(6789, () => {
  console.log("  > Mock-server running at: http://localhost:6789");
});
