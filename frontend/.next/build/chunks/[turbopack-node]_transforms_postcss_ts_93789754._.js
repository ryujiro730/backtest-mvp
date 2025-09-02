module.exports = [
"[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Documents/backtest-mvp/frontend/postcss.config.js_.loader.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "build/chunks/7fa8d_7e90dfbb._.js",
  "build/chunks/[root-of-the-server]__d499ff36._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[turbopack-node]/transforms/postcss.ts { CONFIG => \"[project]/Documents/backtest-mvp/frontend/postcss.config.js_.loader.mjs [postcss] (ecmascript)\" } [postcss] (ecmascript)");
    });
});
}),
];