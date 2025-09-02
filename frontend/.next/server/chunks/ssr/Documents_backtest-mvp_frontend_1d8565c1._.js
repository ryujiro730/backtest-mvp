module.exports = [
"[project]/Documents/backtest-mvp/frontend/src/app/[locale]/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LocaleLayout,
    "generateStaticParams",
    ()=>generateStaticParams
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$server$2f$NextIntlClientProviderServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__NextIntlClientProvider$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/react-server/NextIntlClientProviderServer.js [app-rsc] (ecmascript) <export default as NextIntlClientProvider>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getMessages$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js [app-rsc] (ecmascript) <export default as getMessages>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$RequestLocaleCache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__setCachedRequestLocale__as__setRequestLocale$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/RequestLocaleCache.js [app-rsc] (ecmascript) <export setCachedRequestLocale as setRequestLocale>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$src$2f$i18n$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/src/i18n.ts [app-rsc] (ecmascript)");
;
;
;
;
function generateStaticParams() {
    return __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$src$2f$i18n$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["locales"].map((l)=>({
            locale: l
        }));
}
async function LocaleLayout(props) {
    const { children, params } = props;
    // ★ 引数で分割しない。ここで await
    const { locale } = await params;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$RequestLocaleCache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__setCachedRequestLocale__as__setRequestLocale$3e$__["setRequestLocale"])(locale);
    const messages = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getMessages$3e$__["getMessages"])({
        locale
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$server$2f$NextIntlClientProviderServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__NextIntlClientProvider$3e$__["NextIntlClientProvider"], {
        locale: locale,
        messages: messages,
        children: children
    }, void 0, false, {
        fileName: "[project]/Documents/backtest-mvp/frontend/src/app/[locale]/layout.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getConfigNow.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>getConfigNow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getConfig.js [app-rsc] (ecmascript)");
;
;
async function getConfigNowImpl(locale) {
    const config = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(locale);
    return config.now;
}
const getConfigNow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(getConfigNowImpl);
;
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getFormats.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>getFormats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getConfig.js [app-rsc] (ecmascript)");
;
;
async function getFormatsCachedImpl() {
    const config = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])();
    return config.formats;
}
const getFormats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(getFormatsCachedImpl);
;
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js [app-rsc] (client reference proxy) <module evaluation>", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js <module evaluation> from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js <module evaluation>", "default");
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js [app-rsc] (client reference proxy)", ((__turbopack_context__) => {
"use strict";

// This file is generated by next-core EcmascriptClientReferenceModule.
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-server-dom-turbopack-server.js [app-rsc] (ecmascript)");
;
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$server$2d$dom$2d$turbopack$2d$server$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerClientReference"])(function() {
    throw new Error("Attempted to call the default export of [project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js from the server, but it's on the client. It's not possible to invoke a client function from the server, it can only be rendered as a Component or passed to props of a Client Component.");
}, "[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js", "default");
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$shared$2f$NextIntlClientProvider$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js [app-rsc] (client reference proxy) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$shared$2f$NextIntlClientProvider$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js [app-rsc] (client reference proxy)");
;
__turbopack_context__.n(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$shared$2f$NextIntlClientProvider$2e$js__$5b$app$2d$rsc$5d$__$28$client__reference__proxy$29$__);
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getTimeZone.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>getTimeZone
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getConfig.js [app-rsc] (ecmascript)");
;
;
async function getTimeZoneCachedImpl(locale) {
    const config = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(locale);
    return config.timeZone;
}
const getTimeZoneCached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(getTimeZoneCachedImpl);
async function getTimeZone(opts) {
    return getTimeZoneCached(opts?.locale);
}
;
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>getMessages,
    "getMessagesFromConfig",
    ()=>getMessagesFromConfig
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getConfig.js [app-rsc] (ecmascript)");
;
;
function getMessagesFromConfig(config) {
    if (!config.messages) {
        throw new Error('No messages found. Have you configured them correctly? See https://next-intl.dev/docs/configuration#messages');
    }
    return config.messages;
}
async function getMessagesCachedImpl(locale) {
    const config = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(locale);
    return getMessagesFromConfig(config);
}
const getMessagesCached = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["cache"])(getMessagesCachedImpl);
async function getMessages(opts) {
    return getMessagesCached(opts?.locale);
}
;
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/react-server/NextIntlClientProviderServer.js [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NextIntlClientProviderServer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfigNow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getConfigNow.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getFormats$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getFormats.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$shared$2f$NextIntlClientProvider$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/shared/NextIntlClientProvider.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getTimeZone$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getTimeZone.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getLocale$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getLocale.js [app-rsc] (ecmascript)");
;
;
;
;
;
;
;
async function NextIntlClientProviderServer({ formats, locale, messages, now, timeZone, ...rest }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsx"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$shared$2f$NextIntlClientProvider$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"], {
        formats: formats === undefined ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getFormats$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])() : formats,
        locale: locale ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getLocale$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(),
        messages: messages === undefined ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])() : messages,
        now: now ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getConfigNow$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(),
        timeZone: timeZone ?? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getTimeZone$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"])(),
        ...rest
    });
}
;
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/react-server/NextIntlClientProviderServer.js [app-rsc] (ecmascript) <export default as NextIntlClientProvider>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "NextIntlClientProvider",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$server$2f$NextIntlClientProviderServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$react$2d$server$2f$NextIntlClientProviderServer$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/react-server/NextIntlClientProviderServer.js [app-rsc] (ecmascript)");
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js [app-rsc] (ecmascript) <export default as getMessages>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getMessages",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["default"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getMessages$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/getMessages.js [app-rsc] (ecmascript)");
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/RequestLocaleCache.js [app-rsc] (ecmascript) <export setCachedRequestLocale as setRequestLocale>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "setRequestLocale",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$RequestLocaleCache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["setCachedRequestLocale"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$RequestLocaleCache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/server/react-server/RequestLocaleCache.js [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=Documents_backtest-mvp_frontend_1d8565c1._.js.map