(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push(["chunks/[root-of-the-server]__22bfda39._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/Documents/backtest-mvp/frontend/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// src/middleware.ts
__turbopack_context__.s([
    "config",
    ()=>config,
    "middleware",
    ()=>middleware
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next-intl/dist/esm/development/middleware/middleware.js [middleware-edge] (ecmascript)");
;
const COOKIE = 'anon_id';
// next-intl
const intl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2d$intl$2f$dist$2f$esm$2f$development$2f$middleware$2f$middleware$2e$js__$5b$middleware$2d$edge$5d$__$28$ecmascript$29$__["default"])({
    locales: [
        'ja',
        'en'
    ],
    defaultLocale: 'ja'
});
function middleware(req) {
    // 1) next-intl を先に適用
    const res = intl(req);
    // 2) 匿名IDクッキーを付与（なければ）
    const has = req.cookies.get(COOKIE)?.value;
    if (!has) {
        res.cookies.set({
            name: COOKIE,
            value: crypto.randomUUID(),
            httpOnly: true,
            sameSite: 'lax',
            secure: ("TURBOPACK compile-time value", "development") === 'production',
            path: '/',
            maxAge: 60 * 60 * 24 * 365
        });
    }
    return res;
}
const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)'
    ]
};
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__22bfda39._.js.map