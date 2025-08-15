import { hasInjectionContext, getCurrentInstance, createApp, provide, toRef, onErrorCaptured, onServerPrefetch, unref, createVNode, resolveDynamicComponent, shallowReactive, reactive, effectScope, computed, defineComponent, h, isReadonly, isRef, isShallow, isReactive, toRaw, inject, defineAsyncComponent, mergeProps, getCurrentScope, ref, readonly, useSSRContext } from 'vue';
import { h as hasProtocol, i as isScriptProtocol, k as joinURL, w as withQuery, s as sanitizeStatusCode, l as getContext, $ as $fetch, m as createHooks, c as createError$1, n as isEqual, o as stringifyParsedURL, p as stringifyQuery, q as parseQuery, t as toRouteMatcher, r as createRouter, v as defu } from '../nitro/nitro.mjs';
import { b as baseURL } from '../routes/renderer.mjs';
import { ssrRenderSuspense, ssrRenderComponent, ssrRenderVNode, ssrRenderAttrs, ssrRenderStyle, ssrRenderAttr, ssrInterpolate, ssrRenderClass, ssrRenderList, ssrIncludeBooleanAttr } from 'vue/server-renderer';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'unhead/plugins';

if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch.create({
    baseURL: baseURL()
  });
}
if (!("global" in globalThis)) {
  globalThis.global = globalThis;
}
const nuxtLinkDefaults = { "componentName": "NuxtLink" };
const appId = "nuxt-app";
function getNuxtAppCtx(id = appId) {
  return getContext(id, {
    asyncContext: false
  });
}
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  let hydratingCount = 0;
  const nuxtApp = {
    _id: options.id || appId || "nuxt-app",
    _scope: effectScope(),
    provide: void 0,
    globalName: "nuxt",
    versions: {
      get nuxt() {
        return "3.18.1";
      },
      get vue() {
        return nuxtApp.vueApp.version;
      }
    },
    payload: shallowReactive({
      ...options.ssrContext?.payload || {},
      data: shallowReactive({}),
      state: reactive({}),
      once: /* @__PURE__ */ new Set(),
      _errors: shallowReactive({})
    }),
    static: {
      data: {}
    },
    runWithContext(fn) {
      if (nuxtApp._scope.active && !getCurrentScope()) {
        return nuxtApp._scope.run(() => callWithNuxt(nuxtApp, fn));
      }
      return callWithNuxt(nuxtApp, fn);
    },
    isHydrating: false,
    deferHydration() {
      if (!nuxtApp.isHydrating) {
        return () => {
        };
      }
      hydratingCount++;
      let called = false;
      return () => {
        if (called) {
          return;
        }
        called = true;
        hydratingCount--;
        if (hydratingCount === 0) {
          nuxtApp.isHydrating = false;
          return nuxtApp.callHook("app:suspense:resolve");
        }
      };
    },
    _asyncDataPromises: {},
    _asyncData: shallowReactive({}),
    _payloadRevivers: {},
    ...options
  };
  {
    nuxtApp.payload.serverRendered = true;
  }
  if (nuxtApp.ssrContext) {
    nuxtApp.payload.path = nuxtApp.ssrContext.url;
    nuxtApp.ssrContext.nuxt = nuxtApp;
    nuxtApp.ssrContext.payload = nuxtApp.payload;
    nuxtApp.ssrContext.config = {
      public: nuxtApp.ssrContext.runtimeConfig.public,
      app: nuxtApp.ssrContext.runtimeConfig.app
    };
  }
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  {
    const contextCaller = async function(hooks, args) {
      for (const hook of hooks) {
        await nuxtApp.runWithContext(() => hook(...args));
      }
    };
    nuxtApp.hooks.callHook = (name, ...args) => nuxtApp.hooks.callHookWith(contextCaller, name, ...args);
  }
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  const runtimeConfig = options.ssrContext.runtimeConfig;
  nuxtApp.provide("config", runtimeConfig);
  return nuxtApp;
}
function registerPluginHooks(nuxtApp, plugin) {
  if (plugin.hooks) {
    nuxtApp.hooks.addHooks(plugin.hooks);
  }
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin === "function") {
    const { provide: provide2 } = await nuxtApp.runWithContext(() => plugin(nuxtApp)) || {};
    if (provide2 && typeof provide2 === "object") {
      for (const key in provide2) {
        nuxtApp.provide(key, provide2[key]);
      }
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  const resolvedPlugins = /* @__PURE__ */ new Set();
  const unresolvedPlugins = [];
  const parallels = [];
  let error = void 0;
  let promiseDepth = 0;
  async function executePlugin(plugin) {
    const unresolvedPluginsForThisPlugin = plugin.dependsOn?.filter((name) => plugins2.some((p) => p._name === name) && !resolvedPlugins.has(name)) ?? [];
    if (unresolvedPluginsForThisPlugin.length > 0) {
      unresolvedPlugins.push([new Set(unresolvedPluginsForThisPlugin), plugin]);
    } else {
      const promise = applyPlugin(nuxtApp, plugin).then(async () => {
        if (plugin._name) {
          resolvedPlugins.add(plugin._name);
          await Promise.all(unresolvedPlugins.map(async ([dependsOn, unexecutedPlugin]) => {
            if (dependsOn.has(plugin._name)) {
              dependsOn.delete(plugin._name);
              if (dependsOn.size === 0) {
                promiseDepth++;
                await executePlugin(unexecutedPlugin);
              }
            }
          }));
        }
      }).catch((e) => {
        if (!plugin.parallel && !nuxtApp.payload.error) {
          throw e;
        }
        error ||= e;
      });
      if (plugin.parallel) {
        parallels.push(promise);
      } else {
        await promise;
      }
    }
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    registerPluginHooks(nuxtApp, plugin);
  }
  for (const plugin of plugins2) {
    if (nuxtApp.ssrContext?.islandContext && plugin.env?.islands === false) {
      continue;
    }
    await executePlugin(plugin);
  }
  await Promise.all(parallels);
  if (promiseDepth) {
    for (let i = 0; i < promiseDepth; i++) {
      await Promise.all(parallels);
    }
  }
  if (error) {
    throw nuxtApp.payload.error || error;
  }
}
// @__NO_SIDE_EFFECTS__
function defineNuxtPlugin(plugin) {
  if (typeof plugin === "function") {
    return plugin;
  }
  const _name = plugin._name || plugin.name;
  delete plugin.name;
  return Object.assign(plugin.setup || (() => {
  }), plugin, { [NuxtPluginIndicator]: true, _name });
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => setup();
  const nuxtAppCtx = getNuxtAppCtx(nuxt._id);
  {
    return nuxt.vueApp.runWithContext(() => nuxtAppCtx.callAsync(nuxt, fn));
  }
}
function tryUseNuxtApp(id) {
  let nuxtAppInstance;
  if (hasInjectionContext()) {
    nuxtAppInstance = getCurrentInstance()?.appContext.app.$nuxt;
  }
  nuxtAppInstance ||= getNuxtAppCtx(id).tryUse();
  return nuxtAppInstance || null;
}
function useNuxtApp(id) {
  const nuxtAppInstance = tryUseNuxtApp(id);
  if (!nuxtAppInstance) {
    {
      throw new Error("[nuxt] instance unavailable");
    }
  }
  return nuxtAppInstance;
}
// @__NO_SIDE_EFFECTS__
function useRuntimeConfig(_event) {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const PageRouteSymbol = Symbol("route");
const useRouter = () => {
  return useNuxtApp()?.$router;
};
const useRoute = () => {
  if (hasInjectionContext()) {
    return inject(PageRouteSymbol, useNuxtApp()._route);
  }
  return useNuxtApp()._route;
};
// @__NO_SIDE_EFFECTS__
function defineNuxtRouteMiddleware(middleware) {
  return middleware;
}
const isProcessingMiddleware = () => {
  try {
    if (useNuxtApp()._processingMiddleware) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
};
const URL_QUOTE_RE = /"/g;
const navigateTo = (to, options) => {
  to ||= "/";
  const toPath = typeof to === "string" ? to : "path" in to ? resolveRouteObject(to) : useRouter().resolve(to).href;
  const isExternalHost = hasProtocol(toPath, { acceptRelative: true });
  const isExternal = options?.external || isExternalHost;
  if (isExternal) {
    if (!options?.external) {
      throw new Error("Navigating to an external URL is not allowed by default. Use `navigateTo(url, { external: true })`.");
    }
    const { protocol } = new URL(toPath, "http://localhost");
    if (protocol && isScriptProtocol(protocol)) {
      throw new Error(`Cannot navigate to a URL with '${protocol}' protocol.`);
    }
  }
  const inMiddleware = isProcessingMiddleware();
  const router = useRouter();
  const nuxtApp = useNuxtApp();
  {
    if (nuxtApp.ssrContext) {
      const fullPath = typeof to === "string" || isExternal ? toPath : router.resolve(to).fullPath || "/";
      const location2 = isExternal ? toPath : joinURL((/* @__PURE__ */ useRuntimeConfig()).app.baseURL, fullPath);
      const redirect = async function(response) {
        await nuxtApp.callHook("app:redirected");
        const encodedLoc = location2.replace(URL_QUOTE_RE, "%22");
        const encodedHeader = encodeURL(location2, isExternalHost);
        nuxtApp.ssrContext._renderResponse = {
          statusCode: sanitizeStatusCode(options?.redirectCode || 302, 302),
          body: `<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=${encodedLoc}"></head></html>`,
          headers: { location: encodedHeader }
        };
        return response;
      };
      if (!isExternal && inMiddleware) {
        router.afterEach((final) => final.fullPath === fullPath ? redirect(false) : void 0);
        return to;
      }
      return redirect(!inMiddleware ? void 0 : (
        /* abort route navigation */
        false
      ));
    }
  }
  if (isExternal) {
    nuxtApp._scope.stop();
    if (options?.replace) {
      (void 0).replace(toPath);
    } else {
      (void 0).href = toPath;
    }
    if (inMiddleware) {
      if (!nuxtApp.isHydrating) {
        return false;
      }
      return new Promise(() => {
      });
    }
    return Promise.resolve();
  }
  return options?.replace ? router.replace(to) : router.push(to);
};
function resolveRouteObject(to) {
  return withQuery(to.path || "", to.query || {}) + (to.hash || "");
}
function encodeURL(location2, isExternalHost = false) {
  const url = new URL(location2, "http://localhost");
  if (!isExternalHost) {
    return url.pathname + url.search + url.hash;
  }
  if (location2.startsWith("//")) {
    return url.toString().replace(url.protocol, "");
  }
  return url.toString();
}
const NUXT_ERROR_SIGNATURE = "__nuxt_error";
const useError = () => toRef(useNuxtApp().payload, "error");
const showError = (error) => {
  const nuxtError = createError(error);
  try {
    const nuxtApp = useNuxtApp();
    const error2 = useError();
    if (false) ;
    error2.value ||= nuxtError;
  } catch {
    throw nuxtError;
  }
  return nuxtError;
};
const isNuxtError = (error) => !!error && typeof error === "object" && NUXT_ERROR_SIGNATURE in error;
const createError = (error) => {
  const nuxtError = createError$1(error);
  Object.defineProperty(nuxtError, NUXT_ERROR_SIGNATURE, {
    value: true,
    configurable: false,
    writable: false
  });
  return nuxtError;
};
const unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:head",
  enforce: "pre",
  setup(nuxtApp) {
    const head = nuxtApp.ssrContext.head;
    nuxtApp.vueApp.use(head);
  }
});
async function getRouteRules(arg) {
  const path = typeof arg === "string" ? arg : arg.path;
  {
    useNuxtApp().ssrContext._preloadManifest = true;
    const _routeRulesMatcher = toRouteMatcher(
      createRouter({ routes: (/* @__PURE__ */ useRuntimeConfig()).nitro.routeRules })
    );
    return defu({}, ..._routeRulesMatcher.matchAll(path).reverse());
  }
}
const manifest_45route_45rule = /* @__PURE__ */ defineNuxtRouteMiddleware(async (to) => {
  {
    return;
  }
});
const globalMiddleware = [
  manifest_45route_45rule
];
function getRouteFromPath(fullPath) {
  const route = fullPath && typeof fullPath === "object" ? fullPath : {};
  if (typeof fullPath === "object") {
    fullPath = stringifyParsedURL({
      pathname: fullPath.path || "",
      search: stringifyQuery(fullPath.query || {}),
      hash: fullPath.hash || ""
    });
  }
  const url = new URL(fullPath.toString(), "http://localhost");
  return {
    path: url.pathname,
    fullPath,
    query: parseQuery(url.search),
    hash: url.hash,
    // stub properties for compat with vue-router
    params: route.params || {},
    name: void 0,
    matched: route.matched || [],
    redirectedFrom: void 0,
    meta: route.meta || {},
    href: fullPath
  };
}
const router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:router",
  enforce: "pre",
  setup(nuxtApp) {
    const initialURL = nuxtApp.ssrContext.url;
    const routes = [];
    const hooks = {
      "navigate:before": [],
      "resolve:before": [],
      "navigate:after": [],
      "error": []
    };
    const registerHook = (hook, guard) => {
      hooks[hook].push(guard);
      return () => hooks[hook].splice(hooks[hook].indexOf(guard), 1);
    };
    (/* @__PURE__ */ useRuntimeConfig()).app.baseURL;
    const route = reactive(getRouteFromPath(initialURL));
    async function handleNavigation(url, replace) {
      try {
        const to = getRouteFromPath(url);
        for (const middleware of hooks["navigate:before"]) {
          const result = await middleware(to, route);
          if (result === false || result instanceof Error) {
            return;
          }
          if (typeof result === "string" && result.length) {
            return handleNavigation(result, true);
          }
        }
        for (const handler of hooks["resolve:before"]) {
          await handler(to, route);
        }
        Object.assign(route, to);
        if (false) ;
        for (const middleware of hooks["navigate:after"]) {
          await middleware(to, route);
        }
      } catch (err) {
        for (const handler of hooks.error) {
          await handler(err);
        }
      }
    }
    const currentRoute = computed(() => route);
    const router = {
      currentRoute,
      isReady: () => Promise.resolve(),
      // These options provide a similar API to vue-router but have no effect
      options: {},
      install: () => Promise.resolve(),
      // Navigation
      push: (url) => handleNavigation(url),
      replace: (url) => handleNavigation(url),
      back: () => (void 0).history.go(-1),
      go: (delta) => (void 0).history.go(delta),
      forward: () => (void 0).history.go(1),
      // Guards
      beforeResolve: (guard) => registerHook("resolve:before", guard),
      beforeEach: (guard) => registerHook("navigate:before", guard),
      afterEach: (guard) => registerHook("navigate:after", guard),
      onError: (handler) => registerHook("error", handler),
      // Routes
      resolve: getRouteFromPath,
      addRoute: (parentName, route2) => {
        routes.push(route2);
      },
      getRoutes: () => routes,
      hasRoute: (name) => routes.some((route2) => route2.name === name),
      removeRoute: (name) => {
        const index = routes.findIndex((route2) => route2.name === name);
        if (index !== -1) {
          routes.splice(index, 1);
        }
      }
    };
    nuxtApp.vueApp.component("RouterLink", defineComponent({
      functional: true,
      props: {
        to: {
          type: String,
          required: true
        },
        custom: Boolean,
        replace: Boolean,
        // Not implemented
        activeClass: String,
        exactActiveClass: String,
        ariaCurrentValue: String
      },
      setup: (props, { slots }) => {
        const navigate = () => handleNavigation(props.to, props.replace);
        return () => {
          const route2 = router.resolve(props.to);
          return props.custom ? slots.default?.({ href: props.to, navigate, route: route2 }) : h("a", { href: props.to, onClick: (e) => {
            e.preventDefault();
            return navigate();
          } }, slots);
        };
      }
    }));
    nuxtApp._route = route;
    nuxtApp._middleware ||= {
      global: [],
      named: {}
    };
    const initialLayout = nuxtApp.payload.state._layout;
    nuxtApp.hooks.hookOnce("app:created", async () => {
      router.beforeEach(async (to, from) => {
        to.meta = reactive(to.meta || {});
        if (nuxtApp.isHydrating && initialLayout && !isReadonly(to.meta.layout)) {
          to.meta.layout = initialLayout;
        }
        nuxtApp._processingMiddleware = true;
        if (!nuxtApp.ssrContext?.islandContext) {
          const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
          {
            const routeRules = await nuxtApp.runWithContext(() => getRouteRules({ path: to.path }));
            if (routeRules.appMiddleware) {
              for (const key in routeRules.appMiddleware) {
                const guard = nuxtApp._middleware.named[key];
                if (!guard) {
                  return;
                }
                if (routeRules.appMiddleware[key]) {
                  middlewareEntries.add(guard);
                } else {
                  middlewareEntries.delete(guard);
                }
              }
            }
          }
          for (const middleware of middlewareEntries) {
            const result = await nuxtApp.runWithContext(() => middleware(to, from));
            {
              if (result === false || result instanceof Error) {
                const error = result || createError$1({
                  statusCode: 404,
                  statusMessage: `Page Not Found: ${initialURL}`,
                  data: {
                    path: initialURL
                  }
                });
                delete nuxtApp._processingMiddleware;
                return nuxtApp.runWithContext(() => showError(error));
              }
            }
            if (result === true) {
              continue;
            }
            if (result || result === false) {
              return result;
            }
          }
        }
      });
      router.afterEach(() => {
        delete nuxtApp._processingMiddleware;
      });
      await router.replace(initialURL);
      if (!isEqual(route.fullPath, initialURL)) {
        await nuxtApp.runWithContext(() => navigateTo(route.fullPath));
      }
    });
    return {
      provide: {
        route,
        router
      }
    };
  }
});
function definePayloadReducer(name, reduce) {
  {
    useNuxtApp().ssrContext._payloadReducers[name] = reduce;
  }
}
const reducers = [
  ["NuxtError", (data) => isNuxtError(data) && data.toJSON()],
  ["EmptyShallowRef", (data) => isRef(data) && isShallow(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["EmptyRef", (data) => isRef(data) && !data.value && (typeof data.value === "bigint" ? "0n" : JSON.stringify(data.value) || "_")],
  ["ShallowRef", (data) => isRef(data) && isShallow(data) && data.value],
  ["ShallowReactive", (data) => isReactive(data) && isShallow(data) && toRaw(data)],
  ["Ref", (data) => isRef(data) && data.value],
  ["Reactive", (data) => isReactive(data) && toRaw(data)]
];
const revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:revive-payload:server",
  setup() {
    for (const [reducer, fn] of reducers) {
      definePayloadReducer(reducer, fn);
    }
  }
});
const components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4 = /* @__PURE__ */ defineNuxtPlugin({
  name: "nuxt:global-components"
});
const plugins = [
  unhead_k2P3m_ZDyjlr2mMYnoDPwavjsDN8hBlk9cFai0bbopU,
  router_DclsWNDeVV7SyG4lslgLnjbQUK1ws8wgf2FHaAbo7Cw,
  revive_payload_server_MVtmlZaQpj6ApFmshWfUWl5PehCebzaBf2NuRMiIbms,
  components_plugin_z4hgvsiddfKkfXTP6M8M4zG5Cb7sGnDhcryKVM45Di4
];
function useTheme() {
  const isDark = ref(true);
  const toggleTheme = () => {
    isDark.value = !isDark.value;
    localStorage.setItem("crypto-theme", isDark.value ? "dark" : "light");
    applyTheme();
  };
  const applyTheme = () => {
    if (isDark.value) {
      (void 0).documentElement.classList.add("dark");
      (void 0).documentElement.classList.remove("light");
    } else {
      (void 0).documentElement.classList.add("light");
      (void 0).documentElement.classList.remove("dark");
    }
  };
  return {
    isDark: readonly(isDark),
    toggleTheme
  };
}
const useMobileMenu = () => {
  const isMobileMenuOpen = ref(false);
  const toggleMobileMenu = () => {
    isMobileMenuOpen.value = !isMobileMenuOpen.value;
  };
  const closeMobileMenu = () => {
    isMobileMenuOpen.value = false;
  };
  return {
    isMobileMenuOpen: readonly(isMobileMenuOpen),
    toggleMobileMenu,
    closeMobileMenu
  };
};
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$b = {
  __name: "CryptoHeader",
  __ssrInlineRender: true,
  setup(__props) {
    const { isDark } = useTheme();
    const { isMobileMenuOpen } = useMobileMenu();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-sky-200/50 shadow-lg" }, _attrs))} data-v-8b2cb7ee><div class="container-custom" data-v-8b2cb7ee><nav class="flex items-center justify-between py-4" data-v-8b2cb7ee><div class="flex items-center space-x-3" data-v-8b2cb7ee><div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-glow" data-v-8b2cb7ee><span class="text-2xl" data-v-8b2cb7ee>🚀</span></div><div data-v-8b2cb7ee><h1 class="text-xl font-bold text-gray-900" data-v-8b2cb7ee>CryptoGroup</h1><p class="text-xs text-sky-600 font-medium" data-v-8b2cb7ee>Premium Crypto Community</p></div></div><div class="hidden lg:flex items-center space-x-8" data-v-8b2cb7ee><a href="#home" class="nav-link text-sm font-medium" data-v-8b2cb7ee>Home</a><a href="#about" class="nav-link text-sm font-medium" data-v-8b2cb7ee>About</a><a href="#features" class="nav-link text-sm font-medium" data-v-8b2cb7ee>Features</a><a href="#membership" class="nav-link text-sm font-medium" data-v-8b2cb7ee>Membership</a><a href="#testimonials" class="nav-link text-sm font-medium" data-v-8b2cb7ee>Stories</a><a href="#market" class="nav-link text-sm font-medium" data-v-8b2cb7ee>Market</a></div><div class="hidden lg:flex items-center space-x-4" data-v-8b2cb7ee><button class="p-2 rounded-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200 text-sky-600"${ssrRenderAttr("title", unref(isDark) ? "Switch to Light Mode" : "Switch to Dark Mode")} data-v-8b2cb7ee>`);
      if (unref(isDark)) {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8b2cb7ee><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" data-v-8b2cb7ee></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8b2cb7ee><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" data-v-8b2cb7ee></path></svg>`);
      }
      _push(`</button><button class="px-4 py-2 text-sky-600 hover:text-sky-700 transition-colors duration-200 font-medium" data-v-8b2cb7ee> Sign In </button><a href="#membership" class="btn-primary text-sm" data-v-8b2cb7ee> Join Community </a></div><button class="lg:hidden p-2 rounded-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200 text-sky-600" data-v-8b2cb7ee><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8b2cb7ee>`);
      if (!unref(isMobileMenuOpen)) {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-v-8b2cb7ee></path>`);
      } else {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-8b2cb7ee></path>`);
      }
      _push(`</svg></button></nav><div style="${ssrRenderStyle(unref(isMobileMenuOpen) ? null : { display: "none" })}" class="lg:hidden py-4 border-t border-sky-200/50 animate-fade-in-down bg-white/95 backdrop-blur-sm rounded-b-2xl shadow-lg" data-v-8b2cb7ee><div class="flex flex-col space-y-4" data-v-8b2cb7ee><a href="#home" class="nav-link text-base font-medium py-2" data-v-8b2cb7ee>Home</a><a href="#about" class="nav-link text-base font-medium py-2" data-v-8b2cb7ee>About</a><a href="#features" class="nav-link text-base font-medium py-2" data-v-8b2cb7ee>Features</a><a href="#membership" class="nav-link text-base font-medium py-2" data-v-8b2cb7ee>Membership</a><a href="#testimonials" class="nav-link text-base font-medium py-2" data-v-8b2cb7ee>Stories</a><a href="#market" class="nav-link text-base font-medium py-2" data-v-8b2cb7ee>Market</a><div class="pt-4 border-t border-sky-200/50" data-v-8b2cb7ee><button class="w-full flex items-center justify-center p-3 mb-3 rounded-lg bg-sky-100 hover:bg-sky-200 transition-colors duration-200 text-sky-600" data-v-8b2cb7ee>`);
      if (unref(isDark)) {
        _push(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8b2cb7ee><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" data-v-8b2cb7ee></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-8b2cb7ee><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" data-v-8b2cb7ee></path></svg>`);
      }
      _push(`<span class="font-medium" data-v-8b2cb7ee>${ssrInterpolate(unref(isDark) ? "Light Mode" : "Dark Mode")}</span></button><a href="#membership" class="w-full btn-primary text-sm mb-3 block text-center" data-v-8b2cb7ee> Join Community </a><button class="w-full px-4 py-2 text-sky-600 hover:text-sky-700 transition-colors duration-200 font-medium" data-v-8b2cb7ee> Sign In </button></div></div></div></div></header>`);
    };
  }
};
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoHeader.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-8b2cb7ee"]]);
const _sfc_main$a = {
  __name: "CryptoHero",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "home",
        class: "relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      }, _attrs))} data-v-a0b39cf1><div class="absolute inset-0" data-v-a0b39cf1><div class="absolute top-20 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse-slow" data-v-a0b39cf1></div><div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "1s" })}" data-v-a0b39cf1></div><div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-300/15 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-a0b39cf1></div></div><div class="container-custom relative z-10" data-v-a0b39cf1><div class="grid lg:grid-cols-2 gap-16 items-center" data-v-a0b39cf1><div class="text-center lg:text-left space-y-8" data-v-a0b39cf1><div class="inline-flex items-center px-4 py-2 bg-sky-100/80 backdrop-blur-sm border border-sky-300/50 rounded-full text-sm font-medium text-sky-700 shadow-lg" data-v-a0b39cf1><span class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse" data-v-a0b39cf1></span> Join 10,000+ Crypto Enthusiasts </div><h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight" data-v-a0b39cf1><span class="text-gray-900" data-v-a0b39cf1>Join the Ultimate</span><br data-v-a0b39cf1><span class="text-gradient-primary" data-v-a0b39cf1>Crypto Group</span></h1><p class="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0" data-v-a0b39cf1> Connect with crypto experts, get exclusive insights, and access premium opportunities in our thriving community of traders, developers, and investors. </p><div class="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0" data-v-a0b39cf1><div class="community-stat" data-v-a0b39cf1><div class="text-2xl font-bold text-sky-600" data-v-a0b39cf1>10K+</div><div class="text-sm text-gray-600" data-v-a0b39cf1>Active Members</div></div><div class="community-stat" data-v-a0b39cf1><div class="text-2xl font-bold text-sky-600" data-v-a0b39cf1>50+</div><div class="text-sm text-gray-600" data-v-a0b39cf1>Countries</div></div><div class="community-stat" data-v-a0b39cf1><div class="text-2xl font-bold text-sky-600" data-v-a0b39cf1>24/7</div><div class="text-sm text-gray-600" data-v-a0b39cf1>Support</div></div></div><div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" data-v-a0b39cf1><a href="#membership" class="btn-primary inline-flex items-center justify-center" data-v-a0b39cf1><span class="mr-2" data-v-a0b39cf1>🚀</span> Join Community </a><a href="#features" class="btn-outline inline-flex items-center justify-center" data-v-a0b39cf1><span class="mr-2" data-v-a0b39cf1>🔍</span> Explore Features </a></div><div class="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-500" data-v-a0b39cf1><div class="flex items-center" data-v-a0b39cf1><span class="w-4 h-4 bg-green-500 rounded-full mr-2" data-v-a0b39cf1></span> Verified Members Only </div><div class="flex items-center" data-v-a0b39cf1><span class="w-4 h-4 bg-sky-500 rounded-full mr-2" data-v-a0b39cf1></span> Secure &amp; Private </div></div></div><div class="relative" data-v-a0b39cf1><div class="space-y-4" data-v-a0b39cf1><div class="community-preview-card discord" data-v-a0b39cf1><div class="flex items-center justify-between mb-3" data-v-a0b39cf1><div class="flex items-center space-x-3" data-v-a0b39cf1><div class="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg" data-v-a0b39cf1><span class="text-white text-xl" data-v-a0b39cf1>💬</span></div><div data-v-a0b39cf1><h3 class="font-semibold text-gray-900" data-v-a0b39cf1>Discord Community</h3><p class="text-sm text-gray-600" data-v-a0b39cf1>5,000+ online now</p></div></div><div class="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full" data-v-a0b39cf1> Live </div></div><div class="text-sm text-gray-600" data-v-a0b39cf1><p data-v-a0b39cf1>🔥 Hot discussion: Bitcoin ETF impact</p><p data-v-a0b39cf1>📊 24 new market alerts today</p></div></div><div class="community-preview-card telegram" data-v-a0b39cf1><div class="flex items-center justify-between mb-3" data-v-a0b39cf1><div class="flex items-center space-x-3" data-v-a0b39cf1><div class="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg" data-v-a0b39cf1><span class="text-white text-xl" data-v-a0b39cf1>📱</span></div><div data-v-a0b39cf1><h3 class="font-semibold text-gray-900" data-v-a0b39cf1>Telegram Groups</h3><p class="text-sm text-gray-600" data-v-a0b39cf1>3,000+ members</p></div></div><div class="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full" data-v-a0b39cf1> Active </div></div><div class="text-sm text-gray-600" data-v-a0b39cf1><p data-v-a0b39cf1>💎 New presale opportunity</p><p data-v-a0b39cf1>🎯 Expert trading signals</p></div></div><div class="community-preview-card forum" data-v-a0b39cf1><div class="flex items-center justify-between mb-3" data-v-a0b39cf1><div class="flex items-center space-x-3" data-v-a0b39cf1><div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center shadow-lg" data-v-a0b39cf1><span class="text-white text-xl" data-v-a0b39cf1>📚</span></div><div data-v-a0b39cf1><h3 class="font-semibold text-gray-900" data-v-a0b39cf1>Knowledge Forum</h3><p class="text-sm text-gray-600" data-v-a0b39cf1>1,000+ topics</p></div></div><div class="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full" data-v-a0b39cf1> Updated </div></div><div class="text-sm text-gray-600" data-v-a0b39cf1><p data-v-a0b39cf1>📖 New DeFi guide published</p><p data-v-a0b39cf1>🎓 Beginner course available</p></div></div></div><div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full opacity-20 animate-float" data-v-a0b39cf1></div><div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-sky-300 to-blue-300 rounded-full opacity-20 animate-float" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-a0b39cf1></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoHero.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-a0b39cf1"]]);
const _sfc_main$9 = {
  __name: "CryptoAbout",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "about",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-1928669b><div class="absolute inset-0 bg-gradient-to-br from-sky-100/50 to-blue-100/50" data-v-1928669b></div><div class="container-custom relative z-10" data-v-1928669b><div class="grid lg:grid-cols-2 gap-16 items-center" data-v-1928669b><div class="space-y-8" data-v-1928669b><div class="inline-flex items-center px-4 py-2 bg-sky-100/80 backdrop-blur-sm border border-sky-300/50 rounded-full text-sm font-medium text-sky-700 shadow-lg" data-v-1928669b><span class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse" data-v-1928669b></span> About Our Crypto Group </div><h2 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight" data-v-1928669b> The Premier <span class="text-gradient-primary" data-v-1928669b>Crypto Community</span> for Enthusiasts </h2><p class="text-xl text-gray-600 leading-relaxed" data-v-1928669b> CryptoGroup is the ultimate destination for crypto enthusiasts, traders, developers, and investors. We&#39;re not just a platform – we&#39;re a thriving ecosystem where knowledge meets opportunity, and where beginners become experts. </p><div class="space-y-6" data-v-1928669b><div class="flex items-start space-x-4" data-v-1928669b><div class="w-12 h-12 bg-gradient-to-br from-sky-500/20 to-sky-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-sky-200/50" data-v-1928669b><span class="text-2xl" data-v-1928669b>🌍</span></div><div data-v-1928669b><h3 class="text-lg font-semibold text-gray-900 mb-2" data-v-1928669b>Global Community</h3><p class="text-gray-600" data-v-1928669b> Join thousands of members from over 50 countries, sharing knowledge and insights across different time zones and cultures. Our diverse community brings unique perspectives from every corner of the crypto world. </p></div></div><div class="flex items-start space-x-4" data-v-1928669b><div class="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-200/50" data-v-1928669b><span class="text-2xl" data-v-1928669b>🚀</span></div><div data-v-1928669b><h3 class="text-lg font-semibold text-gray-900 mb-2" data-v-1928669b>Innovation Hub</h3><p class="text-gray-600" data-v-1928669b> We&#39;re constantly exploring new technologies, from DeFi protocols to NFT marketplaces, staying ahead of the crypto curve. Our members are often the first to discover and discuss emerging trends. </p></div></div><div class="flex items-start space-x-4" data-v-1928669b><div class="w-12 h-12 bg-gradient-to-br from-sky-400/20 to-sky-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-sky-200/50" data-v-1928669b><span class="text-2xl" data-v-1928669b>🤝</span></div><div data-v-1928669b><h3 class="text-lg font-semibold text-gray-900 mb-2" data-v-1928669b>Collaborative Learning</h3><p class="text-gray-600" data-v-1928669b> Share strategies, discuss market trends, and learn from both beginners and seasoned professionals in our supportive environment. Every member has something valuable to contribute. </p></div></div><div class="flex items-start space-x-4" data-v-1928669b><div class="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-200/50" data-v-1928669b><span class="text-2xl" data-v-1928669b>💎</span></div><div data-v-1928669b><h3 class="text-lg font-semibold text-gray-900 mb-2" data-v-1928669b>Exclusive Opportunities</h3><p class="text-gray-600" data-v-1928669b> Get early access to promising projects, presales, and investment opportunities shared exclusively within our group. Our network of experts and insiders provides access you won&#39;t find elsewhere. </p></div></div></div><div class="flex flex-col sm:flex-row gap-4" data-v-1928669b><a href="#membership" class="btn-primary text-lg px-8 py-4" data-v-1928669b><span class="mr-2" data-v-1928669b>👥</span> Join Our Community </a><a href="#testimonials" class="btn-outline text-lg px-8 py-4" data-v-1928669b><span class="mr-2" data-v-1928669b>📖</span> Member Stories </a></div></div><div class="relative" data-v-1928669b><div class="grid grid-cols-2 gap-6" data-v-1928669b><div class="card-glass p-6 text-center" data-v-1928669b><div class="text-3xl font-bold text-sky-600 mb-2" data-v-1928669b>10K+</div><div class="text-gray-600" data-v-1928669b>Active Members</div></div><div class="card-glass p-6 text-center" data-v-1928669b><div class="text-3xl font-bold text-sky-600 mb-2" data-v-1928669b>50+</div><div class="text-gray-600" data-v-1928669b>Countries</div></div><div class="card-glass p-6 text-center" data-v-1928669b><div class="text-3xl font-bold text-sky-600 mb-2" data-v-1928669b>24/7</div><div class="text-gray-600" data-v-1928669b>Support</div></div><div class="card-glass p-6 text-center" data-v-1928669b><div class="text-3xl font-bold text-sky-600 mb-2" data-v-1928669b>100+</div><div class="text-gray-600" data-v-1928669b>Daily Discussions</div></div></div><div class="mt-8 card-glass p-6" data-v-1928669b><h4 class="text-lg font-semibold text-gray-900 mb-4" data-v-1928669b>Live Community Activity</h4><div class="space-y-3" data-v-1928669b><div class="flex items-center justify-between text-sm" data-v-1928669b><span class="text-gray-600" data-v-1928669b>Discord Online</span><span class="text-sky-600 font-semibold" data-v-1928669b>5,247</span></div><div class="flex items-center justify-between text-sm" data-v-1928669b><span class="text-gray-600" data-v-1928669b>New Messages (24h)</span><span class="text-sky-600 font-semibold" data-v-1928669b>12,843</span></div><div class="flex items-center justify-between text-sm" data-v-1928669b><span class="text-gray-600" data-v-1928669b>Active Threads</span><span class="text-sky-600 font-semibold" data-v-1928669b>156</span></div><div class="flex items-center justify-between text-sm" data-v-1928669b><span class="text-gray-600" data-v-1928669b>New Members Today</span><span class="text-sky-600 font-semibold" data-v-1928669b>47</span></div></div></div><div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full opacity-20 animate-float" data-v-1928669b></div><div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-sky-300 to-blue-300 rounded-full opacity-20 animate-float" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-1928669b></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoAbout.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-1928669b"]]);
const _sfc_main$8 = {
  __name: "CryptoFeatures",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "features",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-ef96cf79><div class="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-blue-50/50" data-v-ef96cf79></div><div class="container-custom relative z-10" data-v-ef96cf79><div class="text-center mb-16" data-v-ef96cf79><div class="inline-flex items-center px-4 py-2 bg-sky-100/80 backdrop-blur-sm border border-sky-300/50 rounded-full text-sm font-medium text-sky-700 mb-6 shadow-lg" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse" data-v-ef96cf79></span> Why Join Our Crypto Group? </div><h2 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6" data-v-ef96cf79> Exclusive <span class="text-gradient-primary" data-v-ef96cf79>Crypto Group</span> Benefits </h2><p class="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto" data-v-ef96cf79> Join our thriving crypto community and unlock exclusive benefits designed to accelerate your crypto journey </p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-v-ef96cf79><div class="feature-card group" data-v-ef96cf79><div class="feature-icon" data-v-ef96cf79><span class="text-3xl" data-v-ef96cf79>👥</span></div><h3 class="text-xl font-semibold text-gray-900 mb-4" data-v-ef96cf79>Exclusive Community Access</h3><p class="text-gray-600 mb-6" data-v-ef96cf79> Join our private Discord, Telegram, and forum communities with verified members only. Network with crypto professionals and enthusiasts. </p><ul class="space-y-2 text-gray-500 text-sm" data-v-ef96cf79><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Private Discord channels </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Telegram groups by expertise </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Member-only forums </li></ul></div><div class="feature-card group" data-v-ef96cf79><div class="feature-icon" data-v-ef96cf79><span class="text-3xl" data-v-ef96cf79>🧠</span></div><h3 class="text-xl font-semibold text-gray-900 mb-4" data-v-ef96cf79>Expert Insights &amp; Analysis</h3><p class="text-gray-600 mb-6" data-v-ef96cf79> Get daily market analysis, trading signals, and insights from our team of crypto experts and professional traders. </p><ul class="space-y-2 text-gray-500 text-sm" data-v-ef96cf79><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Daily market reports </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Trading signal alerts </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Expert Q&amp;A sessions </li></ul></div><div class="feature-card group" data-v-ef96cf79><div class="feature-icon" data-v-ef96cf79><span class="text-3xl" data-v-ef96cf79>📚</span></div><h3 class="text-xl font-semibold text-gray-900 mb-4" data-v-ef96cf79>Educational Resources</h3><p class="text-gray-600 mb-6" data-v-ef96cf79> Access our comprehensive library of crypto courses, tutorials, and resources for all skill levels. </p><ul class="space-y-2 text-gray-500 text-sm" data-v-ef96cf79><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Beginner to advanced courses </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Weekly webinars </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Resource library </li></ul></div><div class="feature-card group" data-v-ef96cf79><div class="feature-icon" data-v-ef96cf79><span class="text-3xl" data-v-ef96cf79>🎯</span></div><h3 class="text-xl font-semibold text-gray-900 mb-4" data-v-ef96cf79>Networking Events</h3><p class="text-gray-600 mb-6" data-v-ef96cf79> Attend exclusive meetups, conferences, and networking events with industry leaders and fellow crypto enthusiasts. </p><ul class="space-y-2 text-gray-500 text-sm" data-v-ef96cf79><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Local meetups </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Virtual conferences </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Industry networking </li></ul></div><div class="feature-card group" data-v-ef96cf79><div class="feature-icon" data-v-ef96cf79><span class="text-3xl" data-v-ef96cf79>💎</span></div><h3 class="text-xl font-semibold text-gray-900 mb-4" data-v-ef96cf79>Early Access &amp; Opportunities</h3><p class="text-gray-600 mb-6" data-v-ef96cf79> Get early access to promising projects, presales, and investment opportunities shared exclusively within our group. </p><ul class="space-y-2 text-gray-500 text-sm" data-v-ef96cf79><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Project presales </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> IDO access </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Private sales </li></ul></div><div class="feature-card group" data-v-ef96cf79><div class="feature-icon" data-v-ef96cf79><span class="text-3xl" data-v-ef96cf79>🛡️</span></div><h3 class="text-xl font-semibold text-gray-900 mb-4" data-v-ef96cf79>24/7 Support &amp; Moderation</h3><p class="text-gray-600 mb-6" data-v-ef96cf79> Enjoy a safe, moderated environment with round-the-clock support and active community management. </p><ul class="space-y-2 text-gray-500 text-sm" data-v-ef96cf79><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Active moderation </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Support tickets </li><li class="flex items-center" data-v-ef96cf79><span class="w-2 h-2 bg-sky-500 rounded-full mr-3" data-v-ef96cf79></span> Community guidelines </li></ul></div></div><div class="text-center mt-16" data-v-ef96cf79><div class="card-glass p-8 max-w-2xl mx-auto" data-v-ef96cf79><h3 class="text-2xl font-bold text-gray-900 mb-4" data-v-ef96cf79>Ready to Join Our Crypto Group?</h3><p class="text-gray-600 mb-6" data-v-ef96cf79> Don&#39;t miss out on the opportunity to connect with thousands of crypto enthusiasts and professionals. </p><div class="flex flex-col sm:flex-row gap-4 justify-center" data-v-ef96cf79><button class="btn-primary text-lg px-8 py-4" data-v-ef96cf79><span class="mr-2" data-v-ef96cf79>🚀</span> Join Now - Free </button><button class="btn-outline text-lg px-8 py-4" data-v-ef96cf79><span class="mr-2" data-v-ef96cf79>📋</span> View Membership Tiers </button></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoFeatures.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-ef96cf79"]]);
const _sfc_main$7 = {
  __name: "CryptoMembership",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "membership",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-1771ada9><div class="absolute inset-0 bg-gradient-to-br from-sky-100/50 to-blue-100/50" data-v-1771ada9></div><div class="container-custom relative z-10" data-v-1771ada9><div class="text-center mb-16" data-v-1771ada9><div class="inline-flex items-center px-4 py-2 bg-sky-100/80 backdrop-blur-sm border border-sky-300/50 rounded-full text-sm font-medium text-sky-700 mb-6 shadow-lg" data-v-1771ada9><span class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse" data-v-1771ada9></span> Choose Your Membership </div><h2 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6" data-v-1771ada9> Crypto Group <span class="text-gradient-primary" data-v-1771ada9>Membership Tiers</span></h2><p class="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto" data-v-1771ada9> Select the perfect membership level for your crypto journey. All tiers include access to our exclusive community. </p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" data-v-1771ada9><div class="membership-card" data-v-1771ada9><div class="membership-header" data-v-1771ada9><h3 class="text-2xl font-bold text-gray-900 mb-2" data-v-1771ada9>Free Member</h3><div class="text-4xl font-bold text-sky-600 mb-2" data-v-1771ada9>$0<span class="text-lg text-gray-500" data-v-1771ada9>/month</span></div><p class="text-gray-600" data-v-1771ada9>Perfect for crypto beginners</p></div><div class="membership-features" data-v-1771ada9><ul class="space-y-3" data-v-1771ada9><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Access to public channels</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Basic market updates</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Community forum access</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Weekly newsletter</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-gray-400 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-400 line-through" data-v-1771ada9>Premium channels</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-gray-400 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-400 line-through" data-v-1771ada9>Trading signals</span></li></ul></div><div class="membership-cta" data-v-1771ada9><button class="btn-outline w-full" data-v-1771ada9>Join Free</button></div></div><div class="membership-card featured" data-v-1771ada9><div class="membership-badge" data-v-1771ada9>Most Popular</div><div class="membership-header" data-v-1771ada9><h3 class="text-2xl font-bold text-gray-900 mb-2" data-v-1771ada9>Premium Member</h3><div class="text-4xl font-bold text-sky-600 mb-2" data-v-1771ada9>$29<span class="text-lg text-gray-500" data-v-1771ada9>/month</span></div><p class="text-gray-600" data-v-1771ada9>For active crypto enthusiasts</p></div><div class="membership-features" data-v-1771ada9><ul class="space-y-3" data-v-1771ada9><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Everything in Free</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Premium Discord channels</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Daily trading signals</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Expert Q&amp;A sessions</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Portfolio tracking tools</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Priority support</span></li></ul></div><div class="membership-cta" data-v-1771ada9><button class="btn-primary w-full" data-v-1771ada9>Join Premium</button></div></div><div class="membership-card" data-v-1771ada9><div class="membership-header" data-v-1771ada9><h3 class="text-2xl font-bold text-gray-900 mb-2" data-v-1771ada9>VIP Member</h3><div class="text-4xl font-bold text-sky-600 mb-2" data-v-1771ada9>$99<span class="text-lg text-gray-500" data-v-1771ada9>/month</span></div><p class="text-gray-600" data-v-1771ada9>For serious investors &amp; traders</p></div><div class="membership-features" data-v-1771ada9><ul class="space-y-3" data-v-1771ada9><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Everything in Premium</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>1-on-1 expert consultations</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Early access to presales</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Private investment group</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>Exclusive networking events</span></li><li class="flex items-center" data-v-1771ada9><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-1771ada9></span><span class="text-gray-700" data-v-1771ada9>24/7 VIP support</span></li></ul></div><div class="membership-cta" data-v-1771ada9><button class="btn-outline w-full" data-v-1771ada9>Join VIP</button></div></div></div><div class="text-center" data-v-1771ada9><h3 class="text-2xl font-bold text-gray-900 mb-8" data-v-1771ada9>All Members Get Access To:</h3><div class="grid md:grid-cols-4 gap-6" data-v-1771ada9><div class="benefit-item" data-v-1771ada9><div class="w-16 h-16 bg-gradient-to-br from-sky-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-sky-200/50" data-v-1771ada9><span class="text-2xl" data-v-1771ada9>📱</span></div><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>Mobile App</h4><p class="text-gray-600 text-sm" data-v-1771ada9>Access our community on the go</p></div><div class="benefit-item" data-v-1771ada9><div class="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-sky-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-200/50" data-v-1771ada9><span class="text-2xl" data-v-1771ada9>🎥</span></div><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>Video Content</h4><p class="text-gray-600 text-sm" data-v-1771ada9>Educational videos and tutorials</p></div><div class="benefit-item" data-v-1771ada9><div class="w-16 h-16 bg-gradient-to-br from-sky-400/20 to-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-sky-200/50" data-v-1771ada9><span class="text-2xl" data-v-1771ada9>📊</span></div><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>Market Tools</h4><p class="text-gray-600 text-sm" data-v-1771ada9>Charts, alerts, and analysis</p></div><div class="benefit-item" data-v-1771ada9><div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-200/50" data-v-1771ada9><span class="text-2xl" data-v-1771ada9>🎁</span></div><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>Rewards Program</h4><p class="text-gray-600 text-sm" data-v-1771ada9>Earn rewards for participation</p></div></div></div><div class="mt-16" data-v-1771ada9><h3 class="text-2xl font-bold text-gray-900 text-center mb-8" data-v-1771ada9>Frequently Asked Questions</h3><div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto" data-v-1771ada9><div class="faq-item" data-v-1771ada9><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>Can I cancel anytime?</h4><p class="text-gray-600" data-v-1771ada9>Yes, you can cancel your subscription at any time. No long-term commitments required.</p></div><div class="faq-item" data-v-1771ada9><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>Is there a free trial?</h4><p class="text-gray-600" data-v-1771ada9>Premium and VIP memberships come with a 7-day free trial to test all features.</p></div><div class="faq-item" data-v-1771ada9><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>How do I join the community?</h4><p class="text-gray-600" data-v-1771ada9>After signing up, you&#39;ll receive an email with links to join our Discord and Telegram groups.</p></div><div class="faq-item" data-v-1771ada9><h4 class="text-lg font-semibold text-gray-900 mb-2" data-v-1771ada9>Are trading signals profitable?</h4><p class="text-gray-600" data-v-1771ada9>While we provide analysis, all trading decisions are your own. Past performance doesn&#39;t guarantee future results.</p></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoMembership.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-1771ada9"]]);
const _sfc_main$6 = {
  __name: "CryptoTestimonials",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "testimonials",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-3bc96b74><div class="absolute inset-0 bg-gradient-to-br from-sky-50/50 to-blue-50/50" data-v-3bc96b74></div><div class="container-custom relative z-10" data-v-3bc96b74><div class="text-center mb-16" data-v-3bc96b74><div class="inline-flex items-center px-4 py-2 bg-sky-100/80 backdrop-blur-sm border border-sky-300/50 rounded-full text-sm font-medium text-sky-700 mb-6 shadow-lg" data-v-3bc96b74><span class="w-2 h-2 bg-sky-500 rounded-full mr-2 animate-pulse" data-v-3bc96b74></span> Community Success Stories </div><h2 class="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6" data-v-3bc96b74> What Our <span class="text-gradient-primary" data-v-3bc96b74>Crypto Group</span> Members Say </h2><p class="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto" data-v-3bc96b74> Hear from real members who have transformed their crypto journey through our community </p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" data-v-3bc96b74><div class="testimonial-card" data-v-3bc96b74><div class="testimonial-header" data-v-3bc96b74><div class="flex items-center space-x-4" data-v-3bc96b74><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&amp;h=64&amp;fit=crop&amp;crop=face" alt="Alex Chen" class="w-16 h-16 rounded-full shadow-lg" data-v-3bc96b74><div data-v-3bc96b74><h4 class="text-lg font-semibold text-gray-900" data-v-3bc96b74>Alex Chen</h4><p class="text-sky-600 font-medium" data-v-3bc96b74>Premium Member</p><p class="text-gray-500 text-sm" data-v-3bc96b74>Software Developer</p></div></div><div class="flex text-yellow-400" data-v-3bc96b74><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span></div></div><div class="testimonial-content" data-v-3bc96b74><p class="text-gray-600 leading-relaxed" data-v-3bc96b74> &quot;Joining this crypto group was a game-changer for me. The daily trading signals and expert insights helped me understand market trends I never would have spotted on my own. I&#39;ve increased my portfolio by 300% in just 6 months!&quot; </p></div><div class="testimonial-footer" data-v-3bc96b74><span class="text-sky-600 text-sm font-medium" data-v-3bc96b74>Joined 6 months ago</span></div></div><div class="testimonial-card" data-v-3bc96b74><div class="testimonial-header" data-v-3bc96b74><div class="flex items-center space-x-4" data-v-3bc96b74><img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=64&amp;h=64&amp;fit=crop&amp;crop=face" alt="Sarah Johnson" class="w-16 h-16 rounded-full shadow-lg" data-v-3bc96b74><div data-v-3bc96b74><h4 class="text-lg font-semibold text-gray-900" data-v-3bc96b74>Sarah Johnson</h4><p class="text-sky-600 font-medium" data-v-3bc96b74>VIP Member</p><p class="text-gray-500 text-sm" data-v-3bc96b74>Marketing Consultant</p></div></div><div class="flex text-yellow-400" data-v-3bc96b74><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span></div></div><div class="testimonial-content" data-v-3bc96b74><p class="text-gray-600 leading-relaxed" data-v-3bc96b74> &quot;The networking opportunities in this group are incredible! I&#39;ve connected with industry leaders and found amazing investment opportunities I wouldn&#39;t have discovered otherwise. The 1-on-1 consultations are worth every penny.&quot; </p></div><div class="testimonial-footer" data-v-3bc96b74><span class="text-sky-600 text-sm font-medium" data-v-3bc96b74>Joined 1 year ago</span></div></div><div class="testimonial-card" data-v-3bc96b74><div class="testimonial-header" data-v-3bc96b74><div class="flex items-center space-x-4" data-v-3bc96b74><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=64&amp;h=64&amp;fit=crop&amp;crop=face" alt="Mike Rodriguez" class="w-16 h-16 rounded-full shadow-lg" data-v-3bc96b74><div data-v-3bc96b74><h4 class="text-lg font-semibold text-gray-900" data-v-3bc96b74>Mike Rodriguez</h4><p class="text-sky-600 font-medium" data-v-3bc96b74>Free Member</p><p class="text-gray-500 text-sm" data-v-3bc96b74>Student</p></div></div><div class="flex text-yellow-400" data-v-3bc96b74><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span></div></div><div class="testimonial-content" data-v-3bc96b74><p class="text-gray-600 leading-relaxed" data-v-3bc96b74> &quot;As a crypto beginner, this group has been my go-to resource for learning. The educational content and supportive community helped me go from knowing nothing to making my first profitable trades. Highly recommended!&quot; </p></div><div class="testimonial-footer" data-v-3bc96b74><span class="text-sky-600 text-sm font-medium" data-v-3bc96b74>Joined 3 months ago</span></div></div><div class="testimonial-card" data-v-3bc96b74><div class="testimonial-header" data-v-3bc96b74><div class="flex items-center space-x-4" data-v-3bc96b74><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=64&amp;h=64&amp;fit=crop&amp;crop=face" alt="Emma Thompson" class="w-16 h-16 rounded-full shadow-lg" data-v-3bc96b74><div data-v-3bc96b74><h4 class="text-lg font-semibold text-gray-900" data-v-3bc96b74>Emma Thompson</h4><p class="text-sky-600 font-medium" data-v-3bc96b74>Premium Member</p><p class="text-gray-500 text-sm" data-v-3bc96b74>Financial Analyst</p></div></div><div class="flex text-yellow-400" data-v-3bc96b74><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span></div></div><div class="testimonial-content" data-v-3bc96b74><p class="text-gray-600 leading-relaxed" data-v-3bc96b74> &quot;The portfolio tracking tools and market analysis are top-notch. I&#39;ve been able to diversify my investments much more effectively thanks to the insights shared in this group. It&#39;s like having a team of experts in my pocket.&quot; </p></div><div class="testimonial-footer" data-v-3bc96b74><span class="text-sky-600 text-sm font-medium" data-v-3bc96b74>Joined 8 months ago</span></div></div><div class="testimonial-card" data-v-3bc96b74><div class="testimonial-header" data-v-3bc96b74><div class="flex items-center space-x-4" data-v-3bc96b74><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&amp;h=64&amp;fit=crop&amp;crop=face" alt="David Kim" class="w-16 h-16 rounded-full shadow-lg" data-v-3bc96b74><div data-v-3bc96b74><h4 class="text-lg font-semibold text-gray-900" data-v-3bc96b74>David Kim</h4><p class="text-sky-600 font-medium" data-v-3bc96b74>VIP Member</p><p class="text-gray-500 text-sm" data-v-3bc96b74>Entrepreneur</p></div></div><div class="flex text-yellow-400" data-v-3bc96b74><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span></div></div><div class="testimonial-content" data-v-3bc96b74><p class="text-gray-600 leading-relaxed" data-v-3bc96b74> &quot;The early access to presales and private investment opportunities has been incredible. I&#39;ve participated in several successful IDOs that I learned about exclusively through this group. The ROI has been phenomenal.&quot; </p></div><div class="testimonial-footer" data-v-3bc96b74><span class="text-sky-600 text-sm font-medium" data-v-3bc96b74>Joined 2 years ago</span></div></div><div class="testimonial-card" data-v-3bc96b74><div class="testimonial-header" data-v-3bc96b74><div class="flex items-center space-x-4" data-v-3bc96b74><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=64&amp;h=64&amp;fit=crop&amp;crop=face" alt="Lisa Wang" class="w-16 h-16 rounded-full shadow-lg" data-v-3bc96b74><div data-v-3bc96b74><h4 class="text-lg font-semibold text-gray-900" data-v-3bc96b74>Lisa Wang</h4><p class="text-sky-600 font-medium" data-v-3bc96b74>Premium Member</p><p class="text-gray-500 text-sm" data-v-3bc96b74>Content Creator</p></div></div><div class="flex text-yellow-400" data-v-3bc96b74><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span><span data-v-3bc96b74>⭐</span></div></div><div class="testimonial-content" data-v-3bc96b74><p class="text-gray-600 leading-relaxed" data-v-3bc96b74> &quot;The community is incredibly supportive and knowledgeable. I&#39;ve learned so much about DeFi, NFTs, and emerging trends. The weekly webinars are packed with valuable information that&#39;s helped me create better crypto content.&quot; </p></div><div class="testimonial-footer" data-v-3bc96b74><span class="text-sky-600 text-sm font-medium" data-v-3bc96b74>Joined 1.5 years ago</span></div></div></div><div class="text-center mb-16" data-v-3bc96b74><h3 class="text-2xl font-bold text-gray-900 mb-8" data-v-3bc96b74>Community Impact</h3><div class="grid md:grid-cols-4 gap-8" data-v-3bc96b74><div class="metric-item" data-v-3bc96b74><div class="text-4xl font-bold text-sky-600 mb-2" data-v-3bc96b74>95%</div><div class="text-gray-600" data-v-3bc96b74>Member Satisfaction</div></div><div class="metric-item" data-v-3bc96b74><div class="text-4xl font-bold text-sky-600 mb-2" data-v-3bc96b74>$2.5M+</div><div class="text-gray-600" data-v-3bc96b74>Total Profits Generated</div></div><div class="metric-item" data-v-3bc96b74><div class="text-4xl font-bold text-sky-600 mb-2" data-v-3bc96b74>500+</div><div class="text-gray-600" data-v-3bc96b74>Success Stories</div></div><div class="metric-item" data-v-3bc96b74><div class="text-4xl font-bold text-sky-600 mb-2" data-v-3bc96b74>4.9/5</div><div class="text-gray-600" data-v-3bc96b74>Average Rating</div></div></div></div><div class="text-center" data-v-3bc96b74><div class="card-glass p-8 max-w-2xl mx-auto" data-v-3bc96b74><h3 class="text-2xl font-bold text-gray-900 mb-4" data-v-3bc96b74>Ready to Write Your Success Story?</h3><p class="text-gray-600 mb-6" data-v-3bc96b74> Join thousands of successful crypto enthusiasts and start your journey today. </p><div class="flex flex-col sm:flex-row gap-4 justify-center" data-v-3bc96b74><button class="btn-primary text-lg px-8 py-4" data-v-3bc96b74><span class="mr-2" data-v-3bc96b74>🚀</span> Join Our Community </button><button class="btn-outline text-lg px-8 py-4" data-v-3bc96b74><span class="mr-2" data-v-3bc96b74>📖</span> Read More Stories </button></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoTestimonials.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-3bc96b74"]]);
const COINGECKO_API_BASE = "https://api.coingecko.com/api/v3";
class CryptoApiService {
  constructor() {
    this.cache = /* @__PURE__ */ new Map();
    this.cacheTimeout = 3e4;
  }
  // Fetch current market data for multiple cryptocurrencies
  async getMarketData(ids = ["bitcoin", "ethereum", "cardano", "solana", "polkadot"]) {
    try {
      const cacheKey = `market_${ids.join(",")}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/markets?vs_currency=usd&ids=${ids.join(",")}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h,24h,7d`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedData = data.map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_24h: coin.price_change_24h,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        price_change_percentage_1h: coin.price_change_percentage_1h,
        price_change_percentage_7d: coin.price_change_percentage_7d,
        market_cap: coin.market_cap,
        market_cap_rank: coin.market_cap_rank,
        total_volume: coin.total_volume,
        high_24h: coin.high_24h,
        low_24h: coin.low_24h,
        circulating_supply: coin.circulating_supply,
        total_supply: coin.total_supply,
        max_supply: coin.max_supply,
        last_updated: coin.last_updated,
        image: coin.image
      }));
      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching market data:", error);
      return this.getFallbackData();
    }
  }
  // Fetch detailed data for a specific cryptocurrency
  async getCoinDetails(id) {
    try {
      const cacheKey = `coin_${id}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
      const response = await fetch(
        `${COINGECKO_API_BASE}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedData = {
        id: data.id,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        description: data.description.en,
        current_price: data.market_data.current_price.usd,
        price_change_24h: data.market_data.price_change_24h.usd,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h.usd,
        market_cap: data.market_data.market_cap.usd,
        market_cap_rank: data.market_cap_rank,
        total_volume: data.market_data.total_volume.usd,
        high_24h: data.market_data.high_24h.usd,
        low_24h: data.market_data.low_24h.usd,
        circulating_supply: data.market_data.circulating_supply,
        total_supply: data.market_data.total_supply,
        max_supply: data.market_data.max_supply,
        ath: data.market_data.ath.usd,
        ath_date: data.market_data.ath_date.usd,
        atl: data.market_data.atl.usd,
        atl_date: data.market_data.atl_date.usd,
        last_updated: data.last_updated,
        image: data.image.large,
        genesis_date: data.genesis_date,
        categories: data.categories,
        links: data.links
      };
      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching coin details:", error);
      return null;
    }
  }
  // Fetch trending cryptocurrencies
  async getTrendingCoins() {
    try {
      const cacheKey = "trending";
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
      const response = await fetch(`${COINGECKO_API_BASE}/search/trending`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedData = data.coins.map((coin) => ({
        id: coin.item.id,
        name: coin.item.name,
        symbol: coin.item.symbol.toUpperCase(),
        market_cap_rank: coin.item.market_cap_rank,
        price_btc: coin.item.price_btc,
        image: coin.item.large,
        score: coin.item.score
      }));
      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching trending coins:", error);
      return [];
    }
  }
  // Get global market data
  async getGlobalMarketData() {
    try {
      const cacheKey = "global";
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached;
      const response = await fetch(`${COINGECKO_API_BASE}/global`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const formattedData = {
        total_market_cap: data.data.total_market_cap.usd,
        total_volume: data.data.total_volume.usd,
        market_cap_percentage: data.data.market_cap_percentage,
        market_cap_change_percentage_24h: data.data.market_cap_change_percentage_24h_usd,
        active_cryptocurrencies: data.data.active_cryptocurrencies,
        active_exchanges: data.data.active_exchanges,
        total_market_cap_yesterday: data.data.total_market_cap_yesterday_percentage,
        total_volume_yesterday: data.data.total_volume_yesterday_percentage
      };
      this.setCachedData(cacheKey, formattedData);
      return formattedData;
    } catch (error) {
      console.error("Error fetching global market data:", error);
      return null;
    }
  }
  // Cache management
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }
  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  // Clear cache
  clearCache() {
    this.cache.clear();
  }
  // Fallback data when API is unavailable
  getFallbackData() {
    return [
      {
        id: "bitcoin",
        symbol: "BTC",
        name: "Bitcoin",
        current_price: 43250,
        price_change_24h: 1250,
        price_change_percentage_24h: 2.98,
        price_change_percentage_1h: 0.5,
        price_change_percentage_7d: 5.2,
        market_cap: 85e10,
        market_cap_rank: 1,
        total_volume: 25e9,
        high_24h: 44500,
        low_24h: 42e3,
        circulating_supply: 196e5,
        total_supply: 21e6,
        max_supply: 21e6,
        last_updated: (/* @__PURE__ */ new Date()).toISOString(),
        image: "https://assets.coingecko.com/coins/images/1/large/bitcoin.png"
      },
      {
        id: "ethereum",
        symbol: "ETH",
        name: "Ethereum",
        current_price: 2680,
        price_change_24h: -32,
        price_change_percentage_24h: -1.18,
        price_change_percentage_1h: -0.2,
        price_change_percentage_7d: 3.8,
        market_cap: 32e10,
        market_cap_rank: 2,
        total_volume: 15e9,
        high_24h: 2750,
        low_24h: 2650,
        circulating_supply: 12e7,
        total_supply: 12e7,
        max_supply: null,
        last_updated: (/* @__PURE__ */ new Date()).toISOString(),
        image: "https://assets.coingecko.com/coins/images/279/large/ethereum.png"
      },
      {
        id: "cardano",
        symbol: "ADA",
        name: "Cardano",
        current_price: 0.48,
        price_change_24h: 0.026,
        price_change_percentage_24h: 5.73,
        price_change_percentage_1h: 1.2,
        price_change_percentage_7d: 12.5,
        market_cap: 17e9,
        market_cap_rank: 8,
        total_volume: 8e8,
        high_24h: 0.49,
        low_24h: 0.45,
        circulating_supply: 355e8,
        total_supply: 45e9,
        max_supply: 45e9,
        last_updated: (/* @__PURE__ */ new Date()).toISOString(),
        image: "https://assets.coingecko.com/coins/images/975/large/Cardano_Logo.png"
      }
    ];
  }
}
const cryptoApi = new CryptoApiService();
const intervalError = "[nuxt] `setInterval` should not be used on the server. Consider wrapping it with an `onNuxtReady`, `onBeforeMount` or `onMounted` lifecycle hook, or ensure you only call it in the browser by checking `false`.";
const setInterval = () => {
  console.error(intervalError);
};
function useCrypto() {
  const marketData = ref([]);
  const globalData = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const lastUpdated = ref(null);
  let refreshInterval = null;
  const topGainers = computed(() => {
    return [...marketData.value].filter((coin) => coin.price_change_percentage_24h > 0).sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h).slice(0, 5);
  });
  const topLosers = computed(() => {
    return [...marketData.value].filter((coin) => coin.price_change_percentage_24h < 0).sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h).slice(0, 5);
  });
  const totalMarketCap = computed(() => {
    return marketData.value.reduce((total, coin) => total + (coin.market_cap || 0), 0);
  });
  const totalVolume = computed(() => {
    return marketData.value.reduce((total, coin) => total + (coin.total_volume || 0), 0);
  });
  const fetchMarketData = async (ids = ["bitcoin", "ethereum", "cardano", "solana", "polkadot", "ripple", "dogecoin", "avalanche"]) => {
    try {
      loading.value = true;
      error.value = null;
      const data = await cryptoApi.getMarketData(ids);
      marketData.value = data;
      lastUpdated.value = /* @__PURE__ */ new Date();
    } catch (err) {
      error.value = err.message;
      console.error("Error fetching market data:", err);
    } finally {
      loading.value = false;
    }
  };
  const fetchGlobalData = async () => {
    try {
      const data = await cryptoApi.getGlobalMarketData();
      globalData.value = data;
    } catch (err) {
      console.error("Error fetching global data:", err);
    }
  };
  const refreshData = async () => {
    await Promise.all([
      fetchMarketData(),
      fetchGlobalData()
    ]);
  };
  const startAutoRefresh = (intervalMs = 3e4) => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    refreshInterval = setInterval();
  };
  const stopAutoRefresh = () => {
    if (refreshInterval) {
      clearInterval(refreshInterval);
      refreshInterval = null;
    }
  };
  const formatPrice = (price) => {
    if (price >= 1) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(price);
    } else {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 4,
        maximumFractionDigits: 8
      }).format(price);
    }
  };
  const formatPercentage = (percentage) => {
    if (!percentage) return "0.00%";
    const sign = percentage >= 0 ? "+" : "";
    return `${sign}${percentage.toFixed(2)}%`;
  };
  const formatMarketCap = (marketCap) => {
    if (!marketCap) return "$0";
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`;
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`;
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`;
    } else if (marketCap >= 1e3) {
      return `$${(marketCap / 1e3).toFixed(2)}K`;
    } else {
      return `$${marketCap.toFixed(2)}`;
    }
  };
  const formatVolume = (volume) => {
    if (!volume) return "$0";
    if (volume >= 1e12) {
      return `$${(volume / 1e12).toFixed(2)}T`;
    } else if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`;
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`;
    } else if (volume >= 1e3) {
      return `$${(volume / 1e3).toFixed(2)}K`;
    } else {
      return `$${volume.toFixed(2)}`;
    }
  };
  const getPriceChangeIcon = (percentage) => {
    if (!percentage) return "➖";
    return percentage >= 0 ? "📈" : "📉";
  };
  return {
    // State
    marketData,
    globalData,
    loading,
    error,
    lastUpdated,
    // Computed
    topGainers,
    topLosers,
    totalMarketCap,
    totalVolume,
    // Methods
    fetchMarketData,
    fetchGlobalData,
    refreshData,
    startAutoRefresh,
    stopAutoRefresh,
    // Utilities
    formatPrice,
    formatPercentage,
    formatMarketCap,
    formatVolume,
    getPriceChangeIcon
  };
}
const _sfc_main$5 = {
  __name: "LiveMarketData",
  __ssrInlineRender: true,
  setup(__props) {
    const {
      marketData,
      topGainers,
      topLosers,
      globalData,
      loading,
      lastUpdated,
      formatPrice,
      formatPercentage,
      formatMarketCap,
      formatVolume,
      getPriceChangeIcon
    } = useCrypto();
    const formatTime = (date) => {
      return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(date);
    };
    const formatSupply = (supply) => {
      if (!supply) return "N/A";
      if (supply >= 1e9) {
        return `${(supply / 1e9).toFixed(2)}B`;
      } else if (supply >= 1e6) {
        return `${(supply / 1e6).toFixed(2)}M`;
      } else if (supply >= 1e3) {
        return `${(supply / 1e3).toFixed(2)}K`;
      } else {
        return supply.toLocaleString();
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "market",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-5f316edc><div class="absolute inset-0 bg-gradient-to-br from-dark-800/50 to-dark-900/50" data-v-5f316edc></div><div class="container-custom relative z-10" data-v-5f316edc><div class="text-center mb-16" data-v-5f316edc><div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6" data-v-5f316edc><span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse" data-v-5f316edc></span> Live Market Data </div><h2 class="text-4xl md:text-5xl font-bold text-white mb-6" data-v-5f316edc> 📊 Real-Time <span class="text-gradient-primary" data-v-5f316edc>Crypto Market</span></h2><p class="text-xl text-white/80 max-w-3xl mx-auto" data-v-5f316edc> Stay updated with live cryptocurrency prices, market trends, and performance metrics </p></div>`);
      if (unref(globalData)) {
        _push(`<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16" data-v-5f316edc><div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300" data-v-5f316edc><div class="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" data-v-5f316edc><span class="text-3xl" data-v-5f316edc>🌍</span></div><h3 class="text-lg font-semibold text-white/90 mb-2" data-v-5f316edc>Global Market Cap</h3><div class="text-2xl font-bold text-white mb-2" data-v-5f316edc>${ssrInterpolate(unref(formatMarketCap)(unref(globalData).total_market_cap))}</div><div class="${ssrRenderClass([unref(globalData).market_cap_change_percentage_24h >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400", "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"])}" data-v-5f316edc><span class="mr-1" data-v-5f316edc>${ssrInterpolate(unref(globalData).market_cap_change_percentage_24h >= 0 ? "📈" : "📉")}</span> ${ssrInterpolate(unref(formatPercentage)(unref(globalData).market_cap_change_percentage_24h))}</div></div><div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300" data-v-5f316edc><div class="w-16 h-16 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" data-v-5f316edc><span class="text-3xl" data-v-5f316edc>📈</span></div><h3 class="text-lg font-semibold text-white/90 mb-2" data-v-5f316edc>24h Volume</h3><div class="text-2xl font-bold text-white mb-2" data-v-5f316edc>${ssrInterpolate(unref(formatVolume)(unref(globalData).total_volume))}</div><div class="${ssrRenderClass([unref(globalData).total_volume_yesterday >= 0 ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400", "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"])}" data-v-5f316edc><span class="mr-1" data-v-5f316edc>${ssrInterpolate(unref(globalData).total_volume_yesterday >= 0 ? "📈" : "📉")}</span> ${ssrInterpolate(unref(formatPercentage)(unref(globalData).total_volume_yesterday))}</div></div><div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300" data-v-5f316edc><div class="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" data-v-5f316edc><span class="text-3xl" data-v-5f316edc>🪙</span></div><h3 class="text-lg font-semibold text-white/90 mb-2" data-v-5f316edc>Active Coins</h3><div class="text-2xl font-bold text-white mb-2" data-v-5f316edc>${ssrInterpolate(unref(globalData).active_cryptocurrencies.toLocaleString())}</div><div class="text-sm text-white/60" data-v-5f316edc>Cryptocurrencies</div></div><div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300" data-v-5f316edc><div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" data-v-5f316edc><span class="text-3xl" data-v-5f316edc>🏢</span></div><h3 class="text-lg font-semibold text-white/90 mb-2" data-v-5f316edc>Exchanges</h3><div class="text-2xl font-bold text-white mb-2" data-v-5f316edc>${ssrInterpolate(unref(globalData).active_exchanges.toLocaleString())}</div><div class="text-sm text-white/60" data-v-5f316edc>Active</div></div></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`<div class="grid lg:grid-cols-2 gap-8 mb-16" data-v-5f316edc><div class="card-glass p-8" data-v-5f316edc><div class="flex items-center justify-between mb-6" data-v-5f316edc><div data-v-5f316edc><h3 class="text-2xl font-bold text-white mb-2" data-v-5f316edc>🚀 Top Gainers (24h)</h3><p class="text-white/60" data-v-5f316edc>Best performing cryptocurrencies</p></div><div class="w-12 h-12 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center" data-v-5f316edc><span class="text-2xl" data-v-5f316edc>📈</span></div></div>`);
      if (unref(topGainers).length > 0) {
        _push(`<div class="space-y-4" data-v-5f316edc><!--[-->`);
        ssrRenderList(unref(topGainers), (coin, index) => {
          _push(`<div class="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200" style="${ssrRenderStyle({ animationDelay: `${index * 0.1}s` })}" data-v-5f316edc><div class="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4" data-v-5f316edc>${ssrInterpolate(index + 1)}</div><img${ssrRenderAttr("src", coin.image)}${ssrRenderAttr("alt", coin.name)} class="w-10 h-10 rounded-full mr-4" data-v-5f316edc><div class="flex-1" data-v-5f316edc><div class="font-semibold text-white" data-v-5f316edc>${ssrInterpolate(coin.name)}</div><div class="text-sm text-white/60" data-v-5f316edc>${ssrInterpolate(coin.symbol)}</div></div><div class="text-right" data-v-5f316edc><div class="font-bold text-white" data-v-5f316edc>${ssrInterpolate(unref(formatPrice)(coin.current_price))}</div><div class="text-sm text-green-400 font-medium" data-v-5f316edc> +${ssrInterpolate(unref(formatPercentage)(coin.price_change_percentage_24h))}</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(loading)) {
        _push(`<div class="space-y-4" data-v-5f316edc><!--[-->`);
        ssrRenderList(5, (i) => {
          _push(`<div class="loading-shimmer h-16" data-v-5f316edc></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><div class="card-glass p-8" data-v-5f316edc><div class="flex items-center justify-between mb-6" data-v-5f316edc><div data-v-5f316edc><h3 class="text-2xl font-bold text-white mb-2" data-v-5f316edc>📉 Top Losers (24h)</h3><p class="text-white/60" data-v-5f316edc>Worst performing cryptocurrencies</p></div><div class="w-12 h-12 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl flex items-center justify-center" data-v-5f316edc><span class="text-2xl" data-v-5f316edc>📉</span></div></div>`);
      if (unref(topLosers).length > 0) {
        _push(`<div class="space-y-4" data-v-5f316edc><!--[-->`);
        ssrRenderList(unref(topLosers), (coin, index) => {
          _push(`<div class="flex items-center p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors duration-200" style="${ssrRenderStyle({ animationDelay: `${index * 0.1}s` })}" data-v-5f316edc><div class="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4" data-v-5f316edc>${ssrInterpolate(index + 1)}</div><img${ssrRenderAttr("src", coin.image)}${ssrRenderAttr("alt", coin.name)} class="w-10 h-10 rounded-full mr-4" data-v-5f316edc><div class="flex-1" data-v-5f316edc><div class="font-semibold text-white" data-v-5f316edc>${ssrInterpolate(coin.name)}</div><div class="text-sm text-white/60" data-v-5f316edc>${ssrInterpolate(coin.symbol)}</div></div><div class="text-right" data-v-5f316edc><div class="font-bold text-white" data-v-5f316edc>${ssrInterpolate(unref(formatPrice)(coin.current_price))}</div><div class="text-sm text-red-400 font-medium" data-v-5f316edc>${ssrInterpolate(unref(formatPercentage)(coin.price_change_percentage_24h))}</div></div></div>`);
        });
        _push(`<!--]--></div>`);
      } else if (unref(loading)) {
        _push(`<div class="space-y-4" data-v-5f316edc><!--[-->`);
        ssrRenderList(5, (i) => {
          _push(`<div class="loading-shimmer h-16" data-v-5f316edc></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="card-glass p-8" data-v-5f316edc><div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8" data-v-5f316edc><div data-v-5f316edc><h3 class="text-2xl font-bold text-white mb-2" data-v-5f316edc>📋 All Cryptocurrencies</h3><p class="text-white/60" data-v-5f316edc>Comprehensive market data and performance metrics</p></div><div class="flex items-center space-x-4 mt-4 lg:mt-0" data-v-5f316edc><button${ssrIncludeBooleanAttr(unref(loading)) ? " disabled" : ""} class="btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed" data-v-5f316edc><span class="mr-2" data-v-5f316edc>🔄</span> ${ssrInterpolate(unref(loading) ? "Refreshing..." : "Refresh Data")}</button>`);
      if (unref(lastUpdated)) {
        _push(`<div class="text-sm text-white/60" data-v-5f316edc> Updated: ${ssrInterpolate(formatTime(unref(lastUpdated)))}</div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="overflow-x-auto" data-v-5f316edc>`);
      if (!unref(loading) && unref(marketData).length > 0) {
        _push(`<table class="w-full" data-v-5f316edc><thead data-v-5f316edc><tr class="border-b border-white/20" data-v-5f316edc><th class="text-left py-4 px-4 text-white/80 font-semibold" data-v-5f316edc>#</th><th class="text-left py-4 px-4 text-white/80 font-semibold" data-v-5f316edc>Coin</th><th class="text-left py-4 px-4 text-white/80 font-semibold" data-v-5f316edc>Price</th><th class="text-left py-4 px-4 text-white/80 font-semibold" data-v-5f316edc>24h Change</th><th class="text-left py-4 px-4 text-white/80 font-semibold" data-v-5f316edc>Market Cap</th><th class="text-left py-4 px-4 text-white/80 font-semibold" data-v-5f316edc>Volume (24h)</th><th class="text-left py-4 px-4 text-white/80 font-semibold" data-v-5f316edc>Circulating Supply</th></tr></thead><tbody data-v-5f316edc><!--[-->`);
        ssrRenderList(unref(marketData), (coin) => {
          _push(`<tr class="${ssrRenderClass([{ "bg-green-500/5": coin.price_change_percentage_24h > 0, "bg-red-500/5": coin.price_change_percentage_24h < 0 }, "border-b border-white/10 hover:bg-white/5 transition-colors duration-200"])}" data-v-5f316edc><td class="py-4 px-4 text-white/60 font-medium" data-v-5f316edc>${ssrInterpolate(coin.market_cap_rank)}</td><td class="py-4 px-4" data-v-5f316edc><div class="flex items-center space-x-3" data-v-5f316edc><img${ssrRenderAttr("src", coin.image)}${ssrRenderAttr("alt", coin.name)} class="w-8 h-8 rounded-full" data-v-5f316edc><div data-v-5f316edc><div class="font-semibold text-white" data-v-5f316edc>${ssrInterpolate(coin.name)}</div><div class="text-sm text-white/60" data-v-5f316edc>${ssrInterpolate(coin.symbol)}</div></div></div></td><td class="py-4 px-4 font-bold text-white" data-v-5f316edc>${ssrInterpolate(unref(formatPrice)(coin.current_price))}</td><td class="py-4 px-4" data-v-5f316edc><div class="flex items-center space-x-2" data-v-5f316edc><span class="text-lg" data-v-5f316edc>${ssrInterpolate(unref(getPriceChangeIcon)(coin.price_change_percentage_24h))}</span><span class="${ssrRenderClass([coin.price_change_percentage_24h > 0 ? "text-green-400" : "text-red-400", "font-semibold"])}" data-v-5f316edc>${ssrInterpolate(unref(formatPercentage)(coin.price_change_percentage_24h))}</span></div></td><td class="py-4 px-4 font-semibold text-white" data-v-5f316edc>${ssrInterpolate(unref(formatMarketCap)(coin.market_cap))}</td><td class="py-4 px-4 font-semibold text-white" data-v-5f316edc>${ssrInterpolate(unref(formatVolume)(coin.total_volume))}</td><td class="py-4 px-4 font-semibold text-white" data-v-5f316edc>${ssrInterpolate(formatSupply(coin.circulating_supply))}</td></tr>`);
        });
        _push(`<!--]--></tbody></table>`);
      } else if (unref(loading)) {
        _push(`<div class="space-y-4" data-v-5f316edc><!--[-->`);
        ssrRenderList(8, (i) => {
          _push(`<div class="loading-shimmer h-16" data-v-5f316edc></div>`);
        });
        _push(`<!--]--></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div></div></section>`);
    };
  }
};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/LiveMarketData.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const __nuxt_component_6 = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["__scopeId", "data-v-5f316edc"]]);
const _sfc_main$4 = {
  __name: "CryptoDemo",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "demo",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-706fa324><div class="absolute inset-0 bg-gradient-to-br from-dark-900/50 to-dark-800/50" data-v-706fa324></div><div class="container-custom relative z-10" data-v-706fa324><div class="text-center mb-16" data-v-706fa324><div class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/80 mb-6" data-v-706fa324><span class="w-2 h-2 bg-accent-400 rounded-full mr-2 animate-pulse" data-v-706fa324></span> Try It Out </div><h2 class="text-4xl md:text-5xl font-bold text-white mb-6" data-v-706fa324> 🎮 Interactive <span class="text-gradient-primary" data-v-706fa324>Demo</span></h2><p class="text-xl text-white/80 max-w-3xl mx-auto" data-v-706fa324> Experience the power of our platform with these interactive demonstrations </p></div><div class="grid lg:grid-cols-2 gap-8 mb-16" data-v-706fa324><div class="card-glass p-8" data-v-706fa324><div class="flex items-center justify-between mb-6" data-v-706fa324><h3 class="text-2xl font-bold text-white" data-v-706fa324>💼 Portfolio Simulator</h3><div class="w-12 h-12 bg-gradient-to-br from-primary-500/20 to-primary-600/20 rounded-xl flex items-center justify-center" data-v-706fa324><span class="text-2xl" data-v-706fa324>📊</span></div></div><p class="text-white/70 mb-6" data-v-706fa324> Test your investment strategy with our risk-free portfolio simulator. See how your choices would perform in real market conditions. </p><div class="space-y-4" data-v-706fa324><div class="flex items-center justify-between p-4 bg-white/5 rounded-xl" data-v-706fa324><span class="text-white" data-v-706fa324>Initial Investment:</span><span class="text-white font-semibold" data-v-706fa324>$10,000</span></div><div class="flex items-center justify-between p-4 bg-white/5 rounded-xl" data-v-706fa324><span class="text-white" data-v-706fa324>Current Value:</span><span class="text-green-400 font-semibold" data-v-706fa324>$12,450</span></div><div class="flex items-center justify-between p-4 bg-white/5 rounded-xl" data-v-706fa324><span class="text-white" data-v-706fa324>Total Return:</span><span class="text-green-400 font-semibold" data-v-706fa324>+24.5%</span></div></div><button class="w-full btn-primary mt-6" data-v-706fa324><span class="mr-2" data-v-706fa324>🎯</span> Try Simulator </button></div><div class="card-glass p-8" data-v-706fa324><div class="flex items-center justify-between mb-6" data-v-706fa324><h3 class="text-2xl font-bold text-white" data-v-706fa324>🔮 Market Predictor</h3><div class="w-12 h-12 bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 rounded-xl flex items-center justify-center" data-v-706fa324><span class="text-2xl" data-v-706fa324>📈</span></div></div><p class="text-white/70 mb-6" data-v-706fa324> Explore our AI-powered market prediction tools and see how machine learning can help identify potential market trends. </p><div class="space-y-4" data-v-706fa324><div class="flex items-center justify-between p-4 bg-white/5 rounded-xl" data-v-706fa324><span class="text-white" data-v-706fa324>Bitcoin Prediction:</span><span class="text-green-400 font-semibold" data-v-706fa324>Bullish 📈</span></div><div class="flex items-center justify-between p-4 bg-white/5 rounded-xl" data-v-706fa324><span class="text-white" data-v-706fa324>Confidence Level:</span><span class="text-blue-400 font-semibold" data-v-706fa324>78%</span></div><div class="flex items-center justify-between p-4 bg-white/5 rounded-xl" data-v-706fa324><span class="text-white" data-v-706fa324>Time Frame:</span><span class="text-white font-semibold" data-v-706fa324>7 Days</span></div></div><button class="w-full btn-primary mt-6" data-v-706fa324><span class="mr-2" data-v-706fa324>🔮</span> View Predictions </button></div></div><div class="card-glass p-8 mb-16" data-v-706fa324><div class="text-center mb-8" data-v-706fa324><h3 class="text-2xl font-bold text-white mb-4" data-v-706fa324>📊 Live Chart Demo</h3><p class="text-white/70" data-v-706fa324> Experience our advanced charting tools with real-time data visualization </p></div><div class="bg-gradient-to-br from-dark-800 to-dark-900 rounded-xl p-8 text-center border border-white/10" data-v-706fa324><div class="w-16 h-16 bg-gradient-to-br from-accent-500/20 to-accent-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4" data-v-706fa324><span class="text-3xl" data-v-706fa324>📊</span></div><h4 class="text-lg font-semibold text-white mb-2" data-v-706fa324>Interactive Chart</h4><p class="text-white/60 mb-4" data-v-706fa324> Real-time price charts with technical indicators, drawing tools, and multiple timeframes </p><button class="btn-outline" data-v-706fa324><span class="mr-2" data-v-706fa324>🔧</span> Launch Chart </button></div></div><div class="grid md:grid-cols-3 gap-6" data-v-706fa324><div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300" data-v-706fa324><div class="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" data-v-706fa324><span class="text-3xl" data-v-706fa324>⚡</span></div><h4 class="text-lg font-semibold text-white mb-2" data-v-706fa324>Lightning Fast</h4><p class="text-white/70 text-sm" data-v-706fa324> Sub-second data updates and instant chart rendering </p></div><div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300" data-v-706fa324><div class="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" data-v-706fa324><span class="text-3xl" data-v-706fa324>📱</span></div><h4 class="text-lg font-semibold text-white mb-2" data-v-706fa324>Mobile Optimized</h4><p class="text-white/70 text-sm" data-v-706fa324> Responsive design that works perfectly on all devices </p></div><div class="card-glass p-6 text-center group hover:scale-105 transition-transform duration-300" data-v-706fa324><div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" data-v-706fa324><span class="text-3xl" data-v-706fa324>🔒</span></div><h4 class="text-lg font-semibold text-white mb-2" data-v-706fa324>Secure &amp; Private</h4><p class="text-white/70 text-sm" data-v-706fa324> Your data is protected with enterprise-grade security </p></div></div><div class="text-center mt-16" data-v-706fa324><div class="card-glass p-12 max-w-4xl mx-auto" data-v-706fa324><h3 class="text-3xl font-bold text-white mb-6" data-v-706fa324> Ready to Experience the <span class="text-gradient-primary" data-v-706fa324>Future</span>? </h3><p class="text-xl text-white/80 mb-8 max-w-2xl mx-auto" data-v-706fa324> Join thousands of users who are already benefiting from our advanced crypto platform </p><div class="flex flex-col sm:flex-row gap-4 justify-center" data-v-706fa324><button class="btn-primary text-lg px-8 py-4" data-v-706fa324><span class="mr-2" data-v-706fa324>🚀</span> Start Free Trial </button><button class="btn-outline text-lg px-8 py-4" data-v-706fa324><span class="mr-2" data-v-706fa324>📞</span> Contact Sales </button></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoDemo.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const __nuxt_component_7 = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["__scopeId", "data-v-706fa324"]]);
const _sfc_main$3 = {
  __name: "CryptoFooter",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "relative overflow-hidden border-t border-sky-200/50 bg-gradient-to-br from-sky-50 to-blue-50" }, _attrs))} data-v-313c04a7><div class="absolute inset-0 bg-gradient-to-br from-sky-100/30 to-blue-100/30" data-v-313c04a7></div><div class="container-custom relative z-10 py-16" data-v-313c04a7><div class="grid lg:grid-cols-4 gap-8 mb-12" data-v-313c04a7><div class="lg:col-span-2" data-v-313c04a7><div class="flex items-center space-x-3 mb-6" data-v-313c04a7><div class="w-12 h-12 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-glow" data-v-313c04a7><span class="text-2xl" data-v-313c04a7>🚀</span></div><div data-v-313c04a7><h3 class="text-xl font-bold text-gray-900" data-v-313c04a7>CryptoGroup</h3><p class="text-sm text-sky-600 font-medium" data-v-313c04a7>Premium Crypto Community</p></div></div><p class="text-gray-600 mb-6 max-w-md" data-v-313c04a7> Join the most innovative crypto community and connect with thousands of enthusiasts, traders, and experts from around the world. </p><div class="flex space-x-4" data-v-313c04a7><a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg" data-v-313c04a7><span class="text-lg" data-v-313c04a7>📱</span></a><a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg" data-v-313c04a7><span class="text-lg" data-v-313c04a7>🐦</span></a><a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg" data-v-313c04a7><span class="text-lg" data-v-313c04a7>💬</span></a><a href="#" class="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center hover:bg-sky-200 transition-colors duration-200 text-sky-600 shadow-lg" data-v-313c04a7><span class="text-lg" data-v-313c04a7>📧</span></a></div></div><div data-v-313c04a7><h4 class="text-lg font-semibold text-gray-900 mb-6" data-v-313c04a7>Quick Links</h4><ul class="space-y-3" data-v-313c04a7><li data-v-313c04a7><a href="#home" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Home</a></li><li data-v-313c04a7><a href="#about" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>About</a></li><li data-v-313c04a7><a href="#features" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Features</a></li><li data-v-313c04a7><a href="#membership" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Membership</a></li><li data-v-313c04a7><a href="#testimonials" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Success Stories</a></li></ul></div><div data-v-313c04a7><h4 class="text-lg font-semibold text-gray-900 mb-6" data-v-313c04a7>Community</h4><ul class="space-y-3" data-v-313c04a7><li data-v-313c04a7><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Discord Server</a></li><li data-v-313c04a7><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Telegram Groups</a></li><li data-v-313c04a7><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Forum</a></li><li data-v-313c04a7><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Events</a></li><li data-v-313c04a7><a href="#" class="text-gray-600 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Blog</a></li></ul></div></div><div class="card-glass p-8 mb-12" data-v-313c04a7><div class="text-center" data-v-313c04a7><h3 class="text-2xl font-bold text-gray-900 mb-4" data-v-313c04a7> Join Our <span class="text-gradient-primary" data-v-313c04a7>Crypto Community</span></h3><p class="text-gray-600 mb-6 max-w-2xl mx-auto" data-v-313c04a7> Get exclusive access to crypto insights, trading signals, and community updates. Join thousands of successful crypto enthusiasts. </p><div class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto" data-v-313c04a7><input type="email" placeholder="Enter your email" class="flex-1 px-4 py-3 bg-white/80 border border-sky-200/50 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-sky-500 transition-colors duration-200 shadow-lg" data-v-313c04a7><button class="btn-primary px-8 py-3" data-v-313c04a7><span class="mr-2" data-v-313c04a7>🚀</span> Join Now </button></div></div></div><div class="flex flex-col md:flex-row md:items-center md:justify-between pt-8 border-t border-sky-200/50" data-v-313c04a7><div class="text-gray-500 text-sm mb-4 md:mb-0" data-v-313c04a7> © 2024 CryptoGroup. All rights reserved. </div><div class="flex space-x-6 text-sm" data-v-313c04a7><a href="#" class="text-gray-500 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Privacy Policy</a><a href="#" class="text-gray-500 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Terms of Service</a><a href="#" class="text-gray-500 hover:text-sky-600 transition-colors duration-200" data-v-313c04a7>Cookie Policy</a></div></div></div><div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-400 rounded-full opacity-10 animate-float" data-v-313c04a7></div><div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-sky-300 to-blue-300 rounded-full opacity-10 animate-float" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-313c04a7></div></footer>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoFooter.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_8 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-313c04a7"]]);
function useGameState() {
  const player = ref({
    id: "player_" + Date.now(),
    name: "Crypto Trader",
    level: 1,
    experience: 0,
    experienceToNext: 100,
    coins: 1e4,
    // Starting coins
    portfolio: [],
    totalValue: 1e4,
    trades: 0,
    successfulTrades: 0,
    streak: 0,
    achievements: [],
    rank: "Bronze",
    badges: ["newbie"],
    joinDate: /* @__PURE__ */ new Date()
  });
  const gameMode = ref("simulation");
  const difficulty = ref("normal");
  const timeLimit = ref(300);
  const isGameActive = ref(false);
  const gameStartTime = ref(null);
  const currentChallenge = ref(null);
  const showResults = ref(false);
  const gameStats = ref(null);
  const leaderboard = ref([
    { name: "CryptoKing", score: 15e4, level: 25, rank: "Diamond" },
    { name: "BlockchainBoss", score: 12e4, level: 22, rank: "Platinum" },
    { name: "DeFiMaster", score: 95e3, level: 20, rank: "Gold" },
    { name: "SatoshiFan", score: 78e3, level: 18, rank: "Gold" },
    { name: "AltcoinHunter", score: 65e3, level: 16, rank: "Silver" }
  ]);
  const achievements = ref([
    { id: "first_trade", name: "First Trade", description: "Complete your first trade", icon: "🎯", unlocked: false, points: 10 },
    { id: "profit_master", name: "Profit Master", description: "Make 10 profitable trades in a row", icon: "💰", unlocked: false, points: 50 },
    { id: "portfolio_diversifier", name: "Portfolio Diversifier", description: "Hold 5 different cryptocurrencies", icon: "📊", unlocked: false, points: 30 },
    { id: "streak_king", name: "Streak King", description: "Maintain a 7-day profit streak", icon: "🔥", unlocked: false, points: 100 },
    { id: "millionaire", name: "Crypto Millionaire", description: "Reach 1,000,000 coins", icon: "👑", unlocked: false, points: 200 },
    { id: "speed_trader", name: "Speed Trader", description: "Complete 50 trades in one session", icon: "⚡", unlocked: false, points: 75 },
    { id: "risk_taker", name: "Risk Taker", description: "Invest 80% of your portfolio in one asset", icon: "🎲", unlocked: false, points: 40 },
    { id: "hodler", name: "HODLer", description: "Hold an asset for 24 hours", icon: "💎", unlocked: false, points: 25 }
  ]);
  const challenges = ref([
    {
      id: "beginner_challenge",
      name: "Beginner Challenge",
      description: "Turn 10,000 into 15,000 in 5 minutes",
      startingCoins: 1e4,
      targetCoins: 15e3,
      timeLimit: 300,
      difficulty: "easy",
      reward: { experience: 100, coins: 1e3, badge: "beginner" }
    },
    {
      id: "intermediate_challenge",
      name: "Intermediate Challenge",
      description: "Turn 20,000 into 35,000 in 8 minutes",
      startingCoins: 2e4,
      targetCoins: 35e3,
      timeLimit: 480,
      difficulty: "normal",
      reward: { experience: 250, coins: 2500, badge: "intermediate" }
    },
    {
      id: "expert_challenge",
      name: "Expert Challenge",
      description: "Turn 50,000 into 100,000 in 10 minutes",
      startingCoins: 5e4,
      targetCoins: 1e5,
      timeLimit: 600,
      difficulty: "hard",
      reward: { experience: 500, coins: 5e3, badge: "expert" }
    }
  ]);
  const playerRank = computed(() => {
    const exp = player.value.experience;
    if (exp < 1e3) return "Bronze";
    if (exp < 5e3) return "Silver";
    if (exp < 15e3) return "Gold";
    if (exp < 5e4) return "Platinum";
    return "Diamond";
  });
  const portfolioValue = computed(() => {
    return player.value.portfolio.reduce((total, asset) => {
      return total + asset.quantity * asset.currentPrice;
    }, 0);
  });
  const totalProfit = computed(() => {
    return portfolioValue.value - player.value.coins;
  });
  const profitPercentage = computed(() => {
    if (player.value.coins === 0) return 0;
    return (totalProfit.value / player.value.coins * 100).toFixed(2);
  });
  const startGame = (mode = "simulation", challengeId = null) => {
    isGameActive.value = true;
    gameMode.value = mode;
    gameStartTime.value = Date.now();
    if (challengeId) {
      currentChallenge.value = challenges.value.find((c) => c.id === challengeId);
      player.value.coins = currentChallenge.value.startingCoins;
      timeLimit.value = currentChallenge.value.timeLimit;
    }
  };
  const endGame = () => {
    isGameActive.value = false;
    gameStartTime.value = null;
    calculateGameResults();
    const timeUsed = gameStartTime.value ? Math.floor((Date.now() - gameStartTime.value) / 1e3) : 0;
    const startingCoins = currentChallenge.value ? currentChallenge.value.startingCoins : 1e4;
    const finalCoins = player.value.coins + portfolioValue.value;
    const profit = finalCoins - startingCoins;
    const profitPercentage2 = (profit / startingCoins * 100).toFixed(2);
    const successRate = player.value.trades > 0 ? Math.round(player.value.successfulTrades / player.value.trades * 100) : 0;
    gameStats.value = {
      startingCoins,
      finalCoins,
      profit,
      profitPercentage: parseFloat(profitPercentage2),
      trades: player.value.trades,
      successRate,
      timeUsed,
      timeLimit: timeLimit.value,
      challengeSuccess: currentChallenge.value ? finalCoins >= currentChallenge.value.targetCoins : false,
      experienceGained: 0,
      // Will be calculated by calculateGameResults
      coinsEarned: 0,
      // Will be calculated by calculateGameResults
      newAchievements: []
      // Will be populated by calculateGameResults
    };
    currentChallenge.value = null;
    showResults.value = true;
  };
  const buyAsset = (assetId, quantity, price) => {
    const cost = quantity * price;
    if (cost > player.value.coins) return false;
    player.value.coins -= cost;
    const existingAsset = player.value.portfolio.find((a) => a.id === assetId);
    if (existingAsset) {
      existingAsset.quantity += quantity;
      existingAsset.averagePrice = (existingAsset.averagePrice * existingAsset.quantity + cost) / (existingAsset.quantity + quantity);
    } else {
      player.value.portfolio.push({
        id: assetId,
        quantity,
        averagePrice: price,
        currentPrice: price,
        buyTime: Date.now()
      });
    }
    player.value.trades++;
    return true;
  };
  const sellAsset = (assetId, quantity, price) => {
    const asset = player.value.portfolio.find((a) => a.id === assetId);
    if (!asset || asset.quantity < quantity) return false;
    const revenue = quantity * price;
    player.value.coins += revenue;
    asset.quantity -= quantity;
    if (asset.quantity === 0) {
      player.value.portfolio = player.value.portfolio.filter((a) => a.id !== assetId);
    }
    const profit = revenue - quantity * asset.averagePrice;
    if (profit > 0) {
      player.value.successfulTrades++;
      player.value.streak++;
    } else {
      player.value.streak = 0;
    }
    player.value.trades++;
    return true;
  };
  const addExperience = (amount) => {
    player.value.experience += amount;
    while (player.value.experience >= player.value.experienceToNext) {
      player.value.level++;
      player.value.experience -= player.value.experienceToNext;
      player.value.experienceToNext = Math.floor(player.value.experienceToNext * 1.5);
      player.value.coins += player.value.level * 100;
    }
  };
  const checkAchievements = () => {
    achievements.value.forEach((achievement) => {
      if (achievement.unlocked) return;
      let unlocked = false;
      switch (achievement.id) {
        case "first_trade":
          unlocked = player.value.trades > 0;
          break;
        case "profit_master":
          unlocked = player.value.streak >= 10;
          break;
        case "portfolio_diversifier":
          unlocked = player.value.portfolio.length >= 5;
          break;
        case "streak_king":
          unlocked = player.value.streak >= 7;
          break;
        case "millionaire":
          unlocked = player.value.coins >= 1e6;
          break;
        case "speed_trader":
          unlocked = player.value.trades >= 50;
          break;
        case "hodler":
          unlocked = player.value.portfolio.some(
            (asset) => Date.now() - asset.buyTime >= 24 * 60 * 60 * 1e3
          );
          break;
      }
      if (unlocked) {
        achievement.unlocked = true;
        player.value.achievements.push(achievement.id);
        addExperience(achievement.points);
        player.value.coins += achievement.points * 10;
      }
    });
  };
  const calculateGameResults = () => {
    if (gameStats.value) {
      let experienceGained = 0;
      let coinsEarned = 0;
      if (currentChallenge.value) {
        const success = player.value.coins + portfolioValue.value >= currentChallenge.value.targetCoins;
        if (success) {
          const reward = currentChallenge.value.reward;
          experienceGained = reward.experience;
          coinsEarned = reward.coins;
          addExperience(reward.experience);
          player.value.coins += reward.coins;
          player.value.badges.push(reward.badge);
        }
      }
      const achievementsBefore = [...player.value.achievements];
      checkAchievements();
      const achievementsAfter = [...player.value.achievements];
      const newAchievements = achievements.value.filter(
        (achievement) => achievementsAfter.includes(achievement.id) && !achievementsBefore.includes(achievement.id)
      );
      gameStats.value.experienceGained = experienceGained;
      gameStats.value.coinsEarned = coinsEarned;
      gameStats.value.newAchievements = newAchievements;
    }
  };
  const resetGame = () => {
    player.value = {
      ...player.value,
      coins: 1e4,
      portfolio: [],
      trades: 0,
      successfulTrades: 0,
      streak: 0
    };
  };
  const closeResults = () => {
    showResults.value = false;
    gameStats.value = null;
  };
  const playAgain = () => {
    showResults.value = false;
    gameStats.value = null;
    resetGame();
    startGame("simulation");
  };
  return {
    // State
    player: readonly(player),
    gameMode: readonly(gameMode),
    difficulty: readonly(difficulty),
    timeLimit: readonly(timeLimit),
    isGameActive: readonly(isGameActive),
    leaderboard: readonly(leaderboard),
    achievements: readonly(achievements),
    challenges: readonly(challenges),
    showResults: readonly(showResults),
    gameStats: readonly(gameStats),
    // Computed
    playerRank,
    portfolioValue,
    totalProfit,
    profitPercentage,
    // Actions
    startGame,
    endGame,
    buyAsset,
    sellAsset,
    addExperience,
    checkAchievements,
    resetGame,
    closeResults,
    playAgain
  };
}
const _sfc_main$2 = {
  __name: "app",
  __ssrInlineRender: true,
  setup(__props) {
    useTheme();
    useGameState();
    return (_ctx, _push, _parent, _attrs) => {
      const _component_CryptoHeader = __nuxt_component_0;
      const _component_CryptoHero = __nuxt_component_1;
      const _component_CryptoAbout = __nuxt_component_2;
      const _component_CryptoFeatures = __nuxt_component_3;
      const _component_CryptoMembership = __nuxt_component_4;
      const _component_CryptoTestimonials = __nuxt_component_5;
      const _component_LiveMarketData = __nuxt_component_6;
      const _component_CryptoDemo = __nuxt_component_7;
      const _component_CryptoFooter = __nuxt_component_8;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen transition-colors duration-300 bg-gradient-to-br from-sky-50 via-white to-sky-100 text-gray-900" }, _attrs))}><div class="fixed inset-0 overflow-hidden pointer-events-none"><div class="absolute top-20 left-10 w-72 h-72 bg-sky-400/20 rounded-full blur-3xl animate-pulse-slow"></div><div class="absolute bottom-20 right-10 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "1s" })}"></div><div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-300/15 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "2s" })}"></div><div class="absolute inset-0 opacity-30"><div class="w-full h-full" style="${ssrRenderStyle({ "background-image": "radial-gradient(circle at 1px 1px, #e0f2fe 1px, transparent 0)", "background-size": "60px 60px" })}"></div></div></div><div class="relative z-10">`);
      _push(ssrRenderComponent(_component_CryptoHeader, null, null, _parent));
      _push(`<main>`);
      _push(ssrRenderComponent(_component_CryptoHero, null, null, _parent));
      _push(ssrRenderComponent(_component_CryptoAbout, null, null, _parent));
      _push(ssrRenderComponent(_component_CryptoFeatures, null, null, _parent));
      _push(ssrRenderComponent(_component_CryptoMembership, null, null, _parent));
      _push(ssrRenderComponent(_component_CryptoTestimonials, null, null, _parent));
      _push(ssrRenderComponent(_component_LiveMarketData, null, null, _parent));
      _push(ssrRenderComponent(_component_CryptoDemo, null, null, _parent));
      _push(`</main>`);
      _push(ssrRenderComponent(_component_CryptoFooter, null, null, _parent));
      _push(`</div></div>`);
    };
  }
};
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const _sfc_main$1 = {
  __name: "nuxt-error-page",
  __ssrInlineRender: true,
  props: {
    error: Object
  },
  setup(__props) {
    const props = __props;
    const _error = props.error;
    _error.stack ? _error.stack.split("\n").splice(1).map((line) => {
      const text = line.replace("webpack:/", "").replace(".vue", ".js").trim();
      return {
        text,
        internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
      };
    }).map((i) => `<span class="stack${i.internal ? " internal" : ""}">${i.text}</span>`).join("\n") : "";
    const statusCode = Number(_error.statusCode || 500);
    const is404 = statusCode === 404;
    const statusMessage = _error.statusMessage ?? (is404 ? "Page Not Found" : "Internal Server Error");
    const description = _error.message || _error.toString();
    const stack = void 0;
    const _Error404 = defineAsyncComponent(() => import('./error-404-CHjCB4rq.mjs'));
    const _Error = defineAsyncComponent(() => import('./error-500-D5ek3Zgu.mjs'));
    const ErrorTemplate = is404 ? _Error404 : _Error;
    return (_ctx, _push, _parent, _attrs) => {
      _push(ssrRenderComponent(unref(ErrorTemplate), mergeProps({ statusCode: unref(statusCode), statusMessage: unref(statusMessage), description: unref(description), stack: unref(stack) }, _attrs), null, _parent));
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-error-page.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const IslandRenderer = () => null;
    const nuxtApp = useNuxtApp();
    nuxtApp.deferHydration();
    nuxtApp.ssrContext.url;
    const SingleRenderer = false;
    provide(PageRouteSymbol, useRoute());
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    const abortRender = error.value && !nuxtApp.ssrContext.error;
    onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        const p = nuxtApp.runWithContext(() => showError(err));
        onServerPrefetch(() => p);
        return false;
      }
    });
    const islandContext = nuxtApp.ssrContext.islandContext;
    return (_ctx, _push, _parent, _attrs) => {
      ssrRenderSuspense(_push, {
        default: () => {
          if (unref(abortRender)) {
            _push(`<div></div>`);
          } else if (unref(error)) {
            _push(ssrRenderComponent(unref(_sfc_main$1), { error: unref(error) }, null, _parent));
          } else if (unref(islandContext)) {
            _push(ssrRenderComponent(unref(IslandRenderer), { context: unref(islandContext) }, null, _parent));
          } else if (unref(SingleRenderer)) {
            ssrRenderVNode(_push, createVNode(resolveDynamicComponent(unref(SingleRenderer)), null, null), _parent);
          } else {
            _push(ssrRenderComponent(unref(_sfc_main$2), null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
let entry;
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = createApp(_sfc_main);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (error) {
      await nuxt.hooks.callHook("app:error", error);
      nuxt.payload.error ||= createError(error);
    }
    if (ssrContext?._renderResponse) {
      throw new Error("skipping render");
    }
    return vueApp;
  };
}
const entry$1 = (ssrContext) => entry(ssrContext);

export { _export_sfc as _, useNuxtApp as a, useRuntimeConfig as b, nuxtLinkDefaults as c, entry$1 as default, navigateTo as n, resolveRouteObject as r, tryUseNuxtApp as t, useRouter as u };
//# sourceMappingURL=server.mjs.map
