module.exports = [
"[project]/Documents/backtest-mvp/frontend/src/i18n.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/i18n.ts
__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "defaultLocale",
    ()=>defaultLocale,
    "locales",
    ()=>locales
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$3$2e$5_next$40$15$2e$5$2e$2_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/.pnpm/next-intl@4.3.5_next@15.5.2_react-dom@19.1.0_react@19.1.0__react@19.1.0__react@19.1.0_typescript@5.9.2/node_modules/next-intl/dist/esm/development/server/react-server/getRequestConfig.js [app-rsc] (ecmascript) <export default as getRequestConfig>");
;
const locales = [
    'en',
    'ja'
];
const defaultLocale = 'ja';
const loaders = {
    lp: {
        en: ()=>__turbopack_context__.A("[project]/Documents/backtest-mvp/frontend/src/messages/en/lp.json (json, async loader)").then((m)=>m.default),
        ja: ()=>__turbopack_context__.A("[project]/Documents/backtest-mvp/frontend/src/messages/ja/lp.json (json, async loader)").then((m)=>m.default)
    }
};
const __TURBOPACK__default__export__ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$3$2e$5_next$40$15$2e$5$2e$2_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getRequestConfig$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getRequestConfig$3e$__["getRequestConfig"])(async ({ locale })=>{
    const l = locales.includes(locale ?? '') ? locale : defaultLocale;
    // ★ ここで実際にどっちを読んだかと代表キーの値を出す
    const lp = await loaders.lp[l]();
    console.log('[i18n] resolved locale =', l);
    console.log('[i18n] lp.hero.title =', lp?.hero?.title);
    const messages = {
        lp
    };
    return {
        locale: l,
        messages
    };
});
}),
"[project]/Documents/backtest-mvp/frontend/src/app/layout.tsx [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/app/layout.tsx
__turbopack_context__.s([
    "default",
    ()=>RootLayout,
    "metadata",
    ()=>metadata
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$2_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/.pnpm/next@15.5.2_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/dist/server/route-modules/app-page/vendored/rsc/react-jsx-dev-runtime.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$3$2e$5_next$40$15$2e$5$2e$2_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getLocale$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getLocale$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/.pnpm/next-intl@4.3.5_next@15.5.2_react-dom@19.1.0_react@19.1.0__react@19.1.0__react@19.1.0_typescript@5.9.2/node_modules/next-intl/dist/esm/development/server/react-server/getLocale.js [app-rsc] (ecmascript) <export default as getLocale>");
;
;
;
const metadata = {
    title: 'Delver',
    description: 'Ultra-low latency backtests with parallel execution.'
};
async function RootLayout({ children }) {
    // ★ ミドルウェアで決まった現在ロケールを取得
    const locale = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f2e$pnpm$2f$next$2d$intl$40$4$2e$3$2e$5_next$40$15$2e$5$2e$2_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0_typescript$40$5$2e$9$2e$2$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$server$2f$react$2d$server$2f$getLocale$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__$3c$export__default__as__getLocale$3e$__["getLocale"])(); // 'ja' | 'en'
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$2_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: locale,
        className: "h-full",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$2_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$rsc$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            className: "min-h-screen bg-[#0b0b10] text-white antialiased",
            children: children
        }, void 0, false, {
            fileName: "[project]/Documents/backtest-mvp/frontend/src/app/layout.tsx",
            lineNumber: 17,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/Documents/backtest-mvp/frontend/src/app/layout.tsx",
        lineNumber: 16,
        columnNumber: 5
    }, this);
}
}),
];

//# sourceMappingURL=Documents_backtest-mvp_frontend_src_667dcf3e._.js.map