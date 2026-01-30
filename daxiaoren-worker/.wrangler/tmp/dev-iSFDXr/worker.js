var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-N42Hmd/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// src/worker.js
var API_KEY = "d946d990667549baba87595dadb30b42.5r3iUUtIbhPQ5kwA";
var PROMPTS = {
  identify: {
    en: "You are a helpful assistant that identifies public figures, roles, or entities based on a user's search query for purpose of a 'Villain Hitting' game. Be precise with names. Return purely JSON.",
    zh: "\u4F60\u662F\u4E00\u4E2A\u901A\u8FC7\u641C\u7D22\u5E2E\u52A9\u7528\u6237\u8BC6\u522B\u4EBA\u7269\u3001\u804C\u4F4D\u6216\u5B9E\u4F53\u7684\u52A9\u624B\uFF0C\u7528\u4E8E'\u6253\u5C0F\u4EBA'\u6E38\u620F\u3002\u8BF7\u51C6\u786E\u63D0\u53D6\u4EBA\u540D\u6216\u79F0\u8C13\u3002\u8BF7\u53EA\u8FD4\u56DEJSON\u683C\u5F0F\u3002"
  },
  ritual: {
    en: "You are a professional 'Villain Hitter' (Da Xiao Ren) practitioner. Generate a rhyming chant (4 lines) and a ritual instruction. Return JSON.",
    zh: "\u4F60\u662F\u4E00\u4F4D\u9999\u6E2F'\u6253\u5C0F\u4EBA'\u795E\u5A46\u3002\u521B\u4F5C4\u53E5\u62BC\u97F5\u53E3\u8BC0\u548C\u4E00\u53E5\u51FB\u6253\u6307\u5BFC\u3002\u8FD4\u56DEJSON\u683C\u5F0F\u3002"
  },
  resolution: {
    en: "You are a wise life coach. Provide a blessing and advice after the ritual. Return JSON.",
    zh: "\u4F60\u662F\u4E00\u4F4D\u667A\u6167\u7684\u5FC3\u7406\u7597\u6108\u5E08\u3002\u4EEA\u5F0F\u7ED3\u675F\u540E\u7ED9\u51FA\u795D\u798F\u548C\u5EFA\u8BAE\u3002\u8FD4\u56DEJSON\u683C\u5F0F\u3002"
  }
};
async function callZhipuAI(messages, webSearch = false) {
  const payload = {
    model: "glm-4-flash",
    messages,
    temperature: 0.7,
    top_p: 0.9,
    thinking: { type: "enabled", clear_thinking: true },
    response_format: { type: "json_object" }
  };
  if (webSearch) {
    payload.tools = [{ type: "web_search", web_search: { enable: true } }];
  }
  const response = await fetch("https://open.bigmodel.cn/api/paas/v4/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${API_KEY}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Zhipu API Error: ${response.status} ${response.statusText} - ${err}`);
  }
  const data = await response.json();
  const message = data.choices[0]?.message;
  let result = message?.content || "{}";
  if (message && message.reasoning_content) {
    console.log("[Thinking] Reasoning content filtered out");
    result = message.content || "{}";
  }
  return result;
}
__name(callZhipuAI, "callZhipuAI");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
    try {
      const path = url.pathname;
      if (path === "/api/identify") {
        const { query, lang } = await request.json();
        const systemPrompt = PROMPTS.identify[lang] || PROMPTS.identify.zh;
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: lang === "en" ? `Who is: "${query}"? Return JSON with 'name', 'titleOrRole', 'reason'.` : `\u8BF7\u641C\u7D22\u5E76\u56DE\u7B54\uFF1A"${query}" \u662F\u8C01\uFF1F\u8BF7\u8FD4\u56DEJSON\u5BF9\u8C61\uFF0C\u5305\u542B 'name', 'titleOrRole', 'reason'\u3002` }
        ];
        const result = await callZhipuAI(messages, true);
        return new Response(result, {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/ritual") {
        const { villain, lang } = await request.json();
        const systemPrompt = PROMPTS.ritual[lang] || PROMPTS.ritual.zh;
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: lang === "en" ? `Target: '${villain.name}' (${villain.type}). Grievance: ${villain.reason || "General annoyance"}. Return JSON with 'chantLines' (array) and 'ritualInstruction' (string).` : `\u5BF9\u8C61\uFF1A'${villain.name}' (${villain.type})\u3002\u539F\u56E0\uFF1A${villain.reason || "\u8BF8\u4E8B\u4E0D\u987A"}\u3002\u8BF7\u8FD4\u56DEJSON\u5BF9\u8C61\uFF0C\u5305\u542B 'chantLines' (4\u53E5\u62BC\u97F5\u53E3\u8BC0\u6570\u7EC4) \u548C 'ritualInstruction' (\u51FB\u6253\u6307\u5BFC)\u3002` }
        ];
        const result = await callZhipuAI(messages, false);
        return new Response(result, {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      if (path === "/api/resolution") {
        const { villain, lang } = await request.json();
        const systemPrompt = PROMPTS.resolution[lang] || PROMPTS.resolution.zh;
        const messages = [
          { role: "system", content: systemPrompt },
          { role: "user", content: lang === "en" ? `The user has banished the villain: '${villain.name}'. Return JSON with 'blessing' (positive affirmation for the user) and 'advice' (how the user can protect themselves).` : `\u7528\u6237\u521A\u521A\u75DB\u6253\u4E86\u5C0F\u4EBA\uFF1A'${villain.name}'\u3002\u8BF7\u8FD4\u56DEJSON\u5BF9\u8C61\uFF1A'blessing' (\u7ED9\u7528\u6237\u7684\u8F6C\u8FD0\u795D\u798F)\uFF0C'advice' (\u7ED9\u7528\u6237\u7684\u9632\u5C0F\u4EBA\u5904\u4E16\u5EFA\u8BAE)\u3002\u4E25\u7981\u795D\u798F\u5C0F\u4EBA\uFF01` }
        ];
        const result = await callZhipuAI(messages, false);
        return new Response(result, {
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      console.error("Worker Error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      });
    }
  }
};

// C:/Users/fangruican/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/fangruican/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-N42Hmd/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// C:/Users/fangruican/AppData/Roaming/npm/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-N42Hmd/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.js.map
