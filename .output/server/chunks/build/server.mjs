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
      _push(`<header${ssrRenderAttrs(mergeProps({ class: "fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-orange-500/50 shadow-2xl" }, _attrs))} data-v-92e806c4><div class="scan-line" data-v-92e806c4></div><div class="container-custom" data-v-92e806c4><nav class="flex items-center justify-between py-4" data-v-92e806c4><div class="flex items-center space-x-3" data-v-92e806c4><div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg animate-glow border border-orange-400/50" data-v-92e806c4><span class="text-2xl" data-v-92e806c4>🎮</span></div><div data-v-92e806c4><h1 class="text-xl font-bold text-white font-orbitron" data-v-92e806c4>CryptoGaming</h1><p class="text-xs text-orange-400 font-medium tracking-wider" data-v-92e806c4>ULTIMATE CRYPTO ARENA</p></div></div><div class="hidden lg:flex items-center space-x-8" data-v-92e806c4><a href="#home" class="nav-link text-sm font-medium" data-v-92e806c4>HOME</a><a href="#about" class="nav-link text-sm font-medium" data-v-92e806c4>ABOUT</a><a href="#features" class="nav-link text-sm font-medium" data-v-92e806c4>FEATURES</a><a href="#membership" class="nav-link text-sm font-medium" data-v-92e806c4>MEMBERSHIP</a><a href="#testimonials" class="nav-link text-sm font-medium" data-v-92e806c4>LEADERBOARD</a><a href="#market" class="nav-link text-sm font-medium" data-v-92e806c4>MARKET</a></div><div class="hidden lg:flex items-center space-x-4" data-v-92e806c4><button class="p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 transition-colors duration-200 text-orange-400 border border-orange-500/30"${ssrRenderAttr("title", unref(isDark) ? "Switch to Light Mode" : "Switch to Dark Mode")} data-v-92e806c4>`);
      if (unref(isDark)) {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-92e806c4><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" data-v-92e806c4></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-92e806c4><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" data-v-92e806c4></path></svg>`);
      }
      _push(`</button><button class="px-4 py-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium border border-orange-500/30 rounded-lg hover:bg-orange-500/10" data-v-92e806c4> LOGIN </button><a href="#membership" class="btn-primary text-sm" data-v-92e806c4> JOIN ARENA </a></div><button class="lg:hidden p-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 transition-colors duration-200 text-orange-400 border border-orange-500/30" data-v-92e806c4><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-92e806c4>`);
      if (!unref(isMobileMenuOpen)) {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-v-92e806c4></path>`);
      } else {
        _push(`<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-v-92e806c4></path>`);
      }
      _push(`</svg></button></nav><div style="${ssrRenderStyle(unref(isMobileMenuOpen) ? null : { display: "none" })}" class="lg:hidden py-4 border-t border-orange-500/30 animate-fade-in-down bg-black/95 backdrop-blur-sm rounded-b-lg shadow-2xl" data-v-92e806c4><div class="flex flex-col space-y-4" data-v-92e806c4><a href="#home" class="nav-link text-base font-medium py-2" data-v-92e806c4>HOME</a><a href="#about" class="nav-link text-base font-medium py-2" data-v-92e806c4>ABOUT</a><a href="#features" class="nav-link text-base font-medium py-2" data-v-92e806c4>FEATURES</a><a href="#membership" class="nav-link text-base font-medium py-2" data-v-92e806c4>MEMBERSHIP</a><a href="#testimonials" class="nav-link text-base font-medium py-2" data-v-92e806c4>LEADERBOARD</a><a href="#market" class="nav-link text-base font-medium py-2" data-v-92e806c4>MARKET</a><div class="pt-4 border-t border-orange-500/30" data-v-92e806c4><button class="w-full flex items-center justify-center p-3 mb-3 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 transition-colors duration-200 text-orange-400 border border-orange-500/30" data-v-92e806c4>`);
      if (unref(isDark)) {
        _push(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-92e806c4><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" data-v-92e806c4></path></svg>`);
      } else {
        _push(`<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" data-v-92e806c4><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" data-v-92e806c4></path></svg>`);
      }
      _push(`<span class="font-medium" data-v-92e806c4>${ssrInterpolate(unref(isDark) ? "LIGHT MODE" : "DARK MODE")}</span></button><a href="#membership" class="w-full btn-primary text-sm mb-3 block text-center" data-v-92e806c4> JOIN ARENA </a><button class="w-full px-4 py-2 text-orange-400 hover:text-orange-300 transition-colors duration-200 font-medium border border-orange-500/30 rounded-lg hover:bg-orange-500/10" data-v-92e806c4> LOGIN </button></div></div></div></div></header>`);
    };
  }
};
const _sfc_setup$b = _sfc_main$b.setup;
_sfc_main$b.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoHeader.vue");
  return _sfc_setup$b ? _sfc_setup$b(props, ctx) : void 0;
};
const __nuxt_component_0 = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["__scopeId", "data-v-92e806c4"]]);
const _sfc_main$a = {
  __name: "CryptoHero",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "home",
        class: "relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
      }, _attrs))} data-v-6c4f0f1d><div class="absolute inset-0" data-v-6c4f0f1d><div class="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow" data-v-6c4f0f1d></div><div class="absolute bottom-20 right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "1s" })}" data-v-6c4f0f1d></div><div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-400/5 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-6c4f0f1d></div></div><div class="container-custom relative z-10" data-v-6c4f0f1d><div class="grid lg:grid-cols-2 gap-16 items-center" data-v-6c4f0f1d><div class="text-center lg:text-left space-y-8" data-v-6c4f0f1d><div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 shadow-lg animate-glow" data-v-6c4f0f1d><span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" data-v-6c4f0f1d></span> JOIN 10,000+ CRYPTO WARRIORS </div><h1 class="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight font-orbitron" data-v-6c4f0f1d><span class="text-white" data-v-6c4f0f1d>ENTER THE</span><br data-v-6c4f0f1d><span class="text-gradient-primary animate-neon" data-v-6c4f0f1d>CRYPTO ARENA</span></h1><p class="text-xl md:text-2xl text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0" data-v-6c4f0f1d> Dominate the crypto battlefield with expert strategies, real-time signals, and an elite community of traders. Level up your crypto game. </p><div class="grid grid-cols-3 gap-4 max-w-md mx-auto lg:mx-0" data-v-6c4f0f1d><div class="gaming-stat" data-v-6c4f0f1d><div class="text-2xl font-bold text-orange-400 font-orbitron" data-v-6c4f0f1d>10K+</div><div class="text-sm text-gray-400" data-v-6c4f0f1d>ACTIVE PLAYERS</div></div><div class="gaming-stat" data-v-6c4f0f1d><div class="text-2xl font-bold text-orange-400 font-orbitron" data-v-6c4f0f1d>50+</div><div class="text-sm text-gray-400" data-v-6c4f0f1d>BATTLE ZONES</div></div><div class="gaming-stat" data-v-6c4f0f1d><div class="text-2xl font-bold text-orange-400 font-orbitron" data-v-6c4f0f1d>24/7</div><div class="text-sm text-gray-400" data-v-6c4f0f1d>SUPPORT</div></div></div><div class="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start" data-v-6c4f0f1d><a href="#membership" class="btn-primary inline-flex items-center justify-center text-lg px-8 py-4" data-v-6c4f0f1d><span class="mr-2" data-v-6c4f0f1d>⚔️</span> ENTER ARENA </a><a href="#features" class="btn-outline inline-flex items-center justify-center text-lg px-8 py-4" data-v-6c4f0f1d><span class="mr-2" data-v-6c4f0f1d>🎯</span> VIEW SKILLS </a></div><div class="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-400" data-v-6c4f0f1d><div class="flex items-center" data-v-6c4f0f1d><span class="w-4 h-4 bg-green-500 rounded-full mr-2 animate-pulse" data-v-6c4f0f1d></span> VERIFIED PLAYERS ONLY </div><div class="flex items-center" data-v-6c4f0f1d><span class="w-4 h-4 bg-orange-500 rounded-full mr-2 animate-pulse" data-v-6c4f0f1d></span> SECURE &amp; PRIVATE </div></div></div><div class="relative" data-v-6c4f0f1d><div class="space-y-4" data-v-6c4f0f1d><div class="gaming-interface-card trading" data-v-6c4f0f1d><div class="flex items-center justify-between mb-3" data-v-6c4f0f1d><div class="flex items-center space-x-3" data-v-6c4f0f1d><div class="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center shadow-lg border border-green-500/50" data-v-6c4f0f1d><span class="text-white text-xl" data-v-6c4f0f1d>📈</span></div><div data-v-6c4f0f1d><h3 class="font-semibold text-white font-orbitron" data-v-6c4f0f1d>TRADING TERMINAL</h3><p class="text-sm text-green-400" data-v-6c4f0f1d>LIVE BATTLE STATION</p></div></div><div class="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded-full font-orbitron" data-v-6c4f0f1d> ONLINE </div></div><div class="text-sm text-gray-300" data-v-6c4f0f1d><p data-v-6c4f0f1d>🔥 HOT: Bitcoin ETF momentum</p><p data-v-6c4f0f1d>⚡ 24 new signals today</p></div></div><div class="gaming-interface-card leaderboard" data-v-6c4f0f1d><div class="flex items-center justify-between mb-3" data-v-6c4f0f1d><div class="flex items-center space-x-3" data-v-6c4f0f1d><div class="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center shadow-lg border border-orange-500/50" data-v-6c4f0f1d><span class="text-white text-xl" data-v-6c4f0f1d>🏆</span></div><div data-v-6c4f0f1d><h3 class="font-semibold text-white font-orbitron" data-v-6c4f0f1d>LEADERBOARD</h3><p class="text-sm text-orange-400" data-v-6c4f0f1d>TOP PERFORMERS</p></div></div><div class="bg-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full font-orbitron" data-v-6c4f0f1d> LIVE </div></div><div class="text-sm text-gray-300" data-v-6c4f0f1d><p data-v-6c4f0f1d>🥇 #1: CryptoMaster - +450%</p><p data-v-6c4f0f1d>🥈 #2: TradingNinja - +320%</p></div></div><div class="gaming-interface-card chat" data-v-6c4f0f1d><div class="flex items-center justify-between mb-3" data-v-6c4f0f1d><div class="flex items-center space-x-3" data-v-6c4f0f1d><div class="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shadow-lg border border-purple-500/50" data-v-6c4f0f1d><span class="text-white text-xl" data-v-6c4f0f1d>💬</span></div><div data-v-6c4f0f1d><h3 class="font-semibold text-white font-orbitron" data-v-6c4f0f1d>ARENA CHAT</h3><p class="text-sm text-purple-400" data-v-6c4f0f1d>STRATEGY ROOM</p></div></div><div class="bg-purple-500 text-black text-xs font-bold px-2 py-1 rounded-full font-orbitron" data-v-6c4f0f1d> ACTIVE </div></div><div class="text-sm text-gray-300" data-v-6c4f0f1d><p data-v-6c4f0f1d>🎮 New DeFi strategy shared</p><p data-v-6c4f0f1d>⚔️ Battle plan for ETH</p></div></div></div><div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full opacity-20 animate-float" data-v-6c4f0f1d></div><div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-20 animate-float" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-6c4f0f1d></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$a = _sfc_main$a.setup;
_sfc_main$a.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoHero.vue");
  return _sfc_setup$a ? _sfc_setup$a(props, ctx) : void 0;
};
const __nuxt_component_1 = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["__scopeId", "data-v-6c4f0f1d"]]);
const _sfc_main$9 = {
  __name: "CryptoAbout",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "about",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-1e71abf8><div class="container-custom relative z-10" data-v-1e71abf8><div class="grid lg:grid-cols-2 gap-16 items-center" data-v-1e71abf8><div class="space-y-8" data-v-1e71abf8><div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 shadow-lg" data-v-1e71abf8><span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" data-v-1e71abf8></span> About Our Crypto Arena </div><h2 class="text-4xl md:text-5xl font-bold text-white leading-tight font-orbitron" data-v-1e71abf8> The Ultimate <span class="text-gradient-primary" data-v-1e71abf8>Crypto Gaming</span> Arena </h2><p class="text-xl text-gray-200 leading-relaxed" data-v-1e71abf8> CryptoGaming is the premier destination for crypto warriors, traders, developers, and investors. We&#39;re not just a platform – we&#39;re a thriving gaming ecosystem where strategy meets opportunity, and where rookies become legends. </p><div class="space-y-6" data-v-1e71abf8><div class="flex items-start space-x-4" data-v-1e71abf8><div class="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-500/30" data-v-1e71abf8><span class="text-2xl" data-v-1e71abf8>🌍</span></div><div data-v-1e71abf8><h3 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-1e71abf8>Global Arena</h3><p class="text-gray-300" data-v-1e71abf8> Join thousands of warriors from over 50 battle zones, sharing strategies and insights across different time zones and cultures. Our diverse community brings unique perspectives from every corner of the crypto world. </p></div></div><div class="flex items-start space-x-4" data-v-1e71abf8><div class="w-12 h-12 bg-gradient-to-br from-orange-600/20 to-orange-700/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-500/30" data-v-1e71abf8><span class="text-2xl" data-v-1e71abf8>🚀</span></div><div data-v-1e71abf8><h3 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-1e71abf8>Innovation Hub</h3><p class="text-gray-300" data-v-1e71abf8> We&#39;re constantly exploring new technologies, from DeFi protocols to NFT marketplaces, staying ahead of the crypto curve. Our members are often the first to discover and discuss emerging trends. </p></div></div><div class="flex items-start space-x-4" data-v-1e71abf8><div class="w-12 h-12 bg-gradient-to-br from-orange-400/20 to-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-orange-500/30" data-v-1e71abf8><span class="text-2xl" data-v-1e71abf8>🤝</span></div><div data-v-1e71abf8><h3 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-1e71abf8>Collaborative Gaming</h3><p class="text-gray-300" data-v-1e71abf8> Share strategies, discuss market trends, and learn from both beginners and seasoned professionals in our supportive environment. Every warrior has something valuable to contribute. </p></div></div><div class="flex items-start space-x-4" data-v-1e71abf8><div class="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30" data-v-1e71abf8><span class="text-2xl" data-v-1e71abf8>💎</span></div><div data-v-1e71abf8><h3 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-1e71abf8>Exclusive Rewards</h3><p class="text-gray-300" data-v-1e71abf8> Get early access to promising projects, presales, and investment opportunities shared exclusively within our arena. Our network of experts and insiders provides access you won&#39;t find elsewhere. </p></div></div></div><div class="flex flex-col sm:flex-row gap-4" data-v-1e71abf8><a href="#membership" class="btn-primary text-lg px-8 py-4" data-v-1e71abf8><span class="mr-2" data-v-1e71abf8>⚔️</span> Join Our Arena </a><a href="#testimonials" class="btn-outline text-lg px-8 py-4" data-v-1e71abf8><span class="mr-2" data-v-1e71abf8>🏆</span> View Leaderboard </a></div></div><div class="relative" data-v-1e71abf8><div class="grid grid-cols-2 gap-6" data-v-1e71abf8><div class="gaming-stat-card" data-v-1e71abf8><div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron" data-v-1e71abf8>10K+</div><div class="text-gray-300" data-v-1e71abf8>ACTIVE WARRIORS</div></div><div class="gaming-stat-card" data-v-1e71abf8><div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron" data-v-1e71abf8>50+</div><div class="text-gray-300" data-v-1e71abf8>BATTLE ZONES</div></div><div class="gaming-stat-card" data-v-1e71abf8><div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron" data-v-1e71abf8>24/7</div><div class="text-gray-300" data-v-1e71abf8>SUPPORT</div></div><div class="gaming-stat-card" data-v-1e71abf8><div class="text-3xl font-bold text-orange-400 mb-2 font-orbitron" data-v-1e71abf8>100+</div><div class="text-gray-300" data-v-1e71abf8>DAILY BATTLES</div></div></div><div class="mt-8 gaming-activity-card" data-v-1e71abf8><h4 class="text-lg font-semibold text-white mb-4 font-orbitron" data-v-1e71abf8>Live Arena Activity</h4><div class="space-y-3" data-v-1e71abf8><div class="flex items-center justify-between text-sm" data-v-1e71abf8><span class="text-gray-300" data-v-1e71abf8>Discord Online</span><span class="text-orange-400 font-semibold" data-v-1e71abf8>5,247</span></div><div class="flex items-center justify-between text-sm" data-v-1e71abf8><span class="text-gray-300" data-v-1e71abf8>New Messages (24h)</span><span class="text-orange-400 font-semibold" data-v-1e71abf8>12,843</span></div><div class="flex items-center justify-between text-sm" data-v-1e71abf8><span class="text-gray-300" data-v-1e71abf8>Active Threads</span><span class="text-orange-400 font-semibold" data-v-1e71abf8>156</span></div><div class="flex items-center justify-between text-sm" data-v-1e71abf8><span class="text-gray-300" data-v-1e71abf8>New Warriors Today</span><span class="text-orange-400 font-semibold" data-v-1e71abf8>47</span></div></div></div><div class="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full opacity-20 animate-float" data-v-1e71abf8></div><div class="absolute -bottom-10 -left-10 w-16 h-16 bg-gradient-to-br from-orange-300 to-orange-400 rounded-full opacity-20 animate-float" style="${ssrRenderStyle({ "animation-delay": "2s" })}" data-v-1e71abf8></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$9 = _sfc_main$9.setup;
_sfc_main$9.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoAbout.vue");
  return _sfc_setup$9 ? _sfc_setup$9(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["__scopeId", "data-v-1e71abf8"]]);
const _sfc_main$8 = {
  __name: "CryptoFeatures",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "features",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-3f65f2c0><div class="container-custom relative z-10" data-v-3f65f2c0><div class="text-center mb-16" data-v-3f65f2c0><div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 mb-6 shadow-lg" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" data-v-3f65f2c0></span> Why Join Our Crypto Arena? </div><h2 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 font-orbitron" data-v-3f65f2c0> Exclusive <span class="text-gradient-primary" data-v-3f65f2c0>Gaming Arena</span> Benefits </h2><p class="text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto" data-v-3f65f2c0> Join our thriving crypto gaming arena and unlock exclusive benefits designed to level up your crypto game </p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8" data-v-3f65f2c0><div class="feature-card group" data-v-3f65f2c0><div class="feature-icon" data-v-3f65f2c0><span class="text-3xl" data-v-3f65f2c0>👥</span></div><h3 class="text-xl font-semibold text-white mb-4 font-orbitron" data-v-3f65f2c0>Exclusive Arena Access</h3><p class="text-gray-300 mb-6" data-v-3f65f2c0> Join our private Discord, Telegram, and forum communities with verified warriors only. Network with crypto professionals and enthusiasts. </p><ul class="space-y-2 text-gray-400 text-sm" data-v-3f65f2c0><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Private Discord channels </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Telegram groups by expertise </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Member-only forums </li></ul></div><div class="feature-card group" data-v-3f65f2c0><div class="feature-icon" data-v-3f65f2c0><span class="text-3xl" data-v-3f65f2c0>🧠</span></div><h3 class="text-xl font-semibold text-white mb-4 font-orbitron" data-v-3f65f2c0>Expert Strategies &amp; Analysis</h3><p class="text-gray-300 mb-6" data-v-3f65f2c0> Get daily market analysis, trading signals, and insights from our team of crypto experts and professional traders. </p><ul class="space-y-2 text-gray-400 text-sm" data-v-3f65f2c0><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Daily market reports </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Trading signal alerts </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Expert Q&amp;A sessions </li></ul></div><div class="feature-card group" data-v-3f65f2c0><div class="feature-icon" data-v-3f65f2c0><span class="text-3xl" data-v-3f65f2c0>📚</span></div><h3 class="text-xl font-semibold text-white mb-4 font-orbitron" data-v-3f65f2c0>Gaming Resources</h3><p class="text-gray-300 mb-6" data-v-3f65f2c0> Access our comprehensive library of crypto courses, tutorials, and resources for all skill levels. </p><ul class="space-y-2 text-gray-400 text-sm" data-v-3f65f2c0><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Beginner to advanced courses </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Weekly webinars </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Resource library </li></ul></div><div class="feature-card group" data-v-3f65f2c0><div class="feature-icon" data-v-3f65f2c0><span class="text-3xl" data-v-3f65f2c0>🎯</span></div><h3 class="text-xl font-semibold text-white mb-4 font-orbitron" data-v-3f65f2c0>Arena Events</h3><p class="text-gray-300 mb-6" data-v-3f65f2c0> Attend exclusive meetups, conferences, and networking events with industry leaders and fellow crypto enthusiasts. </p><ul class="space-y-2 text-gray-400 text-sm" data-v-3f65f2c0><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Local meetups </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Virtual conferences </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Industry networking </li></ul></div><div class="feature-card group" data-v-3f65f2c0><div class="feature-icon" data-v-3f65f2c0><span class="text-3xl" data-v-3f65f2c0>💎</span></div><h3 class="text-xl font-semibold text-white mb-4 font-orbitron" data-v-3f65f2c0>Early Access &amp; Rewards</h3><p class="text-gray-300 mb-6" data-v-3f65f2c0> Get early access to promising projects, presales, and investment opportunities shared exclusively within our arena. </p><ul class="space-y-2 text-gray-400 text-sm" data-v-3f65f2c0><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Project presales </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> IDO access </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Private sales </li></ul></div><div class="feature-card group" data-v-3f65f2c0><div class="feature-icon" data-v-3f65f2c0><span class="text-3xl" data-v-3f65f2c0>🛡️</span></div><h3 class="text-xl font-semibold text-white mb-4 font-orbitron" data-v-3f65f2c0>24/7 Support &amp; Moderation</h3><p class="text-gray-300 mb-6" data-v-3f65f2c0> Enjoy a safe, moderated environment with round-the-clock support and active community management. </p><ul class="space-y-2 text-gray-400 text-sm" data-v-3f65f2c0><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Active moderation </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Support tickets </li><li class="flex items-center" data-v-3f65f2c0><span class="w-2 h-2 bg-orange-500 rounded-full mr-3" data-v-3f65f2c0></span> Community guidelines </li></ul></div></div><div class="text-center mt-16" data-v-3f65f2c0><div class="gaming-cta-card p-8 max-w-2xl mx-auto" data-v-3f65f2c0><h3 class="text-2xl font-bold text-white mb-4 font-orbitron" data-v-3f65f2c0>Ready to Enter Our Crypto Arena?</h3><p class="text-gray-300 mb-6" data-v-3f65f2c0> Don&#39;t miss out on the opportunity to dominate with thousands of crypto warriors and professionals. </p><div class="flex flex-col sm:flex-row gap-4 justify-center" data-v-3f65f2c0><button class="btn-primary text-lg px-8 py-4" data-v-3f65f2c0><span class="mr-2" data-v-3f65f2c0>🚀</span> Enter Arena Now </button><button class="btn-outline text-lg px-8 py-4" data-v-3f65f2c0><span class="mr-2" data-v-3f65f2c0>📋</span> View Membership Tiers </button></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$8 = _sfc_main$8.setup;
_sfc_main$8.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoFeatures.vue");
  return _sfc_setup$8 ? _sfc_setup$8(props, ctx) : void 0;
};
const __nuxt_component_3 = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["__scopeId", "data-v-3f65f2c0"]]);
const _sfc_main$7 = {
  __name: "CryptoMembership",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "membership",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-a8873163><div class="container-custom relative z-10" data-v-a8873163><div class="text-center mb-16" data-v-a8873163><div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 mb-6 shadow-lg" data-v-a8873163><span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" data-v-a8873163></span> Choose Your Arena Tier </div><h2 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 font-orbitron" data-v-a8873163> Crypto Arena <span class="text-gradient-primary" data-v-a8873163>Membership Tiers</span></h2><p class="text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto" data-v-a8873163> Select the perfect membership level for your crypto gaming journey. All tiers include access to our exclusive arena. </p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" data-v-a8873163><div class="membership-card" data-v-a8873163><div class="membership-header" data-v-a8873163><h3 class="text-2xl font-bold text-white mb-2 font-orbitron" data-v-a8873163>Rookie Warrior</h3><div class="text-4xl font-bold text-orange-400 mb-2" data-v-a8873163>$0<span class="text-lg text-gray-400" data-v-a8873163>/month</span></div><p class="text-gray-300" data-v-a8873163>Perfect for crypto beginners</p></div><div class="membership-features" data-v-a8873163><ul class="space-y-3" data-v-a8873163><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Access to public channels</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Basic market updates</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Arena forum access</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Weekly newsletter</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-gray-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-500 line-through" data-v-a8873163>Premium channels</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-gray-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-500 line-through" data-v-a8873163>Trading signals</span></li></ul></div><div class="membership-cta" data-v-a8873163><button class="btn-outline w-full" data-v-a8873163>Join Free</button></div></div><div class="membership-card featured" data-v-a8873163><div class="membership-badge" data-v-a8873163>Most Popular</div><div class="membership-header" data-v-a8873163><h3 class="text-2xl font-bold text-white mb-2 font-orbitron" data-v-a8873163>Elite Warrior</h3><div class="text-4xl font-bold text-orange-400 mb-2" data-v-a8873163>$29<span class="text-lg text-gray-400" data-v-a8873163>/month</span></div><p class="text-gray-300" data-v-a8873163>For active crypto enthusiasts</p></div><div class="membership-features" data-v-a8873163><ul class="space-y-3" data-v-a8873163><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Everything in Rookie</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Premium Discord channels</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Daily trading signals</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Expert Q&amp;A sessions</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Portfolio tracking tools</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Priority support</span></li></ul></div><div class="membership-cta" data-v-a8873163><button class="btn-primary w-full" data-v-a8873163>Join Elite</button></div></div><div class="membership-card" data-v-a8873163><div class="membership-header" data-v-a8873163><h3 class="text-2xl font-bold text-white mb-2 font-orbitron" data-v-a8873163>Legendary Warrior</h3><div class="text-4xl font-bold text-orange-400 mb-2" data-v-a8873163>$99<span class="text-lg text-gray-400" data-v-a8873163>/month</span></div><p class="text-gray-300" data-v-a8873163>For serious investors &amp; traders</p></div><div class="membership-features" data-v-a8873163><ul class="space-y-3" data-v-a8873163><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Everything in Elite</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>1-on-1 expert consultations</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Early access to presales</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Private investment group</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>Exclusive networking events</span></li><li class="flex items-center" data-v-a8873163><span class="w-5 h-5 bg-green-500 rounded-full mr-3 flex-shrink-0" data-v-a8873163></span><span class="text-gray-300" data-v-a8873163>24/7 VIP support</span></li></ul></div><div class="membership-cta" data-v-a8873163><button class="btn-outline w-full" data-v-a8873163>Join Legendary</button></div></div></div><div class="text-center" data-v-a8873163><h3 class="text-2xl font-bold text-white mb-8 font-orbitron" data-v-a8873163>All Warriors Get Access To:</h3><div class="grid md:grid-cols-4 gap-6" data-v-a8873163><div class="benefit-item" data-v-a8873163><div class="w-16 h-16 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-500/30" data-v-a8873163><span class="text-2xl" data-v-a8873163>📱</span></div><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>Mobile App</h4><p class="text-gray-300 text-sm" data-v-a8873163>Access our arena on the go</p></div><div class="benefit-item" data-v-a8873163><div class="w-16 h-16 bg-gradient-to-br from-orange-600/20 to-orange-700/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-500/30" data-v-a8873163><span class="text-2xl" data-v-a8873163>🎥</span></div><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>Video Content</h4><p class="text-gray-300 text-sm" data-v-a8873163>Educational videos and tutorials</p></div><div class="benefit-item" data-v-a8873163><div class="w-16 h-16 bg-gradient-to-br from-orange-400/20 to-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-orange-500/30" data-v-a8873163><span class="text-2xl" data-v-a8873163>📊</span></div><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>Market Tools</h4><p class="text-gray-300 text-sm" data-v-a8873163>Charts, alerts, and analysis</p></div><div class="benefit-item" data-v-a8873163><div class="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center mx-auto mb-4 border border-purple-500/30" data-v-a8873163><span class="text-2xl" data-v-a8873163>🎁</span></div><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>Rewards Program</h4><p class="text-gray-300 text-sm" data-v-a8873163>Earn rewards for participation</p></div></div></div><div class="mt-16" data-v-a8873163><h3 class="text-2xl font-bold text-white text-center mb-8 font-orbitron" data-v-a8873163>Frequently Asked Questions</h3><div class="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto" data-v-a8873163><div class="faq-item" data-v-a8873163><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>Can I cancel anytime?</h4><p class="text-gray-300" data-v-a8873163>Yes, you can cancel your subscription at any time. No long-term commitments required.</p></div><div class="faq-item" data-v-a8873163><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>Is there a free trial?</h4><p class="text-gray-300" data-v-a8873163>Elite and Legendary memberships come with a 7-day free trial to test all features.</p></div><div class="faq-item" data-v-a8873163><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>How do I join the arena?</h4><p class="text-gray-300" data-v-a8873163>After signing up, you&#39;ll receive an email with links to join our Discord and Telegram groups.</p></div><div class="faq-item" data-v-a8873163><h4 class="text-lg font-semibold text-white mb-2 font-orbitron" data-v-a8873163>Are trading signals profitable?</h4><p class="text-gray-300" data-v-a8873163>While we provide analysis, all trading decisions are your own. Past performance doesn&#39;t guarantee future results.</p></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$7 = _sfc_main$7.setup;
_sfc_main$7.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoMembership.vue");
  return _sfc_setup$7 ? _sfc_setup$7(props, ctx) : void 0;
};
const __nuxt_component_4 = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["__scopeId", "data-v-a8873163"]]);
const _sfc_main$6 = {
  __name: "CryptoTestimonials",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<section${ssrRenderAttrs(mergeProps({
        id: "testimonials",
        class: "section-padding relative overflow-hidden"
      }, _attrs))} data-v-530bb761><div class="container-custom relative z-10" data-v-530bb761><div class="text-center mb-16" data-v-530bb761><div class="inline-flex items-center px-4 py-2 bg-orange-500/20 backdrop-blur-sm border border-orange-500/50 rounded-full text-sm font-medium text-orange-300 mb-6 shadow-lg" data-v-530bb761><span class="w-2 h-2 bg-orange-400 rounded-full mr-2 animate-pulse" data-v-530bb761></span> Warrior Success Stories </div><h2 class="text-4xl md:text-5xl font-bold text-white leading-tight mb-6 font-orbitron" data-v-530bb761><span class="text-gradient-primary" data-v-530bb761>Legendary Warriors</span> Share Their Victories </h2><p class="text-xl text-gray-200 leading-relaxed max-w-3xl mx-auto" data-v-530bb761> Discover how our crypto arena has transformed the trading journey of thousands of warriors worldwide </p></div><div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16" data-v-530bb761><div class="testimonial-card" data-v-530bb761><div class="testimonial-header" data-v-530bb761><img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&amp;h=150&amp;fit=crop&amp;crop=face" alt="Alex Chen" class="w-16 h-16 rounded-full object-cover shadow-lg" data-v-530bb761><div class="ml-4" data-v-530bb761><h4 class="text-lg font-semibold text-white font-orbitron" data-v-530bb761>Alex Chen</h4><p class="text-orange-400 text-sm" data-v-530bb761>Elite Warrior</p><div class="flex items-center mt-1" data-v-530bb761><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span></div></div></div><div class="testimonial-content" data-v-530bb761><p class="text-gray-300 italic" data-v-530bb761> &quot;The CryptoGaming arena completely changed my crypto journey. The daily signals and expert analysis helped me turn a $5K investment into $45K in just 6 months. The community is incredibly supportive!&quot; </p></div><div class="testimonial-footer" data-v-530bb761><span class="text-sm text-gray-400" data-v-530bb761>Joined 8 months ago</span><span class="text-sm text-green-400 font-semibold" data-v-530bb761>+800% ROI</span></div></div><div class="testimonial-card" data-v-530bb761><div class="testimonial-header" data-v-530bb761><img src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&amp;h=150&amp;fit=crop&amp;crop=face" alt="Sarah Rodriguez" class="w-16 h-16 rounded-full object-cover shadow-lg" data-v-530bb761><div class="ml-4" data-v-530bb761><h4 class="text-lg font-semibold text-white font-orbitron" data-v-530bb761>Sarah Rodriguez</h4><p class="text-orange-400 text-sm" data-v-530bb761>Legendary Warrior</p><div class="flex items-center mt-1" data-v-530bb761><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span></div></div></div><div class="testimonial-content" data-v-530bb761><p class="text-gray-300 italic" data-v-530bb761> &quot;As a beginner, I was overwhelmed by crypto. The arena&#39;s educational resources and patient community helped me build confidence. Now I&#39;m making informed decisions and seeing consistent profits!&quot; </p></div><div class="testimonial-footer" data-v-530bb761><span class="text-sm text-gray-400" data-v-530bb761>Joined 1 year ago</span><span class="text-sm text-green-400 font-semibold" data-v-530bb761>+350% ROI</span></div></div><div class="testimonial-card" data-v-530bb761><div class="testimonial-header" data-v-530bb761><img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&amp;h=150&amp;fit=crop&amp;crop=face" alt="Marcus Johnson" class="w-16 h-16 rounded-full object-cover shadow-lg" data-v-530bb761><div class="ml-4" data-v-530bb761><h4 class="text-lg font-semibold text-white font-orbitron" data-v-530bb761>Marcus Johnson</h4><p class="text-orange-400 text-sm" data-v-530bb761>Rookie Warrior</p><div class="flex items-center mt-1" data-v-530bb761><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span></div></div></div><div class="testimonial-content" data-v-530bb761><p class="text-gray-300 italic" data-v-530bb761> &quot;Even as a free member, I&#39;ve learned so much from the arena. The public channels are gold mines of information. Planning to upgrade to Elite soon to access the premium features!&quot; </p></div><div class="testimonial-footer" data-v-530bb761><span class="text-sm text-gray-400" data-v-530bb761>Joined 3 months ago</span><span class="text-sm text-green-400 font-semibold" data-v-530bb761>+120% ROI</span></div></div><div class="testimonial-card" data-v-530bb761><div class="testimonial-header" data-v-530bb761><img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&amp;h=150&amp;fit=crop&amp;crop=face" alt="Emma Thompson" class="w-16 h-16 rounded-full object-cover shadow-lg" data-v-530bb761><div class="ml-4" data-v-530bb761><h4 class="text-lg font-semibold text-white font-orbitron" data-v-530bb761>Emma Thompson</h4><p class="text-orange-400 text-sm" data-v-530bb761>Elite Warrior</p><div class="flex items-center mt-1" data-v-530bb761><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span></div></div></div><div class="testimonial-content" data-v-530bb761><p class="text-gray-300 italic" data-v-530bb761> &quot;The networking opportunities in this arena are incredible. I&#39;ve connected with developers, investors, and traders who&#39;ve opened doors I never knew existed. Worth every penny!&quot; </p></div><div class="testimonial-footer" data-v-530bb761><span class="text-sm text-gray-400" data-v-530bb761>Joined 6 months ago</span><span class="text-sm text-green-400 font-semibold" data-v-530bb761>+600% ROI</span></div></div><div class="testimonial-card" data-v-530bb761><div class="testimonial-header" data-v-530bb761><img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&amp;h=150&amp;fit=crop&amp;crop=face" alt="David Kim" class="w-16 h-16 rounded-full object-cover shadow-lg" data-v-530bb761><div class="ml-4" data-v-530bb761><h4 class="text-lg font-semibold text-white font-orbitron" data-v-530bb761>David Kim</h4><p class="text-orange-400 text-sm" data-v-530bb761>Legendary Warrior</p><div class="flex items-center mt-1" data-v-530bb761><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span></div></div></div><div class="testimonial-content" data-v-530bb761><p class="text-gray-300 italic" data-v-530bb761> &quot;The 1-on-1 consultations with experts have been game-changing. They helped me develop a solid strategy that&#39;s now generating consistent monthly returns. This arena is the real deal!&quot; </p></div><div class="testimonial-footer" data-v-530bb761><span class="text-sm text-gray-400" data-v-530bb761>Joined 1.5 years ago</span><span class="text-sm text-green-400 font-semibold" data-v-530bb761>+1200% ROI</span></div></div><div class="testimonial-card" data-v-530bb761><div class="testimonial-header" data-v-530bb761><img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&amp;h=150&amp;fit=crop&amp;crop=face" alt="Lisa Wang" class="w-16 h-16 rounded-full object-cover shadow-lg" data-v-530bb761><div class="ml-4" data-v-530bb761><h4 class="text-lg font-semibold text-white font-orbitron" data-v-530bb761>Lisa Wang</h4><p class="text-orange-400 text-sm" data-v-530bb761>Elite Warrior</p><div class="flex items-center mt-1" data-v-530bb761><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span><span class="text-yellow-400" data-v-530bb761>⭐</span></div></div></div><div class="testimonial-content" data-v-530bb761><p class="text-gray-300 italic" data-v-530bb761> &quot;I love how the arena combines education with practical trading. The portfolio tracking tools and market analysis have made me a much more disciplined trader. Highly recommended!&quot; </p></div><div class="testimonial-footer" data-v-530bb761><span class="text-sm text-gray-400" data-v-530bb761>Joined 9 months ago</span><span class="text-sm text-green-400 font-semibold" data-v-530bb761>+450% ROI</span></div></div></div><div class="text-center" data-v-530bb761><h3 class="text-2xl font-bold text-white mb-8 font-orbitron" data-v-530bb761>Arena Success Metrics</h3><div class="grid md:grid-cols-4 gap-6" data-v-530bb761><div class="metric-item" data-v-530bb761><div class="text-4xl font-bold text-orange-400 mb-2 font-orbitron" data-v-530bb761>98%</div><div class="text-gray-300" data-v-530bb761>Satisfaction Rate</div></div><div class="metric-item" data-v-530bb761><div class="text-4xl font-bold text-orange-400 mb-2 font-orbitron" data-v-530bb761>$2.4M</div><div class="text-gray-300" data-v-530bb761>Total Profits Generated</div></div><div class="metric-item" data-v-530bb761><div class="text-4xl font-bold text-orange-400 mb-2 font-orbitron" data-v-530bb761>15,000+</div><div class="text-gray-300" data-v-530bb761>Successful Trades</div></div><div class="metric-item" data-v-530bb761><div class="text-4xl font-bold text-orange-400 mb-2 font-orbitron" data-v-530bb761>4.9/5</div><div class="text-gray-300" data-v-530bb761>Average Rating</div></div></div></div></div></section>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoTestimonials.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const __nuxt_component_5 = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["__scopeId", "data-v-530bb761"]]);
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
      _push(`<footer${ssrRenderAttrs(mergeProps({ class: "border-t border-orange-500/50 bg-gradient-to-br from-black to-gray-900 relative overflow-hidden" }, _attrs))} data-v-8df44999><div class="absolute inset-0 opacity-10" data-v-8df44999><div class="w-full h-full" style="${ssrRenderStyle({ "background-image": "repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px), repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px)", "background-size": "60px 60px" })}" data-v-8df44999></div></div><div class="container-custom relative z-10 py-16" data-v-8df44999><div class="grid lg:grid-cols-4 gap-8 mb-12" data-v-8df44999><div class="lg:col-span-1" data-v-8df44999><div class="flex items-center space-x-3 mb-6" data-v-8df44999><div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg animate-glow border border-orange-400/50" data-v-8df44999><span class="text-2xl" data-v-8df44999>🎮</span></div><div data-v-8df44999><h3 class="text-xl font-bold text-white font-orbitron" data-v-8df44999>CryptoGaming</h3><p class="text-sm text-orange-400 font-medium tracking-wider" data-v-8df44999>ULTIMATE CRYPTO ARENA</p></div></div><p class="text-gray-300 mb-6 leading-relaxed" data-v-8df44999> Join the most elite crypto gaming arena where warriors become legends. Access expert strategies, real-time signals, and an exclusive community of crypto professionals. </p><div class="flex space-x-4" data-v-8df44999><a href="#" class="social-icon" data-v-8df44999><span class="text-xl" data-v-8df44999>📱</span></a><a href="#" class="social-icon" data-v-8df44999><span class="text-xl" data-v-8df44999>💬</span></a><a href="#" class="social-icon" data-v-8df44999><span class="text-xl" data-v-8df44999>📧</span></a><a href="#" class="social-icon" data-v-8df44999><span class="text-xl" data-v-8df44999>🎥</span></a></div></div><div data-v-8df44999><h4 class="text-lg font-semibold text-white mb-6 font-orbitron" data-v-8df44999>Quick Links</h4><ul class="space-y-3" data-v-8df44999><li data-v-8df44999><a href="#home" class="footer-link" data-v-8df44999>Home</a></li><li data-v-8df44999><a href="#about" class="footer-link" data-v-8df44999>About Arena</a></li><li data-v-8df44999><a href="#features" class="footer-link" data-v-8df44999>Features</a></li><li data-v-8df44999><a href="#membership" class="footer-link" data-v-8df44999>Membership</a></li><li data-v-8df44999><a href="#testimonials" class="footer-link" data-v-8df44999>Leaderboard</a></li><li data-v-8df44999><a href="#market" class="footer-link" data-v-8df44999>Market Data</a></li></ul></div><div data-v-8df44999><h4 class="text-lg font-semibold text-white mb-6 font-orbitron" data-v-8df44999>Community</h4><ul class="space-y-3" data-v-8df44999><li data-v-8df44999><a href="#" class="footer-link" data-v-8df44999>Discord Server</a></li><li data-v-8df44999><a href="#" class="footer-link" data-v-8df44999>Telegram Groups</a></li><li data-v-8df44999><a href="#" class="footer-link" data-v-8df44999>Forum</a></li><li data-v-8df44999><a href="#" class="footer-link" data-v-8df44999>Events</a></li><li data-v-8df44999><a href="#" class="footer-link" data-v-8df44999>Blog</a></li><li data-v-8df44999><a href="#" class="footer-link" data-v-8df44999>Support</a></li></ul></div><div data-v-8df44999><h4 class="text-lg font-semibold text-white mb-6 font-orbitron" data-v-8df44999>Stay Updated</h4><p class="text-gray-300 mb-4" data-v-8df44999> Get the latest crypto gaming strategies and arena updates delivered to your inbox. </p><div class="space-y-3" data-v-8df44999><input type="email" placeholder="Enter your email" class="newsletter-input" data-v-8df44999><button class="btn-primary w-full" data-v-8df44999><span class="mr-2" data-v-8df44999>📬</span> Subscribe </button></div><p class="text-xs text-gray-400 mt-3" data-v-8df44999> We respect your privacy. Unsubscribe at any time. </p></div></div><div class="border-t border-orange-500/30 pt-8" data-v-8df44999><div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0" data-v-8df44999><div class="text-gray-400 text-sm" data-v-8df44999> © 2024 CryptoGaming Arena. All rights reserved. | <a href="#" class="hover:text-orange-400 transition-colors duration-200" data-v-8df44999>Privacy Policy</a> | <a href="#" class="hover:text-orange-400 transition-colors duration-200" data-v-8df44999>Terms of Service</a></div><div class="flex items-center space-x-6 text-sm" data-v-8df44999><span class="text-gray-400" data-v-8df44999>Made with ⚔️ for crypto warriors</span><div class="flex items-center space-x-2" data-v-8df44999><span class="w-2 h-2 bg-green-500 rounded-full animate-pulse" data-v-8df44999></span><span class="text-green-400" data-v-8df44999>Arena Online</span></div></div></div></div></div></footer>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/CryptoFooter.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const __nuxt_component_8 = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-8df44999"]]);
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
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "min-h-screen transition-colors duration-300 bg-black text-white overflow-hidden" }, _attrs))}><div class="fixed inset-0 overflow-hidden pointer-events-none"><div class="absolute inset-0 opacity-20"><div class="w-full h-full" style="${ssrRenderStyle({ "background-image": "repeating-linear-gradient(60deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px), repeating-linear-gradient(150deg, transparent, transparent 35px, rgba(255, 107, 53, 0.3) 35px, rgba(255, 107, 53, 0.3) 36px)", "background-size": "60px 60px" })}"></div></div><div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div><div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-60"></div><div class="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60"></div><div class="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-orange-500 to-transparent opacity-60"></div><div class="absolute top-20 left-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl animate-pulse-slow"></div><div class="absolute bottom-20 right-10 w-40 h-40 bg-orange-600/10 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "1s" })}"></div><div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-orange-400/5 rounded-full blur-3xl animate-pulse-slow" style="${ssrRenderStyle({ "animation-delay": "2s" })}"></div><div class="absolute top-1/4 left-0 w-32 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></div><div class="absolute top-1/4 right-0 w-32 h-0.5 bg-gradient-to-l from-orange-500 to-transparent"></div><div class="absolute bottom-1/4 left-0 w-32 h-0.5 bg-gradient-to-r from-orange-500 to-transparent"></div><div class="absolute bottom-1/4 right-0 w-32 h-0.5 bg-gradient-to-l from-orange-500 to-transparent"></div></div><div class="relative z-10">`);
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
