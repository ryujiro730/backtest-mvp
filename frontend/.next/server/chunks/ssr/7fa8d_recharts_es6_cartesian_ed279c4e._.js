module.exports = [
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GraphicalItemClipPath",
    ()=>GraphicalItemClipPath,
    "useNeedsClip",
    ()=>useNeedsClip
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/axisSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/hooks.js [app-ssr] (ecmascript)");
;
;
;
;
function useNeedsClip(xAxisId, yAxisId) {
    var _xAxis$allowDataOverf, _yAxis$allowDataOverf;
    var xAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectXAxisSettings"])(state, xAxisId));
    var yAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectYAxisSettings"])(state, yAxisId));
    var needClipX = (_xAxis$allowDataOverf = xAxis === null || xAxis === void 0 ? void 0 : xAxis.allowDataOverflow) !== null && _xAxis$allowDataOverf !== void 0 ? _xAxis$allowDataOverf : __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].allowDataOverflow;
    var needClipY = (_yAxis$allowDataOverf = yAxis === null || yAxis === void 0 ? void 0 : yAxis.allowDataOverflow) !== null && _yAxis$allowDataOverf !== void 0 ? _yAxis$allowDataOverf : __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].allowDataOverflow;
    var needClip = needClipX || needClipY;
    return {
        needClip,
        needClipX,
        needClipY
    };
}
function GraphicalItemClipPath(_ref) {
    var { xAxisId, yAxisId, clipPathId } = _ref;
    var plotArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlotArea"])();
    var { needClipX, needClipY, needClip } = useNeedsClip(xAxisId, yAxisId);
    if (!needClip) {
        return null;
    }
    var { x, y, width, height } = plotArea;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("clipPath", {
        id: "clipPath-".concat(clipPathId)
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
        x: needClipX ? x : x - width / 2,
        y: needClipY ? y : y - height / 2,
        width: needClipX ? width : width * 2,
        height: needClipY ? height : height * 2
    }));
}
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/Line.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Line",
    ()=>Line,
    "computeLinePoints",
    ()=>computeLinePoints
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Curve$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/shape/Curve.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/shape/Dot.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/container/Layer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$LabelList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/LabelList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DataUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ReactUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$Global$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/Global.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ChartUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ActivePoints$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/ActivePoints.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetTooltipEntrySettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/SetTooltipEntrySettings.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$ErrorBarContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/ErrorBarContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$GraphicalItemClipPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/chartLayoutContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/PanoramaContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$lineSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/lineSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetLegendPayload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/SetLegendPayload.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$useAnimationId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/useAnimationId.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/resolveDefaultProps.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$RegisterGraphicalItemId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/RegisterGraphicalItemId.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetGraphicalItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/SetGraphicalItem.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/svgPropertiesNoEvents.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$animation$2f$JavascriptAnimate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/animation/JavascriptAnimate.js [app-ssr] (ecmascript)");
var _excluded = [
    "id"
], _excluded2 = [
    "type",
    "layout",
    "connectNulls",
    "needClip"
], _excluded3 = [
    "activeDot",
    "animateNewValues",
    "animationBegin",
    "animationDuration",
    "animationEasing",
    "connectNulls",
    "dot",
    "hide",
    "isAnimationActive",
    "label",
    "legendType",
    "xAxisId",
    "yAxisId",
    "id"
];
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for(r = 0; r < n.length; r++)o = n[r], -1 === t.indexOf(o) && ({}).propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
}
function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for(var n in r)if (({}).hasOwnProperty.call(r, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r[n];
    }
    return t;
}
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */ /**
 * External props, intended for end users to fill in
 */ /**
 * Because of naming conflict, we are forced to ignore certain (valid) SVG attributes.
 */ var computeLegendPayloadFromAreaData = (props)=>{
    var { dataKey, name, stroke, legendType, hide } = props;
    return [
        {
            inactive: hide,
            dataKey,
            type: legendType,
            color: stroke,
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTooltipNameProp"])(name, dataKey),
            payload: props
        }
    ];
};
function getTooltipEntrySettings(props) {
    var { dataKey, data, stroke, strokeWidth, fill, name, hide, unit } = props;
    return {
        dataDefinedOnItem: data,
        positions: undefined,
        settings: {
            stroke,
            strokeWidth,
            fill,
            dataKey,
            nameKey: undefined,
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTooltipNameProp"])(name, dataKey),
            hide,
            type: props.tooltipType,
            color: props.stroke,
            unit
        }
    };
}
var generateSimpleStrokeDasharray = (totalLength, length)=>{
    return "".concat(length, "px ").concat(totalLength - length, "px");
};
function repeat(lines, count) {
    var linesUnit = lines.length % 2 !== 0 ? [
        ...lines,
        0
    ] : lines;
    var result = [];
    for(var i = 0; i < count; ++i){
        result = [
            ...result,
            ...linesUnit
        ];
    }
    return result;
}
var getStrokeDasharray = (length, totalLength, lines)=>{
    var lineLength = lines.reduce((pre, next)=>pre + next);
    // if lineLength is 0 return the default when no strokeDasharray is provided
    if (!lineLength) {
        return generateSimpleStrokeDasharray(totalLength, length);
    }
    var count = Math.floor(length / lineLength);
    var remainLength = length % lineLength;
    var restLength = totalLength - length;
    var remainLines = [];
    for(var i = 0, sum = 0; i < lines.length; sum += lines[i], ++i){
        if (sum + lines[i] > remainLength) {
            remainLines = [
                ...lines.slice(0, i),
                remainLength - sum
            ];
            break;
        }
    }
    var emptyLines = remainLines.length % 2 === 0 ? [
        0,
        restLength
    ] : [
        restLength
    ];
    return [
        ...repeat(lines, count),
        ...remainLines,
        ...emptyLines
    ].map((line)=>"".concat(line, "px")).join(', ');
};
function renderDotItem(option, props) {
    var dotItem;
    if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](option)) {
        dotItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](option, props);
    } else if (typeof option === 'function') {
        dotItem = option(props);
    } else {
        var className = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-line-dot', typeof option !== 'boolean' ? option.className : '');
        dotItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dot"], _extends({}, props, {
            className: className
        }));
    }
    return dotItem;
}
function shouldRenderDots(points, dot) {
    if (points == null) {
        return false;
    }
    if (dot) {
        return true;
    }
    return points.length === 1;
}
function Dots(_ref) {
    var { clipPathId, points, props } = _ref;
    var { dot, dataKey, needClip } = props;
    if (!shouldRenderDots(points, dot)) {
        return null;
    }
    /*
   * Exclude ID from the props passed to the Dots component
   * because then the ID would be applied to multiple dots and it would no longer be unique.
   */ var { id } = props, propsWithoutId = _objectWithoutProperties(props, _excluded);
    var clipDot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isClipDot"])(dot);
    var lineProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["svgPropertiesNoEvents"])(propsWithoutId);
    var customDotProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(dot, true);
    var dots = points.map((entry, i)=>{
        var dotProps = _objectSpread(_objectSpread(_objectSpread({
            key: "dot-".concat(i),
            r: 3
        }, lineProps), customDotProps), {}, {
            index: i,
            cx: entry.x,
            cy: entry.y,
            dataKey,
            value: entry.value,
            payload: entry.payload,
            points
        });
        return renderDotItem(dot, dotProps);
    });
    var dotsProps = {
        clipPath: needClip ? "url(#clipPath-".concat(clipDot ? '' : 'dots-').concat(clipPathId, ")") : undefined
    };
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], _extends({
        className: "recharts-line-dots",
        key: "dots"
    }, dotsProps), dots);
}
function StaticCurve(_ref2) {
    var { clipPathId, pathRef, points, strokeDasharray, props, showLabels } = _ref2;
    var { type, layout, connectNulls, needClip } = props, others = _objectWithoutProperties(props, _excluded2);
    var curveProps = _objectSpread(_objectSpread({}, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(others, true)), {}, {
        fill: 'none',
        className: 'recharts-line-curve',
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : undefined,
        points,
        type,
        layout,
        connectNulls,
        strokeDasharray: strokeDasharray !== null && strokeDasharray !== void 0 ? strokeDasharray : props.strokeDasharray
    });
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, (points === null || points === void 0 ? void 0 : points.length) > 1 && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Curve$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Curve"], _extends({}, curveProps, {
        pathRef: pathRef
    })), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Dots, {
        points: points,
        clipPathId: clipPathId,
        props: props
    }), showLabels && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$LabelList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LabelList"].renderCallByParent(props, points));
}
function getTotalLength(mainCurve) {
    try {
        return mainCurve && mainCurve.getTotalLength && mainCurve.getTotalLength() || 0;
    } catch (_unused) {
        return 0;
    }
}
function CurveWithAnimation(_ref3) {
    var { clipPathId, props, pathRef, previousPointsRef, longestAnimatedLengthRef } = _ref3;
    var { points, strokeDasharray, isAnimationActive, animationBegin, animationDuration, animationEasing, animateNewValues, width, height, onAnimationEnd, onAnimationStart } = props;
    var prevPoints = previousPointsRef.current;
    var animationId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$useAnimationId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAnimationId"])(props, 'recharts-line-');
    var [isAnimating, setIsAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    var handleAnimationEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (typeof onAnimationEnd === 'function') {
            onAnimationEnd();
        }
        setIsAnimating(false);
    }, [
        onAnimationEnd
    ]);
    var handleAnimationStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (typeof onAnimationStart === 'function') {
            onAnimationStart();
        }
        setIsAnimating(true);
    }, [
        onAnimationStart
    ]);
    var totalLength = getTotalLength(pathRef.current);
    /*
   * Here we want to detect if the length animation has been interrupted.
   * For that we keep a reference to the furthest length that has been animated.
   *
   * And then, to keep things smooth, we add to it the current length that is being animated right now.
   *
   * If we did Math.max then it makes the length animation "pause" but we want to keep it smooth
   * so in case we have some "leftover" length from the previous animation we add it to the current length.
   *
   * This is not perfect because the animation changes speed due to easing. The default easing is 'ease' which is not linear
   * and makes it stand out. But it's good enough I suppose.
   * If we want to fix it then we need to keep track of multiple animations and their easing and timings.
   *
   * If you want to see this in action, try to change the dataKey of the line chart while the initial animation is running.
   * The Line begins with zero length and slowly grows to the full length. While this growth is in progress,
   * change the dataKey and the Line will continue growing from where it has grown so far.
   */ var startingPoint = longestAnimatedLengthRef.current;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$animation$2f$JavascriptAnimate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JavascriptAnimate"], {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        onAnimationEnd: handleAnimationEnd,
        onAnimationStart: handleAnimationStart,
        key: animationId
    }, (t)=>{
        var lengthInterpolated = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(startingPoint, totalLength + startingPoint, t);
        var curLength = Math.min(lengthInterpolated, totalLength);
        var currentStrokeDasharray;
        if (strokeDasharray) {
            var lines = "".concat(strokeDasharray).split(/[,\s]+/gim).map((num)=>parseFloat(num));
            currentStrokeDasharray = getStrokeDasharray(curLength, totalLength, lines);
        } else {
            currentStrokeDasharray = generateSimpleStrokeDasharray(totalLength, curLength);
        }
        if (prevPoints) {
            var prevPointsDiffFactor = prevPoints.length / points.length;
            var stepData = t === 1 ? points : points.map((entry, index)=>{
                var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
                if (prevPoints[prevPointIndex]) {
                    var prev = prevPoints[prevPointIndex];
                    return _objectSpread(_objectSpread({}, entry), {}, {
                        x: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prev.x, entry.x, t),
                        y: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prev.y, entry.y, t)
                    });
                }
                // magic number of faking previous x and y location
                if (animateNewValues) {
                    return _objectSpread(_objectSpread({}, entry), {}, {
                        x: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(width * 2, entry.x, t),
                        y: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(height / 2, entry.y, t)
                    });
                }
                return _objectSpread(_objectSpread({}, entry), {}, {
                    x: entry.x,
                    y: entry.y
                });
            });
            // eslint-disable-next-line no-param-reassign
            previousPointsRef.current = stepData;
            return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](StaticCurve, {
                props: props,
                points: stepData,
                clipPathId: clipPathId,
                pathRef: pathRef,
                showLabels: !isAnimating,
                strokeDasharray: currentStrokeDasharray
            });
        }
        /*
     * Here it is important to wait a little bit with updating the previousPointsRef
     * before the animation has a time to initialize.
     * If we set the previous pointsRef immediately, we set it before the Legend height it calculated
     * and before pathRef is set.
     * If that happens, the Line will re-render again after Legend had reported its height
     * which will start a new animation with the previous points as the starting point
     * which gives the effect of the Line animating slightly upwards (where the animation distance equals the Legend height).
     * Waiting for t > 0 is indirect but good enough to ensure that the Legend height is calculated and animation works properly.
     *
     * Total length similarly is calculated from the pathRef. We should not update the previousPointsRef
     * before the pathRef is set, otherwise we will have a wrong total length.
     */ if (t > 0 && totalLength > 0) {
            // eslint-disable-next-line no-param-reassign
            previousPointsRef.current = points;
            /*
       * totalLength is set from a ref and is not updated in the first tick of the animation.
       * It defaults to zero which is exactly what we want here because we want to grow from zero,
       * however the same happens when the data change.
       *
       * In that case we want to remember the previous length and continue from there, and only animate the shape.
       *
       * Therefore the totalLength > 0 check.
       *
       * The Animate is about to fire handleAnimationStart which will update the state
       * and cause a re-render and read a new proper totalLength which will be used in the next tick
       * and update the longestAnimatedLengthRef.
       */ // eslint-disable-next-line no-param-reassign
            longestAnimatedLengthRef.current = curLength;
        }
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](StaticCurve, {
            props: props,
            points: points,
            clipPathId: clipPathId,
            pathRef: pathRef,
            showLabels: !isAnimating,
            strokeDasharray: currentStrokeDasharray
        });
    });
}
function RenderCurve(_ref4) {
    var { clipPathId, props } = _ref4;
    var { points, isAnimationActive } = props;
    var previousPointsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var longestAnimatedLengthRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(0);
    var pathRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var prevPoints = previousPointsRef.current;
    if (isAnimationActive && points && points.length && prevPoints !== points) {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](CurveWithAnimation, {
            props: props,
            clipPathId: clipPathId,
            previousPointsRef: previousPointsRef,
            longestAnimatedLengthRef: longestAnimatedLengthRef,
            pathRef: pathRef
        });
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](StaticCurve, {
        props: props,
        points: points,
        clipPathId: clipPathId,
        pathRef: pathRef,
        showLabels: true
    });
}
var errorBarDataPointFormatter = (dataPoint, dataKey)=>{
    return {
        x: dataPoint.x,
        y: dataPoint.y,
        value: dataPoint.value,
        // @ts-expect-error getValueByDataKey does not validate the output type
        errorVal: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValueByDataKey"])(dataPoint.payload, dataKey)
    };
};
// eslint-disable-next-line react/prefer-stateless-function
class LineWithState extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Component"] {
    render() {
        var _filterProps;
        var { hide, dot, points, className, xAxisId, yAxisId, top, left, width, height, id, needClip } = this.props;
        if (hide) {
            return null;
        }
        var layerClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-line', className);
        var clipPathId = id;
        var { r = 3, strokeWidth = 2 } = (_filterProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(dot, false)) !== null && _filterProps !== void 0 ? _filterProps : {
            r: 3,
            strokeWidth: 2
        };
        var clipDot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isClipDot"])(dot);
        var dotSize = r * 2 + strokeWidth;
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
            className: layerClass
        }, needClip && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("defs", null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$GraphicalItemClipPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GraphicalItemClipPath"], {
            clipPathId: clipPathId,
            xAxisId: xAxisId,
            yAxisId: yAxisId
        }), !clipDot && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("clipPath", {
            id: "clipPath-dots-".concat(clipPathId)
        }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
            x: left - dotSize / 2,
            y: top - dotSize / 2,
            width: width + dotSize,
            height: height + dotSize
        }))), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](RenderCurve, {
            props: this.props,
            clipPathId: clipPathId
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$ErrorBarContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SetErrorBarContext"], {
            xAxisId: xAxisId,
            yAxisId: yAxisId,
            data: points,
            dataPointFormatter: errorBarDataPointFormatter,
            errorBarOffset: 0
        }, this.props.children)), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ActivePoints$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ActivePoints"], {
            activeDot: this.props.activeDot,
            points: points,
            mainColor: this.props.stroke,
            itemDataKey: this.props.dataKey
        }));
    }
}
var defaultLineProps = {
    activeDot: true,
    animateNewValues: true,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
    connectNulls: false,
    dot: true,
    fill: '#fff',
    hide: false,
    isAnimationActive: !__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$Global$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Global"].isSsr,
    label: false,
    legendType: 'line',
    stroke: '#3182bd',
    strokeWidth: 1,
    xAxisId: 0,
    yAxisId: 0
};
function LineImpl(props) {
    var _resolveDefaultProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDefaultProps"])(props, defaultLineProps), { activeDot, animateNewValues, animationBegin, animationDuration, animationEasing, connectNulls, dot, hide, isAnimationActive, label, legendType, xAxisId, yAxisId, id } = _resolveDefaultProps, everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded3);
    var { needClip } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$GraphicalItemClipPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNeedsClip"])(xAxisId, yAxisId);
    var plotArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlotArea"])();
    var layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartLayout"])();
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    var points = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$lineSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectLinePoints"])(state, xAxisId, yAxisId, isPanorama, id));
    if (layout !== 'horizontal' && layout !== 'vertical' || points == null || plotArea == null) {
        // Cannot render Line in an unsupported layout
        return null;
    }
    var { height, width, x: left, y: top } = plotArea;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](LineWithState, _extends({}, everythingElse, {
        id: id,
        connectNulls: connectNulls,
        dot: dot,
        activeDot: activeDot,
        animateNewValues: animateNewValues,
        animationBegin: animationBegin,
        animationDuration: animationDuration,
        animationEasing: animationEasing,
        isAnimationActive: isAnimationActive,
        hide: hide,
        label: label,
        legendType: legendType,
        xAxisId: xAxisId,
        yAxisId: yAxisId,
        points: points,
        layout: layout,
        height: height,
        width: width,
        left: left,
        top: top,
        needClip: needClip
    }));
}
function computeLinePoints(_ref5) {
    var { layout, xAxis, yAxis, xAxisTicks, yAxisTicks, dataKey, bandSize, displayedData } = _ref5;
    return displayedData.map((entry, index)=>{
        // @ts-expect-error getValueByDataKey does not validate the output type
        var value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValueByDataKey"])(entry, dataKey);
        if (layout === 'horizontal') {
            var _x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCateCoordinateOfLine"])({
                axis: xAxis,
                ticks: xAxisTicks,
                bandSize,
                entry,
                index
            });
            var _y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNullish"])(value) ? null : yAxis.scale(value);
            return {
                x: _x,
                y: _y,
                value,
                payload: entry
            };
        }
        var x = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNullish"])(value) ? null : xAxis.scale(value);
        var y = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCateCoordinateOfLine"])({
            axis: yAxis,
            ticks: yAxisTicks,
            bandSize,
            entry,
            index
        });
        if (x == null || y == null) {
            return null;
        }
        return {
            x,
            y,
            value,
            payload: entry
        };
    }).filter(Boolean);
}
function Line(outsideProps) {
    var props = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDefaultProps"])(outsideProps, defaultLineProps);
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$RegisterGraphicalItemId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RegisterGraphicalItemId"], {
        id: props.id,
        type: "line"
    }, (id)=>/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetLegendPayload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SetLegendPayload"], {
            legendPayload: computeLegendPayloadFromAreaData(props)
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetTooltipEntrySettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SetTooltipEntrySettings"], {
            fn: getTooltipEntrySettings,
            args: props
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetGraphicalItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SetCartesianGraphicalItem"], {
            type: "line",
            id: id,
            data: props.data,
            xAxisId: props.xAxisId,
            yAxisId: props.yAxisId,
            zAxisId: 0,
            dataKey: props.dataKey,
            hide: props.hide,
            isPanorama: isPanorama
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](LineImpl, _extends({}, props, {
            id: id
        }))));
}
Line.displayName = 'Line';
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/Area.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Area",
    ()=>Area,
    "computeArea",
    ()=>computeArea,
    "getBaseValue",
    ()=>getBaseValue
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Curve$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/shape/Curve.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/shape/Dot.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/container/Layer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$LabelList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/LabelList.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$Global$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/Global.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DataUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ChartUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ReactUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ActivePoints$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/ActivePoints.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetTooltipEntrySettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/SetTooltipEntrySettings.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$GraphicalItemClipPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/GraphicalItemClipPath.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$areaSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/areaSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/PanoramaContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/chartLayoutContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$selectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/selectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetLegendPayload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/SetLegendPayload.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$useAnimationId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/useAnimationId.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/resolveDefaultProps.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$isWellBehavedNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/isWellBehavedNumber.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$RegisterGraphicalItemId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/RegisterGraphicalItemId.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetGraphicalItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/SetGraphicalItem.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/svgPropertiesNoEvents.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$animation$2f$JavascriptAnimate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/animation/JavascriptAnimate.js [app-ssr] (ecmascript)");
var _excluded = [
    "id"
], _excluded2 = [
    "activeDot",
    "animationBegin",
    "animationDuration",
    "animationEasing",
    "connectNulls",
    "dot",
    "fill",
    "fillOpacity",
    "hide",
    "isAnimationActive",
    "legendType",
    "stroke",
    "xAxisId",
    "yAxisId"
];
function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for(r = 0; r < n.length; r++)o = n[r], -1 === t.indexOf(o) && ({}).propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
}
function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for(var n in r)if (({}).hasOwnProperty.call(r, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r[n];
    }
    return t;
}
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
/**
 * Internal props, combination of external props + defaultProps + private Recharts state
 */ /**
 * External props, intended for end users to fill in
 */ /**
 * Because of naming conflict, we are forced to ignore certain (valid) SVG attributes.
 */ function getLegendItemColor(stroke, fill) {
    return stroke && stroke !== 'none' ? stroke : fill;
}
var computeLegendPayloadFromAreaData = (props)=>{
    var { dataKey, name, stroke, fill, legendType, hide } = props;
    return [
        {
            inactive: hide,
            dataKey,
            type: legendType,
            color: getLegendItemColor(stroke, fill),
            value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTooltipNameProp"])(name, dataKey),
            payload: props
        }
    ];
};
function getTooltipEntrySettings(props) {
    var { dataKey, data, stroke, strokeWidth, fill, name, hide, unit } = props;
    return {
        dataDefinedOnItem: data,
        positions: undefined,
        settings: {
            stroke,
            strokeWidth,
            fill,
            dataKey,
            nameKey: undefined,
            name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTooltipNameProp"])(name, dataKey),
            hide,
            type: props.tooltipType,
            color: getLegendItemColor(stroke, fill),
            unit
        }
    };
}
var renderDotItem = (option, props)=>{
    var dotItem;
    if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](option)) {
        dotItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](option, props);
    } else if (typeof option === 'function') {
        dotItem = option(props);
    } else {
        var className = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-area-dot', typeof option !== 'boolean' ? option.className : '');
        dotItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Dot$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Dot"], _extends({}, props, {
            className: className
        }));
    }
    return dotItem;
};
function shouldRenderDots(points, dot) {
    if (points == null) {
        return false;
    }
    if (dot) {
        return true;
    }
    return points.length === 1;
}
function Dots(_ref) {
    var { clipPathId, points, props } = _ref;
    var { needClip, dot, dataKey } = props;
    if (!shouldRenderDots(points, dot)) {
        return null;
    }
    var clipDot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isClipDot"])(dot);
    var areaProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["svgPropertiesNoEvents"])(props);
    var customDotProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(dot, true);
    var dots = points.map((entry, i)=>{
        var dotProps = _objectSpread(_objectSpread(_objectSpread({
            key: "dot-".concat(i),
            r: 3
        }, areaProps), customDotProps), {}, {
            index: i,
            cx: entry.x,
            cy: entry.y,
            dataKey,
            value: entry.value,
            payload: entry.payload,
            points
        });
        return renderDotItem(dot, dotProps);
    });
    var dotsProps = {
        clipPath: needClip ? "url(#clipPath-".concat(clipDot ? '' : 'dots-').concat(clipPathId, ")") : undefined
    };
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], _extends({
        className: "recharts-area-dots"
    }, dotsProps), dots);
}
function StaticArea(_ref2) {
    var { points, baseLine, needClip, clipPathId, props, showLabels } = _ref2;
    var { layout, type, stroke, connectNulls, isRange } = props;
    var { id } = props, propsWithoutId = _objectWithoutProperties(props, _excluded);
    var allOtherProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["svgPropertiesNoEvents"])(propsWithoutId);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, (points === null || points === void 0 ? void 0 : points.length) > 1 && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
        clipPath: needClip ? "url(#clipPath-".concat(clipPathId, ")") : undefined
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Curve$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Curve"], _extends({}, allOtherProps, {
        id: id,
        points: points,
        connectNulls: connectNulls,
        type: type,
        baseLine: baseLine,
        layout: layout,
        stroke: "none",
        className: "recharts-area-area"
    })), stroke !== 'none' && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Curve$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Curve"], _extends({}, allOtherProps, {
        className: "recharts-area-curve",
        layout: layout,
        type: type,
        connectNulls: connectNulls,
        fill: "none",
        points: points
    })), stroke !== 'none' && isRange && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$shape$2f$Curve$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Curve"], _extends({}, allOtherProps, {
        className: "recharts-area-curve",
        layout: layout,
        type: type,
        connectNulls: connectNulls,
        fill: "none",
        points: baseLine
    }))), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Dots, {
        points: points,
        props: propsWithoutId,
        clipPathId: clipPathId
    }), showLabels && __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$LabelList$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["LabelList"].renderCallByParent(propsWithoutId, points));
}
function VerticalRect(_ref3) {
    var { alpha, baseLine, points, strokeWidth } = _ref3;
    var startY = points[0].y;
    var endY = points[points.length - 1].y;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$isWellBehavedNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isWellBehavedNumber"])(startY) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$isWellBehavedNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isWellBehavedNumber"])(endY)) {
        return null;
    }
    var height = alpha * Math.abs(startY - endY);
    var maxX = Math.max(...points.map((entry)=>entry.x || 0));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(baseLine)) {
        maxX = Math.max(baseLine, maxX);
    } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
        maxX = Math.max(...baseLine.map((entry)=>entry.x || 0), maxX);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(maxX)) {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
            x: 0,
            y: startY < endY ? startY : startY - height,
            width: maxX + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1),
            height: Math.floor(height)
        });
    }
    return null;
}
function HorizontalRect(_ref4) {
    var { alpha, baseLine, points, strokeWidth } = _ref4;
    var startX = points[0].x;
    var endX = points[points.length - 1].x;
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$isWellBehavedNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isWellBehavedNumber"])(startX) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$isWellBehavedNumber$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isWellBehavedNumber"])(endX)) {
        return null;
    }
    var width = alpha * Math.abs(startX - endX);
    var maxY = Math.max(...points.map((entry)=>entry.y || 0));
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(baseLine)) {
        maxY = Math.max(baseLine, maxY);
    } else if (baseLine && Array.isArray(baseLine) && baseLine.length) {
        maxY = Math.max(...baseLine.map((entry)=>entry.y || 0), maxY);
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(maxY)) {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
            x: startX < endX ? startX : startX - width,
            y: 0,
            width: width,
            height: Math.floor(maxY + (strokeWidth ? parseInt("".concat(strokeWidth), 10) : 1))
        });
    }
    return null;
}
function ClipRect(_ref5) {
    var { alpha, layout, points, baseLine, strokeWidth } = _ref5;
    if (layout === 'vertical') {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](VerticalRect, {
            alpha: alpha,
            points: points,
            baseLine: baseLine,
            strokeWidth: strokeWidth
        });
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](HorizontalRect, {
        alpha: alpha,
        points: points,
        baseLine: baseLine,
        strokeWidth: strokeWidth
    });
}
function AreaWithAnimation(_ref6) {
    var { needClip, clipPathId, props, previousPointsRef, previousBaselineRef } = _ref6;
    var { points, baseLine, isAnimationActive, animationBegin, animationDuration, animationEasing, onAnimationStart, onAnimationEnd } = props;
    var animationId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$useAnimationId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAnimationId"])(props, 'recharts-area-');
    var [isAnimating, setIsAnimating] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    var handleAnimationEnd = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (typeof onAnimationEnd === 'function') {
            onAnimationEnd();
        }
        setIsAnimating(false);
    }, [
        onAnimationEnd
    ]);
    var handleAnimationStart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (typeof onAnimationStart === 'function') {
            onAnimationStart();
        }
        setIsAnimating(true);
    }, [
        onAnimationStart
    ]);
    var prevPoints = previousPointsRef.current;
    var prevBaseLine = previousBaselineRef.current;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$animation$2f$JavascriptAnimate$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["JavascriptAnimate"], {
        begin: animationBegin,
        duration: animationDuration,
        isActive: isAnimationActive,
        easing: animationEasing,
        onAnimationEnd: handleAnimationEnd,
        onAnimationStart: handleAnimationStart,
        key: animationId
    }, (t)=>{
        if (prevPoints) {
            var prevPointsDiffFactor = prevPoints.length / points.length;
            var stepPoints = /*
       * Here it is important that at the very end of the animation, on the last frame,
       * we render the original points without any interpolation.
       * This is needed because the code above is checking for reference equality to decide if the animation should run
       * and if we create a new array instance (even if the numbers were the same)
       * then we would break animations.
       */ t === 1 ? points : points.map((entry, index)=>{
                var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
                if (prevPoints[prevPointIndex]) {
                    var prev = prevPoints[prevPointIndex];
                    return _objectSpread(_objectSpread({}, entry), {}, {
                        x: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prev.x, entry.x, t),
                        y: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prev.y, entry.y, t)
                    });
                }
                return entry;
            });
            var stepBaseLine;
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(baseLine)) {
                stepBaseLine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prevBaseLine, baseLine, t);
            } else if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNullish"])(baseLine) || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNan"])(baseLine)) {
                stepBaseLine = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prevBaseLine, 0, t);
            } else {
                stepBaseLine = baseLine.map((entry, index)=>{
                    var prevPointIndex = Math.floor(index * prevPointsDiffFactor);
                    if (Array.isArray(prevBaseLine) && prevBaseLine[prevPointIndex]) {
                        var prev = prevBaseLine[prevPointIndex];
                        return _objectSpread(_objectSpread({}, entry), {}, {
                            x: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prev.x, entry.x, t),
                            y: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["interpolate"])(prev.y, entry.y, t)
                        });
                    }
                    return entry;
                });
            }
            if (t > 0) {
                /*
         * We need to keep the refs in the parent component because we need to remember the last shape of the animation
         * even if AreaWithAnimation is unmounted as that happens when changing props.
         *
         * And we need to update the refs here because here is where the interpolation is computed.
         * Eslint doesn't like changing function arguments, but we need it so here is an eslint-disable.
         */ // eslint-disable-next-line no-param-reassign
                previousPointsRef.current = stepPoints;
                // eslint-disable-next-line no-param-reassign
                previousBaselineRef.current = stepBaseLine;
            }
            return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](StaticArea, {
                points: stepPoints,
                baseLine: stepBaseLine,
                needClip: needClip,
                clipPathId: clipPathId,
                props: props,
                showLabels: !isAnimating
            });
        }
        if (t > 0) {
            // eslint-disable-next-line no-param-reassign
            previousPointsRef.current = points;
            // eslint-disable-next-line no-param-reassign
            previousBaselineRef.current = baseLine;
        }
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("defs", null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("clipPath", {
            id: "animationClipPath-".concat(clipPathId)
        }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](ClipRect, {
            alpha: t,
            points: points,
            baseLine: baseLine,
            layout: props.layout,
            strokeWidth: props.strokeWidth
        }))), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
            clipPath: "url(#animationClipPath-".concat(clipPathId, ")")
        }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](StaticArea, {
            points: points,
            baseLine: baseLine,
            needClip: needClip,
            clipPathId: clipPathId,
            props: props,
            showLabels: true
        })));
    });
}
/*
 * This components decides if the area should be animated or not.
 * It also holds the state of the animation.
 */ function RenderArea(_ref7) {
    var { needClip, clipPathId, props } = _ref7;
    var { points, baseLine, isAnimationActive } = props;
    /*
   * These two must be refs, not state!
   * Because we want to store the most recent shape of the animation in case we have to interrupt the animation;
   * that happens when user initiates another animation before the current one finishes.
   *
   * If this was a useState, then every step in the animation would trigger a re-render.
   * So, useRef it is.
   */ var previousPointsRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var previousBaselineRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])();
    var prevPoints = previousPointsRef.current;
    var prevBaseLine = previousBaselineRef.current;
    if (isAnimationActive && /*
   * Here it's important that we unmount of AreaWithAnimation in case points are undefined
   * - this will make sure to interrupt the animation if it's running.
   * We still get to keep the last shape of the animation in the refs above.
   */ points && points.length && (prevPoints !== points || prevBaseLine !== baseLine)) {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](AreaWithAnimation, {
            needClip: needClip,
            clipPathId: clipPathId,
            props: props,
            previousPointsRef: previousPointsRef,
            previousBaselineRef: previousBaselineRef
        });
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](StaticArea, {
        points: points,
        baseLine: baseLine,
        needClip: needClip,
        clipPathId: clipPathId,
        props: props,
        showLabels: true
    });
}
class AreaWithState extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PureComponent"] {
    render() {
        var _filterProps;
        var { hide, dot, points, className, top, left, needClip, xAxisId, yAxisId, width, height, id, baseLine } = this.props;
        if (hide) {
            return null;
        }
        var layerClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-area', className);
        var clipPathId = id;
        var { r = 3, strokeWidth = 2 } = (_filterProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(dot, false)) !== null && _filterProps !== void 0 ? _filterProps : {
            r: 3,
            strokeWidth: 2
        };
        var clipDot = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isClipDot"])(dot);
        var dotSize = r * 2 + strokeWidth;
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
            className: layerClass
        }, needClip && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("defs", null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$GraphicalItemClipPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GraphicalItemClipPath"], {
            clipPathId: clipPathId,
            xAxisId: xAxisId,
            yAxisId: yAxisId
        }), !clipDot && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("clipPath", {
            id: "clipPath-dots-".concat(clipPathId)
        }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
            x: left - dotSize / 2,
            y: top - dotSize / 2,
            width: width + dotSize,
            height: height + dotSize
        }))), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](RenderArea, {
            needClip: needClip,
            clipPathId: clipPathId,
            props: this.props
        })), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ActivePoints$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ActivePoints"], {
            points: points,
            mainColor: getLegendItemColor(this.props.stroke, this.props.fill),
            itemDataKey: this.props.dataKey,
            activeDot: this.props.activeDot
        }), this.props.isRange && Array.isArray(baseLine) && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$ActivePoints$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ActivePoints"], {
            points: baseLine,
            mainColor: getLegendItemColor(this.props.stroke, this.props.fill),
            itemDataKey: this.props.dataKey,
            activeDot: this.props.activeDot
        }));
    }
}
var defaultAreaProps = {
    activeDot: true,
    animationBegin: 0,
    animationDuration: 1500,
    animationEasing: 'ease',
    connectNulls: false,
    dot: false,
    fill: '#3182bd',
    fillOpacity: 0.6,
    hide: false,
    isAnimationActive: !__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$Global$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Global"].isSsr,
    legendType: 'line',
    stroke: '#3182bd',
    xAxisId: 0,
    yAxisId: 0
};
function AreaImpl(props) {
    var _useAppSelector;
    var _resolveDefaultProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDefaultProps"])(props, defaultAreaProps), { activeDot, animationBegin, animationDuration, animationEasing, connectNulls, dot, fill, fillOpacity, hide, isAnimationActive, legendType, stroke, xAxisId, yAxisId } = _resolveDefaultProps, everythingElse = _objectWithoutProperties(_resolveDefaultProps, _excluded2);
    var layout = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartLayout"])();
    var chartName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$selectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartName"])();
    var { needClip } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$GraphicalItemClipPath$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useNeedsClip"])(xAxisId, yAxisId);
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    var { points, isRange, baseLine } = (_useAppSelector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$areaSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectArea"])(state, xAxisId, yAxisId, isPanorama, props.id))) !== null && _useAppSelector !== void 0 ? _useAppSelector : {};
    var plotArea = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["usePlotArea"])();
    if (layout !== 'horizontal' && layout !== 'vertical' || plotArea == null) {
        // Can't render Area in an unsupported layout
        return null;
    }
    if (chartName !== 'AreaChart' && chartName !== 'ComposedChart') {
        // There is nothing stopping us from rendering Area in other charts, except for historical reasons. Do we want to allow that?
        return null;
    }
    var { height, width, x: left, y: top } = plotArea;
    if (!points || !points.length) {
        return null;
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](AreaWithState, _extends({}, everythingElse, {
        activeDot: activeDot,
        animationBegin: animationBegin,
        animationDuration: animationDuration,
        animationEasing: animationEasing,
        baseLine: baseLine,
        connectNulls: connectNulls,
        dot: dot,
        fill: fill,
        fillOpacity: fillOpacity,
        height: height,
        hide: hide,
        layout: layout,
        isAnimationActive: isAnimationActive,
        isRange: isRange,
        legendType: legendType,
        needClip: needClip,
        points: points,
        stroke: stroke,
        width: width,
        left: left,
        top: top,
        xAxisId: xAxisId,
        yAxisId: yAxisId
    }));
}
var getBaseValue = (layout, chartBaseValue, itemBaseValue, xAxis, yAxis)=>{
    // The baseValue can be defined both on the AreaChart, and on the Area.
    // The value for the item takes precedence.
    var baseValue = itemBaseValue !== null && itemBaseValue !== void 0 ? itemBaseValue : chartBaseValue;
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(baseValue)) {
        return baseValue;
    }
    var numericAxis = layout === 'horizontal' ? yAxis : xAxis;
    // @ts-expect-error d3scale .domain() returns unknown, Math.max expects number
    var domain = numericAxis.scale.domain();
    if (numericAxis.type === 'number') {
        var domainMax = Math.max(domain[0], domain[1]);
        var domainMin = Math.min(domain[0], domain[1]);
        if (baseValue === 'dataMin') {
            return domainMin;
        }
        if (baseValue === 'dataMax') {
            return domainMax;
        }
        return domainMax < 0 ? domainMax : Math.max(Math.min(domain[0], domain[1]), 0);
    }
    if (baseValue === 'dataMin') {
        return domain[0];
    }
    if (baseValue === 'dataMax') {
        return domain[1];
    }
    return domain[0];
};
function computeArea(_ref8) {
    var { areaSettings: { connectNulls, baseValue: itemBaseValue, dataKey }, stackedData, layout, chartBaseValue, xAxis, yAxis, displayedData, dataStartIndex, xAxisTicks, yAxisTicks, bandSize } = _ref8;
    var hasStack = stackedData && stackedData.length;
    var baseValue = getBaseValue(layout, chartBaseValue, itemBaseValue, xAxis, yAxis);
    var isHorizontalLayout = layout === 'horizontal';
    var isRange = false;
    var points = displayedData.map((entry, index)=>{
        var value;
        if (hasStack) {
            value = stackedData[dataStartIndex + index];
        } else {
            value = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValueByDataKey"])(entry, dataKey);
            if (!Array.isArray(value)) {
                value = [
                    baseValue,
                    value
                ];
            } else {
                isRange = true;
            }
        }
        var isBreakPoint = value[1] == null || hasStack && !connectNulls && (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValueByDataKey"])(entry, dataKey) == null;
        if (isHorizontalLayout) {
            return {
                // @ts-expect-error getCateCoordinateOfLine expects chart data to be an object, we allow unknown
                x: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCateCoordinateOfLine"])({
                    axis: xAxis,
                    ticks: xAxisTicks,
                    bandSize,
                    entry,
                    index
                }),
                y: isBreakPoint ? null : yAxis.scale(value[1]),
                value,
                payload: entry
            };
        }
        return {
            x: isBreakPoint ? null : xAxis.scale(value[1]),
            // @ts-expect-error getCateCoordinateOfLine expects chart data to be an object, we allow unknown
            y: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCateCoordinateOfLine"])({
                axis: yAxis,
                ticks: yAxisTicks,
                bandSize,
                entry,
                index
            }),
            value,
            payload: entry
        };
    });
    var baseLine;
    if (hasStack || isRange) {
        baseLine = points.map((entry)=>{
            var x = Array.isArray(entry.value) ? entry.value[0] : null;
            if (isHorizontalLayout) {
                return {
                    x: entry.x,
                    y: x != null && entry.y != null ? yAxis.scale(x) : null,
                    payload: entry.payload
                };
            }
            return {
                x: x != null ? xAxis.scale(x) : null,
                y: entry.y,
                payload: entry.payload
            };
        });
    } else {
        baseLine = isHorizontalLayout ? yAxis.scale(baseValue) : xAxis.scale(baseValue);
    }
    return {
        points,
        baseLine,
        isRange
    };
}
function Area(outsideProps) {
    var props = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDefaultProps"])(outsideProps, defaultAreaProps);
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    // Report all props to Redux store first, before calling any hooks, to avoid circular dependencies.
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$RegisterGraphicalItemId$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["RegisterGraphicalItemId"], {
        id: props.id,
        type: "area"
    }, (id)=>/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetLegendPayload$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SetLegendPayload"], {
            legendPayload: computeLegendPayloadFromAreaData(props)
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetTooltipEntrySettings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SetTooltipEntrySettings"], {
            fn: getTooltipEntrySettings,
            args: props
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$SetGraphicalItem$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SetCartesianGraphicalItem"], {
            type: "area",
            id: id,
            data: props.data,
            dataKey: props.dataKey,
            xAxisId: props.xAxisId,
            yAxisId: props.yAxisId,
            zAxisId: 0,
            stackId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getNormalizedStackId"])(props.stackId),
            hide: props.hide,
            barSize: undefined,
            baseValue: props.baseValue,
            isPanorama: isPanorama,
            connectNulls: props.connectNulls
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](AreaImpl, _extends({}, props, {
            id: id
        }))));
}
Area.displayName = 'Area';
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/getEquidistantTicks.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getEquidistantTicks",
    ()=>getEquidistantTicks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/TickUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$getEveryNthWithCondition$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/getEveryNthWithCondition.js [app-ssr] (ecmascript)");
;
;
function getEquidistantTicks(sign, boundaries, getTickSize, ticks, minTickGap) {
    // If the ticks are readonly, then the slice might not be necessary
    var result = (ticks || []).slice();
    var { start: initialStart, end } = boundaries;
    var index = 0;
    // Premature optimisation idea 1: Estimate a lower bound, and start from there.
    // For now, start from every tick
    var stepsize = 1;
    var start = initialStart;
    var _loop = function _loop() {
        // Given stepsize, evaluate whether every stepsize-th tick can be shown.
        // If it can not, then increase the stepsize by 1, and try again.
        var entry = ticks === null || ticks === void 0 ? void 0 : ticks[index];
        // Break condition - If we have evaluated all the ticks, then we are done.
        if (entry === undefined) {
            return {
                v: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$getEveryNthWithCondition$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEveryNthWithCondition"])(ticks, stepsize)
            };
        }
        // Check if the element collides with the next element
        var i = index;
        var size;
        var getSize = ()=>{
            if (size === undefined) {
                size = getTickSize(entry, i);
            }
            return size;
        };
        var tickCoord = entry.coordinate;
        // We will always show the first tick.
        var isShow = index === 0 || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isVisible"])(sign, tickCoord, getSize, start, end);
        if (!isShow) {
            // Start all over with a larger stepsize
            index = 0;
            start = initialStart;
            stepsize += 1;
        }
        if (isShow) {
            // If it can be shown, update the start
            start = tickCoord + sign * (getSize() / 2 + minTickGap);
            index += stepsize;
        }
    }, _ret;
    while(stepsize <= result.length){
        _ret = _loop();
        if (_ret) return _ret.v;
    }
    return [];
}
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/getTicks.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getTicks",
    ()=>getTicks
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DataUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DOMUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DOMUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$Global$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/Global.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/TickUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$getEquidistantTicks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/getEquidistantTicks.js [app-ssr] (ecmascript)");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
;
;
;
;
;
function getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap) {
    var result = (ticks || []).slice();
    var len = result.length;
    var { start } = boundaries;
    var { end } = boundaries;
    var _loop = function _loop(i) {
        var entry = result[i];
        var size;
        var getSize = ()=>{
            if (size === undefined) {
                size = getTickSize(entry, i);
            }
            return size;
        };
        if (i === len - 1) {
            var gap = sign * (entry.coordinate + sign * getSize() / 2 - end);
            result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
                tickCoord: gap > 0 ? entry.coordinate - gap * sign : entry.coordinate
            });
        } else {
            result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
                tickCoord: entry.coordinate
            });
        }
        var isShow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isVisible"])(sign, entry.tickCoord, getSize, start, end);
        if (isShow) {
            end = entry.tickCoord - sign * (getSize() / 2 + minTickGap);
            result[i] = _objectSpread(_objectSpread({}, entry), {}, {
                isShow: true
            });
        }
    };
    for(var i = len - 1; i >= 0; i--){
        _loop(i);
    }
    return result;
}
function getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, preserveEnd) {
    // This method is mutating the array so clone is indeed necessary here
    var result = (ticks || []).slice();
    var len = result.length;
    var { start, end } = boundaries;
    if (preserveEnd) {
        // Try to guarantee the tail to be displayed
        var tail = ticks[len - 1];
        var tailSize = getTickSize(tail, len - 1);
        var tailGap = sign * (tail.coordinate + sign * tailSize / 2 - end);
        result[len - 1] = tail = _objectSpread(_objectSpread({}, tail), {}, {
            tickCoord: tailGap > 0 ? tail.coordinate - tailGap * sign : tail.coordinate
        });
        var isTailShow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isVisible"])(sign, tail.tickCoord, ()=>tailSize, start, end);
        if (isTailShow) {
            end = tail.tickCoord - sign * (tailSize / 2 + minTickGap);
            result[len - 1] = _objectSpread(_objectSpread({}, tail), {}, {
                isShow: true
            });
        }
    }
    var count = preserveEnd ? len - 1 : len;
    var _loop2 = function _loop2(i) {
        var entry = result[i];
        var size;
        var getSize = ()=>{
            if (size === undefined) {
                size = getTickSize(entry, i);
            }
            return size;
        };
        if (i === 0) {
            var gap = sign * (entry.coordinate - sign * getSize() / 2 - start);
            result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
                tickCoord: gap < 0 ? entry.coordinate - gap * sign : entry.coordinate
            });
        } else {
            result[i] = entry = _objectSpread(_objectSpread({}, entry), {}, {
                tickCoord: entry.coordinate
            });
        }
        var isShow = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isVisible"])(sign, entry.tickCoord, getSize, start, end);
        if (isShow) {
            start = entry.tickCoord + sign * (getSize() / 2 + minTickGap);
            result[i] = _objectSpread(_objectSpread({}, entry), {}, {
                isShow: true
            });
        }
    };
    for(var i = 0; i < count; i++){
        _loop2(i);
    }
    return result;
}
function getTicks(props, fontSize, letterSpacing) {
    var { tick, ticks, viewBox, minTickGap, orientation, interval, tickFormatter, unit, angle } = props;
    if (!ticks || !ticks.length || !tick) {
        return [];
    }
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(interval) || __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$Global$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Global"].isSsr) {
        var _getNumberIntervalTic;
        return (_getNumberIntervalTic = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getNumberIntervalTicks"])(ticks, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(interval) ? interval : 0)) !== null && _getNumberIntervalTic !== void 0 ? _getNumberIntervalTic : [];
    }
    var candidates = [];
    var sizeKey = orientation === 'top' || orientation === 'bottom' ? 'width' : 'height';
    var unitSize = unit && sizeKey === 'width' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DOMUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStringSize"])(unit, {
        fontSize,
        letterSpacing
    }) : {
        width: 0,
        height: 0
    };
    var getTickSize = (content, index)=>{
        var value = typeof tickFormatter === 'function' ? tickFormatter(content.value, index) : content.value;
        // Recharts only supports angles when sizeKey === 'width'
        return sizeKey === 'width' ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getAngledTickWidth"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DOMUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStringSize"])(value, {
            fontSize,
            letterSpacing
        }), unitSize, angle) : (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DOMUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getStringSize"])(value, {
            fontSize,
            letterSpacing
        })[sizeKey];
    };
    var sign = ticks.length >= 2 ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["mathSign"])(ticks[1].coordinate - ticks[0].coordinate) : 1;
    var boundaries = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$TickUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTickBoundaries"])(viewBox, sign, sizeKey);
    if (interval === 'equidistantPreserveStart') {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$getEquidistantTicks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getEquidistantTicks"])(sign, boundaries, getTickSize, ticks, minTickGap);
    }
    if (interval === 'preserveStart' || interval === 'preserveStartEnd') {
        candidates = getTicksStart(sign, boundaries, getTickSize, ticks, minTickGap, interval === 'preserveStartEnd');
    } else {
        candidates = getTicksEnd(sign, boundaries, getTickSize, ticks, minTickGap);
    }
    return candidates.filter((entry)=>entry.isShow);
}
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/CartesianAxis.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartesianAxis",
    ()=>CartesianAxis
]);
/**
 * @fileOverview Cartesian Axis
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$es$2d$toolkit$2f$compat$2f$get$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/es-toolkit/compat/get.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ShallowEqual$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ShallowEqual.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/container/Layer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/Text.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Label$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/Label.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DataUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$types$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/types.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ReactUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$getTicks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/getTicks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/svgPropertiesNoEvents.js [app-ssr] (ecmascript)");
var _excluded = [
    "viewBox"
], _excluded2 = [
    "viewBox"
];
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for(r = 0; r < n.length; r++)o = n[r], -1 === t.indexOf(o) && ({}).propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
}
function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for(var n in r)if (({}).hasOwnProperty.call(r, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r[n];
    }
    return t;
}
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
;
;
;
;
;
;
;
;
;
;
;
;
;
class CartesianAxis extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Component"] {
    constructor(props){
        super(props);
        this.tickRefs = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createRef"]();
        this.tickRefs.current = [];
        this.state = {
            fontSize: '',
            letterSpacing: ''
        };
    }
    shouldComponentUpdate(_ref, nextState) {
        var { viewBox } = _ref, restProps = _objectWithoutProperties(_ref, _excluded);
        // props.viewBox is sometimes generated every time -
        // check that specially as object equality is likely to fail
        var _this$props = this.props, { viewBox: viewBoxOld } = _this$props, restPropsOld = _objectWithoutProperties(_this$props, _excluded2);
        return !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ShallowEqual$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shallowEqual"])(viewBox, viewBoxOld) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ShallowEqual$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shallowEqual"])(restProps, restPropsOld) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ShallowEqual$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["shallowEqual"])(nextState, this.state);
    }
    /**
   * Calculate the coordinates of endpoints in ticks
   * @param  data The data of a simple tick
   * @return (x1, y1): The coordinate of endpoint close to tick text
   *  (x2, y2): The coordinate of endpoint close to axis
   */ getTickLineCoord(data) {
        var { x, y, width, height, orientation, tickSize, mirror, tickMargin } = this.props;
        var x1, x2, y1, y2, tx, ty;
        var sign = mirror ? -1 : 1;
        var finalTickSize = data.tickSize || tickSize;
        var tickCoord = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(data.tickCoord) ? data.tickCoord : data.coordinate;
        switch(orientation){
            case 'top':
                x1 = x2 = data.coordinate;
                y2 = y + +!mirror * height;
                y1 = y2 - sign * finalTickSize;
                ty = y1 - sign * tickMargin;
                tx = tickCoord;
                break;
            case 'left':
                y1 = y2 = data.coordinate;
                x2 = x + +!mirror * width;
                x1 = x2 - sign * finalTickSize;
                tx = x1 - sign * tickMargin;
                ty = tickCoord;
                break;
            case 'right':
                y1 = y2 = data.coordinate;
                x2 = x + +mirror * width;
                x1 = x2 + sign * finalTickSize;
                tx = x1 + sign * tickMargin;
                ty = tickCoord;
                break;
            default:
                x1 = x2 = data.coordinate;
                y2 = y + +mirror * height;
                y1 = y2 + sign * finalTickSize;
                ty = y1 + sign * tickMargin;
                tx = tickCoord;
                break;
        }
        return {
            line: {
                x1,
                y1,
                x2,
                y2
            },
            tick: {
                x: tx,
                y: ty
            }
        };
    }
    getTickTextAnchor() {
        var { orientation, mirror } = this.props;
        var textAnchor;
        switch(orientation){
            case 'left':
                textAnchor = mirror ? 'start' : 'end';
                break;
            case 'right':
                textAnchor = mirror ? 'end' : 'start';
                break;
            default:
                textAnchor = 'middle';
                break;
        }
        return textAnchor;
    }
    getTickVerticalAnchor() {
        var { orientation, mirror } = this.props;
        switch(orientation){
            case 'left':
            case 'right':
                return 'middle';
            case 'top':
                return mirror ? 'start' : 'end';
            default:
                return mirror ? 'end' : 'start';
        }
    }
    renderAxisLine() {
        var { x, y, width, height, orientation, mirror, axisLine } = this.props;
        var props = _objectSpread(_objectSpread(_objectSpread({}, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(this.props, false)), (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(axisLine, false)), {}, {
            fill: 'none'
        });
        if (orientation === 'top' || orientation === 'bottom') {
            var needHeight = +(orientation === 'top' && !mirror || orientation === 'bottom' && mirror);
            props = _objectSpread(_objectSpread({}, props), {}, {
                x1: x,
                y1: y + needHeight * height,
                x2: x + width,
                y2: y + needHeight * height
            });
        } else {
            var needWidth = +(orientation === 'left' && !mirror || orientation === 'right' && mirror);
            props = _objectSpread(_objectSpread({}, props), {}, {
                x1: x + needWidth * width,
                y1: y,
                x2: x + needWidth * width,
                y2: y + height
            });
        }
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("line", _extends({}, props, {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-cartesian-axis-line', (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$es$2d$toolkit$2f$compat$2f$get$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(axisLine, 'className'))
        }));
    }
    static renderTickItem(option, props, value) {
        var tickItem;
        var combinedClassName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(props.className, 'recharts-cartesian-axis-tick-value');
        if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](option)) {
            tickItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](option, _objectSpread(_objectSpread({}, props), {}, {
                className: combinedClassName
            }));
        } else if (typeof option === 'function') {
            tickItem = option(_objectSpread(_objectSpread({}, props), {}, {
                className: combinedClassName
            }));
        } else {
            var className = 'recharts-cartesian-axis-tick-value';
            if (typeof option !== 'boolean') {
                className = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])(className, option.className);
            }
            tickItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], _extends({}, props, {
                className: className
            }), value);
        }
        return tickItem;
    }
    /**
   * render the ticks
   * @param {string} fontSize Fontsize to consider for tick spacing
   * @param {string} letterSpacing Letter spacing to consider for tick spacing
   * @param {Array} ticks The ticks to actually render (overrides what was passed in props)
   * @return {ReactElement | null} renderedTicks
   */ renderTicks(fontSize, letterSpacing) {
        var ticks = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
        var { tickLine, stroke, tick, tickFormatter, unit, padding } = this.props;
        // @ts-expect-error some properties are optional in props but required in getTicks
        var finalTicks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$getTicks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTicks"])(_objectSpread(_objectSpread({}, this.props), {}, {
            ticks
        }), fontSize, letterSpacing);
        var textAnchor = this.getTickTextAnchor();
        var verticalAnchor = this.getTickVerticalAnchor();
        var axisProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["svgPropertiesNoEvents"])(this.props);
        var customTickProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(tick, false);
        var tickLineProps = _objectSpread(_objectSpread({}, axisProps), {}, {
            fill: 'none'
        }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(tickLine, false));
        var items = finalTicks.map((entry, i)=>{
            var { line: lineCoord, tick: tickCoord } = this.getTickLineCoord(entry);
            var tickProps = _objectSpread(_objectSpread(_objectSpread(_objectSpread({
                textAnchor,
                verticalAnchor
            }, axisProps), {}, {
                stroke: 'none',
                fill: stroke
            }, customTickProps), tickCoord), {}, {
                index: i,
                payload: entry,
                visibleTicksCount: finalTicks.length,
                tickFormatter,
                padding
            });
            return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], _extends({
                className: "recharts-cartesian-axis-tick",
                key: "tick-".concat(entry.value, "-").concat(entry.coordinate, "-").concat(entry.tickCoord)
            }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$types$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["adaptEventsOfChild"])(this.props, entry, i)), tickLine && /*#__PURE__*/ // @ts-expect-error recharts scale is not compatible with SVG scale
            __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("line", _extends({}, tickLineProps, lineCoord, {
                className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-cartesian-axis-tick-line', (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$es$2d$toolkit$2f$compat$2f$get$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(tickLine, 'className'))
            })), tick && CartesianAxis.renderTickItem(tick, tickProps, "".concat(typeof tickFormatter === 'function' ? tickFormatter(entry.value, i) : entry.value).concat(unit || '')));
        });
        return items.length > 0 ? /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("g", {
            className: "recharts-cartesian-axis-ticks"
        }, items) : null;
    }
    render() {
        var { axisLine, width, height, className, hide } = this.props;
        if (hide) {
            return null;
        }
        var { ticks } = this.props;
        /*
     * This is different condition from what validateWidthHeight is doing;
     * the CartesianAxis does allow width or height to be undefined.
     */ if (width != null && width <= 0 || height != null && height <= 0) {
            return null;
        }
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
            className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-cartesian-axis', className),
            ref: (_ref2)=>{
                if (_ref2) {
                    var tickNodes = _ref2.getElementsByClassName('recharts-cartesian-axis-tick-value');
                    this.tickRefs.current = Array.from(tickNodes);
                    var tick = tickNodes[0];
                    if (tick) {
                        var calculatedFontSize = window.getComputedStyle(tick).fontSize;
                        var calculatedLetterSpacing = window.getComputedStyle(tick).letterSpacing;
                        if (calculatedFontSize !== this.state.fontSize || calculatedLetterSpacing !== this.state.letterSpacing) {
                            this.setState({
                                fontSize: window.getComputedStyle(tick).fontSize,
                                letterSpacing: window.getComputedStyle(tick).letterSpacing
                            });
                        }
                    }
                }
            }
        }, axisLine && this.renderAxisLine(), this.renderTicks(this.state.fontSize, this.state.letterSpacing, ticks), __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Label$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"].renderCallByParent(this.props));
    }
}
_defineProperty(CartesianAxis, "displayName", 'CartesianAxis');
_defineProperty(CartesianAxis, "defaultProps", {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    viewBox: {
        x: 0,
        y: 0,
        width: 0,
        height: 0
    },
    // The orientation of axis
    orientation: 'bottom',
    // The ticks
    ticks: [],
    stroke: '#666',
    tickLine: true,
    axisLine: true,
    tick: true,
    mirror: false,
    minTickGap: 5,
    // The width or height of tick
    tickSize: 6,
    tickMargin: 2,
    interval: 'preserveEnd'
});
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/CartesianGrid.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartesianGrid",
    ()=>CartesianGrid
]);
/**
 * @fileOverview Cartesian Grid
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$LogUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/LogUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DataUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ChartUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$getTicks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/getTicks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/CartesianAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/chartLayoutContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/axisSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/PanoramaContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/resolveDefaultProps.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/svgPropertiesNoEvents.js [app-ssr] (ecmascript)");
var _excluded = [
    "x1",
    "y1",
    "x2",
    "y2",
    "key"
], _excluded2 = [
    "offset"
], _excluded3 = [
    "xAxisId",
    "yAxisId"
], _excluded4 = [
    "xAxisId",
    "yAxisId"
];
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for(r = 0; r < n.length; r++)o = n[r], -1 === t.indexOf(o) && ({}).propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
}
function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for(var n in r)if (({}).hasOwnProperty.call(r, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r[n];
    }
    return t;
}
;
;
;
;
;
;
;
;
;
;
;
;
/**
 * The <CartesianGrid horizontal
 */ var Background = (props)=>{
    var { fill } = props;
    if (!fill || fill === 'none') {
        return null;
    }
    var { fillOpacity, x, y, width, height, ry } = props;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
        x: x,
        y: y,
        ry: ry,
        width: width,
        height: height,
        stroke: "none",
        fill: fill,
        fillOpacity: fillOpacity,
        className: "recharts-cartesian-grid-bg"
    });
};
function renderLineItem(option, props) {
    var lineItem;
    if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](option)) {
        // @ts-expect-error typescript does not see the props type when cloning an element
        lineItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](option, props);
    } else if (typeof option === 'function') {
        lineItem = option(props);
    } else {
        var { x1, y1, x2, y2, key } = props, others = _objectWithoutProperties(props, _excluded);
        var _svgPropertiesNoEvent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["svgPropertiesNoEvents"])(others), { offset: __ } = _svgPropertiesNoEvent, restOfFilteredProps = _objectWithoutProperties(_svgPropertiesNoEvent, _excluded2);
        lineItem = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("line", _extends({}, restOfFilteredProps, {
            x1: x1,
            y1: y1,
            x2: x2,
            y2: y2,
            fill: "none",
            key: key
        }));
    }
    return lineItem;
}
function HorizontalGridLines(props) {
    var { x, width, horizontal = true, horizontalPoints } = props;
    if (!horizontal || !horizontalPoints || !horizontalPoints.length) {
        return null;
    }
    var { xAxisId, yAxisId } = props, otherLineItemProps = _objectWithoutProperties(props, _excluded3);
    var items = horizontalPoints.map((entry, i)=>{
        var lineItemProps = _objectSpread(_objectSpread({}, otherLineItemProps), {}, {
            x1: x,
            y1: entry,
            x2: x + width,
            y2: entry,
            key: "line-".concat(i),
            index: i
        });
        return renderLineItem(horizontal, lineItemProps);
    });
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("g", {
        className: "recharts-cartesian-grid-horizontal"
    }, items);
}
function VerticalGridLines(props) {
    var { y, height, vertical = true, verticalPoints } = props;
    if (!vertical || !verticalPoints || !verticalPoints.length) {
        return null;
    }
    var { xAxisId, yAxisId } = props, otherLineItemProps = _objectWithoutProperties(props, _excluded4);
    var items = verticalPoints.map((entry, i)=>{
        var lineItemProps = _objectSpread(_objectSpread({}, otherLineItemProps), {}, {
            x1: entry,
            y1: y,
            x2: entry,
            y2: y + height,
            key: "line-".concat(i),
            index: i
        });
        return renderLineItem(vertical, lineItemProps);
    });
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("g", {
        className: "recharts-cartesian-grid-vertical"
    }, items);
}
function HorizontalStripes(props) {
    var { horizontalFill, fillOpacity, x, y, width, height, horizontalPoints, horizontal = true } = props;
    if (!horizontal || !horizontalFill || !horizontalFill.length) {
        return null;
    }
    // Why =y -y? I was trying to find any difference that this makes, with floating point numbers and edge cases but ... nothing.
    var roundedSortedHorizontalPoints = horizontalPoints.map((e)=>Math.round(e + y - y)).sort((a, b)=>a - b);
    // Why is this condition `!==` instead of `<=` ?
    if (y !== roundedSortedHorizontalPoints[0]) {
        roundedSortedHorizontalPoints.unshift(0);
    }
    var items = roundedSortedHorizontalPoints.map((entry, i)=>{
        // Why do we strip only the last stripe if it is invisible, and not all invisible stripes?
        var lastStripe = !roundedSortedHorizontalPoints[i + 1];
        var lineHeight = lastStripe ? y + height - entry : roundedSortedHorizontalPoints[i + 1] - entry;
        if (lineHeight <= 0) {
            return null;
        }
        var colorIndex = i % horizontalFill.length;
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
            key: "react-".concat(i) // eslint-disable-line react/no-array-index-key
            ,
            y: entry,
            x: x,
            height: lineHeight,
            width: width,
            stroke: "none",
            fill: horizontalFill[colorIndex],
            fillOpacity: fillOpacity,
            className: "recharts-cartesian-grid-bg"
        });
    });
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("g", {
        className: "recharts-cartesian-gridstripes-horizontal"
    }, items);
}
function VerticalStripes(props) {
    var { vertical = true, verticalFill, fillOpacity, x, y, width, height, verticalPoints } = props;
    if (!vertical || !verticalFill || !verticalFill.length) {
        return null;
    }
    var roundedSortedVerticalPoints = verticalPoints.map((e)=>Math.round(e + x - x)).sort((a, b)=>a - b);
    if (x !== roundedSortedVerticalPoints[0]) {
        roundedSortedVerticalPoints.unshift(0);
    }
    var items = roundedSortedVerticalPoints.map((entry, i)=>{
        var lastStripe = !roundedSortedVerticalPoints[i + 1];
        var lineWidth = lastStripe ? x + width - entry : roundedSortedVerticalPoints[i + 1] - entry;
        if (lineWidth <= 0) {
            return null;
        }
        var colorIndex = i % verticalFill.length;
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
            key: "react-".concat(i) // eslint-disable-line react/no-array-index-key
            ,
            x: entry,
            y: y,
            width: lineWidth,
            height: height,
            stroke: "none",
            fill: verticalFill[colorIndex],
            fillOpacity: fillOpacity,
            className: "recharts-cartesian-grid-bg"
        });
    });
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("g", {
        className: "recharts-cartesian-gridstripes-vertical"
    }, items);
}
var defaultVerticalCoordinatesGenerator = (_ref, syncWithTicks)=>{
    var { xAxis, width, height, offset } = _ref;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCoordinatesOfGrid"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$getTicks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTicks"])(_objectSpread(_objectSpread(_objectSpread({}, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianAxis"].defaultProps), xAxis), {}, {
        ticks: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTicksOfAxis"])(xAxis, true),
        viewBox: {
            x: 0,
            y: 0,
            width,
            height
        }
    })), offset.left, offset.left + offset.width, syncWithTicks);
};
var defaultHorizontalCoordinatesGenerator = (_ref2, syncWithTicks)=>{
    var { yAxis, width, height, offset } = _ref2;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCoordinatesOfGrid"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$getTicks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTicks"])(_objectSpread(_objectSpread(_objectSpread({}, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianAxis"].defaultProps), yAxis), {}, {
        ticks: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getTicksOfAxis"])(yAxis, true),
        viewBox: {
            x: 0,
            y: 0,
            width,
            height
        }
    })), offset.top, offset.top + offset.height, syncWithTicks);
};
var defaultProps = {
    horizontal: true,
    vertical: true,
    // The ordinates of horizontal grid lines
    horizontalPoints: [],
    // The abscissas of vertical grid lines
    verticalPoints: [],
    stroke: '#ccc',
    fill: 'none',
    // The fill of colors of grid lines
    verticalFill: [],
    horizontalFill: [],
    xAxisId: 0,
    yAxisId: 0
};
function CartesianGrid(props) {
    var chartWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartWidth"])();
    var chartHeight = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartHeight"])();
    var offset = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useOffsetInternal"])();
    var propsIncludingDefaults = _objectSpread(_objectSpread({}, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDefaultProps"])(props, defaultProps)), {}, {
        x: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(props.x) ? props.x : offset.left,
        y: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(props.y) ? props.y : offset.top,
        width: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(props.width) ? props.width : offset.width,
        height: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(props.height) ? props.height : offset.height
    });
    var { xAxisId, yAxisId, x, y, width, height, syncWithTicks, horizontalValues, verticalValues } = propsIncludingDefaults;
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    var xAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisPropsNeededForCartesianGridTicksGenerator"])(state, 'xAxis', xAxisId, isPanorama));
    var yAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisPropsNeededForCartesianGridTicksGenerator"])(state, 'yAxis', yAxisId, isPanorama));
    if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(width) || width <= 0 || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(height) || height <= 0 || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(x) || x !== +x || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(y) || y !== +y) {
        return null;
    }
    /*
   * verticalCoordinatesGenerator and horizontalCoordinatesGenerator are defined
   * outside the propsIncludingDefaults because they were never part of the original props
   * and they were never passed as a prop down to horizontal/vertical custom elements.
   * If we add these two to propsIncludingDefaults then we are changing public API.
   * Not a bad thing per se but also not necessary.
   */ var verticalCoordinatesGenerator = propsIncludingDefaults.verticalCoordinatesGenerator || defaultVerticalCoordinatesGenerator;
    var horizontalCoordinatesGenerator = propsIncludingDefaults.horizontalCoordinatesGenerator || defaultHorizontalCoordinatesGenerator;
    var { horizontalPoints, verticalPoints } = propsIncludingDefaults;
    // No horizontal points are specified
    if ((!horizontalPoints || !horizontalPoints.length) && typeof horizontalCoordinatesGenerator === 'function') {
        var isHorizontalValues = horizontalValues && horizontalValues.length;
        var generatorResult = horizontalCoordinatesGenerator({
            yAxis: yAxis ? _objectSpread(_objectSpread({}, yAxis), {}, {
                ticks: isHorizontalValues ? horizontalValues : yAxis.ticks
            }) : undefined,
            width: chartWidth,
            height: chartHeight,
            offset
        }, isHorizontalValues ? true : syncWithTicks);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$LogUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["warn"])(Array.isArray(generatorResult), "horizontalCoordinatesGenerator should return Array but instead it returned [".concat(typeof generatorResult, "]"));
        if (Array.isArray(generatorResult)) {
            horizontalPoints = generatorResult;
        }
    }
    // No vertical points are specified
    if ((!verticalPoints || !verticalPoints.length) && typeof verticalCoordinatesGenerator === 'function') {
        var isVerticalValues = verticalValues && verticalValues.length;
        var _generatorResult = verticalCoordinatesGenerator({
            xAxis: xAxis ? _objectSpread(_objectSpread({}, xAxis), {}, {
                ticks: isVerticalValues ? verticalValues : xAxis.ticks
            }) : undefined,
            width: chartWidth,
            height: chartHeight,
            offset
        }, isVerticalValues ? true : syncWithTicks);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$LogUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["warn"])(Array.isArray(_generatorResult), "verticalCoordinatesGenerator should return Array but instead it returned [".concat(typeof _generatorResult, "]"));
        if (Array.isArray(_generatorResult)) {
            verticalPoints = _generatorResult;
        }
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("g", {
        className: "recharts-cartesian-grid"
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Background, {
        fill: propsIncludingDefaults.fill,
        fillOpacity: propsIncludingDefaults.fillOpacity,
        x: propsIncludingDefaults.x,
        y: propsIncludingDefaults.y,
        width: propsIncludingDefaults.width,
        height: propsIncludingDefaults.height,
        ry: propsIncludingDefaults.ry
    }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](HorizontalStripes, _extends({}, propsIncludingDefaults, {
        horizontalPoints: horizontalPoints
    })), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](VerticalStripes, _extends({}, propsIncludingDefaults, {
        verticalPoints: verticalPoints
    })), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](HorizontalGridLines, _extends({}, propsIncludingDefaults, {
        offset: offset,
        horizontalPoints: horizontalPoints,
        xAxis: xAxis,
        yAxis: yAxis
    })), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](VerticalGridLines, _extends({}, propsIncludingDefaults, {
        offset: offset,
        verticalPoints: verticalPoints,
        xAxis: xAxis,
        yAxis: yAxis
    })));
}
CartesianGrid.displayName = 'CartesianGrid';
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/XAxis.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "XAxis",
    ()=>XAxis
]);
/**
 * @fileOverview X Axis
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/CartesianAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$cartesianAxisSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/cartesianAxisSlice.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/axisSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$selectChartOffsetInternal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/PanoramaContext.js [app-ssr] (ecmascript)");
var _excluded = [
    "children"
], _excluded2 = [
    "dangerouslySetInnerHTML",
    "ticks"
];
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for(r = 0; r < n.length; r++)o = n[r], -1 === t.indexOf(o) && ({}).propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
}
function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for(var n in r)if (({}).hasOwnProperty.call(r, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r[n];
    }
    return t;
}
;
;
;
;
;
;
;
;
;
function SetXAxisSettings(props) {
    var dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    var settings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        var { children } = props, rest = _objectWithoutProperties(props, _excluded);
        return rest;
    }, [
        props
    ]);
    var synchronizedSettings = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectXAxisSettings"])(state, settings.id));
    var settingsAreSynchronized = settings === synchronizedSettings;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$cartesianAxisSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addXAxis"])(settings));
        return ()=>{
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$cartesianAxisSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeXAxis"])(settings));
        };
    }, [
        settings,
        dispatch
    ]);
    if (settingsAreSynchronized) {
        return props.children;
    }
    return null;
}
var XAxisImpl = (props)=>{
    var { xAxisId, className } = props;
    var viewBox = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$selectChartOffsetInternal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisViewBox"]);
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    var axisType = 'xAxis';
    var scale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisScale"])(state, axisType, xAxisId, isPanorama));
    var cartesianTickItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectTicksOfAxis"])(state, axisType, xAxisId, isPanorama));
    var axisSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectXAxisSize"])(state, xAxisId));
    var position = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectXAxisPosition"])(state, xAxisId));
    if (axisSize == null || position == null) {
        return null;
    }
    var { dangerouslySetInnerHTML, ticks } = props, allOtherProps = _objectWithoutProperties(props, _excluded2);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianAxis"], _extends({}, allOtherProps, {
        scale: scale,
        x: position.x,
        y: position.y,
        width: axisSize.width,
        height: axisSize.height,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])("recharts-".concat(axisType, " ").concat(axisType), className),
        viewBox: viewBox,
        ticks: cartesianTickItems
    }));
};
var XAxisSettingsDispatcher = (props)=>{
    var _props$interval, _props$includeHidden, _props$angle, _props$minTickGap, _props$tick;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](SetXAxisSettings, {
        interval: (_props$interval = props.interval) !== null && _props$interval !== void 0 ? _props$interval : 'preserveEnd',
        id: props.xAxisId,
        scale: props.scale,
        type: props.type,
        padding: props.padding,
        allowDataOverflow: props.allowDataOverflow,
        domain: props.domain,
        dataKey: props.dataKey,
        allowDuplicatedCategory: props.allowDuplicatedCategory,
        allowDecimals: props.allowDecimals,
        tickCount: props.tickCount,
        includeHidden: (_props$includeHidden = props.includeHidden) !== null && _props$includeHidden !== void 0 ? _props$includeHidden : false,
        reversed: props.reversed,
        ticks: props.ticks,
        height: props.height,
        orientation: props.orientation,
        mirror: props.mirror,
        hide: props.hide,
        unit: props.unit,
        name: props.name,
        angle: (_props$angle = props.angle) !== null && _props$angle !== void 0 ? _props$angle : 0,
        minTickGap: (_props$minTickGap = props.minTickGap) !== null && _props$minTickGap !== void 0 ? _props$minTickGap : 5,
        tick: (_props$tick = props.tick) !== null && _props$tick !== void 0 ? _props$tick : true,
        tickFormatter: props.tickFormatter
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](XAxisImpl, props));
};
class XAxis extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Component"] {
    render() {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](XAxisSettingsDispatcher, this.props);
    }
}
_defineProperty(XAxis, "displayName", 'XAxis');
_defineProperty(XAxis, "defaultProps", {
    allowDataOverflow: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].allowDataOverflow,
    allowDecimals: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].allowDecimals,
    allowDuplicatedCategory: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].allowDuplicatedCategory,
    height: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].height,
    hide: false,
    mirror: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].mirror,
    orientation: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].orientation,
    padding: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].padding,
    reversed: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].reversed,
    scale: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].scale,
    tickCount: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].tickCount,
    type: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitXAxis"].type,
    xAxisId: 0
});
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/YAxis.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "YAxis",
    ()=>YAxis,
    "YAxisDefaultProps",
    ()=>YAxisDefaultProps
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/CartesianAxis.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$cartesianAxisSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/cartesianAxisSlice.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/axisSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$selectChartOffsetInternal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/selectChartOffsetInternal.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/PanoramaContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$YAxisUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/YAxisUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Label$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/Label.js [app-ssr] (ecmascript)");
var _excluded = [
    "dangerouslySetInnerHTML",
    "ticks"
];
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
function _objectWithoutProperties(e, t) {
    if (null == e) return {};
    var o, r, i = _objectWithoutPropertiesLoose(e, t);
    if (Object.getOwnPropertySymbols) {
        var n = Object.getOwnPropertySymbols(e);
        for(r = 0; r < n.length; r++)o = n[r], -1 === t.indexOf(o) && ({}).propertyIsEnumerable.call(e, o) && (i[o] = e[o]);
    }
    return i;
}
function _objectWithoutPropertiesLoose(r, e) {
    if (null == r) return {};
    var t = {};
    for(var n in r)if (({}).hasOwnProperty.call(r, n)) {
        if (-1 !== e.indexOf(n)) continue;
        t[n] = r[n];
    }
    return t;
}
;
;
;
;
;
;
;
;
;
;
;
function SetYAxisSettings(settings) {
    var dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$cartesianAxisSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addYAxis"])(settings));
        return ()=>{
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$cartesianAxisSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeYAxis"])(settings));
        };
    }, [
        settings,
        dispatch
    ]);
    return null;
}
var YAxisImpl = (props)=>{
    var _cartesianAxisRef$cur;
    var { yAxisId, className, width, label } = props;
    var cartesianAxisRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var labelRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    var viewBox = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$selectChartOffsetInternal$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisViewBox"]);
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    var dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    var axisType = 'yAxis';
    var scale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisScale"])(state, axisType, yAxisId, isPanorama));
    var axisSize = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectYAxisSize"])(state, yAxisId));
    var position = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectYAxisPosition"])(state, yAxisId));
    var cartesianTickItems = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectTicksOfAxis"])(state, axisType, yAxisId, isPanorama));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        var _axisComponent$tickRe;
        // No dynamic width calculation is done when width !== 'auto'
        // or when a function/react element is used for label
        if (width !== 'auto' || !axisSize || (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Label$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isLabelContentAFunction"])(label) || /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"])(label)) return;
        var axisComponent = cartesianAxisRef.current;
        var tickNodes = axisComponent === null || axisComponent === void 0 || (_axisComponent$tickRe = axisComponent.tickRefs) === null || _axisComponent$tickRe === void 0 ? void 0 : _axisComponent$tickRe.current;
        var { tickSize, tickMargin } = axisComponent.props;
        // get calculated width based on the label width, ticks etc
        var updatedYAxisWidth = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$YAxisUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getCalculatedYAxisWidth"])({
            ticks: tickNodes,
            label: labelRef.current,
            labelGapWithTick: 5,
            tickSize,
            tickMargin
        });
        // if the width has changed, dispatch an action to update the width
        if (Math.round(axisSize.width) !== Math.round(updatedYAxisWidth)) dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$cartesianAxisSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["updateYAxisWidth"])({
            id: yAxisId,
            width: updatedYAxisWidth
        }));
    }, [
        cartesianAxisRef,
        cartesianAxisRef === null || cartesianAxisRef === void 0 || (_cartesianAxisRef$cur = cartesianAxisRef.current) === null || _cartesianAxisRef$cur === void 0 || (_cartesianAxisRef$cur = _cartesianAxisRef$cur.tickRefs) === null || _cartesianAxisRef$cur === void 0 ? void 0 : _cartesianAxisRef$cur.current,
        axisSize === null || axisSize === void 0 ? void 0 : axisSize.width,
        axisSize,
        dispatch,
        label,
        yAxisId,
        width
    ]);
    if (axisSize == null || position == null) {
        return null;
    }
    var { dangerouslySetInnerHTML, ticks } = props, allOtherProps = _objectWithoutProperties(props, _excluded);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$cartesian$2f$CartesianAxis$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["CartesianAxis"], _extends({}, allOtherProps, {
        ref: cartesianAxisRef,
        labelRef: labelRef,
        scale: scale,
        x: position.x,
        y: position.y,
        width: axisSize.width,
        height: axisSize.height,
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])("recharts-".concat(axisType, " ").concat(axisType), className),
        viewBox: viewBox,
        ticks: cartesianTickItems
    }));
};
var YAxisSettingsDispatcher = (props)=>{
    var _props$interval, _props$includeHidden, _props$angle, _props$minTickGap, _props$tick;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](SetYAxisSettings, {
        interval: (_props$interval = props.interval) !== null && _props$interval !== void 0 ? _props$interval : 'preserveEnd',
        id: props.yAxisId,
        scale: props.scale,
        type: props.type,
        domain: props.domain,
        allowDataOverflow: props.allowDataOverflow,
        dataKey: props.dataKey,
        allowDuplicatedCategory: props.allowDuplicatedCategory,
        allowDecimals: props.allowDecimals,
        tickCount: props.tickCount,
        padding: props.padding,
        includeHidden: (_props$includeHidden = props.includeHidden) !== null && _props$includeHidden !== void 0 ? _props$includeHidden : false,
        reversed: props.reversed,
        ticks: props.ticks,
        width: props.width,
        orientation: props.orientation,
        mirror: props.mirror,
        hide: props.hide,
        unit: props.unit,
        name: props.name,
        angle: (_props$angle = props.angle) !== null && _props$angle !== void 0 ? _props$angle : 0,
        minTickGap: (_props$minTickGap = props.minTickGap) !== null && _props$minTickGap !== void 0 ? _props$minTickGap : 5,
        tick: (_props$tick = props.tick) !== null && _props$tick !== void 0 ? _props$tick : true,
        tickFormatter: props.tickFormatter
    }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](YAxisImpl, props));
};
var YAxisDefaultProps = {
    allowDataOverflow: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].allowDataOverflow,
    allowDecimals: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].allowDecimals,
    allowDuplicatedCategory: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].allowDuplicatedCategory,
    hide: false,
    mirror: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].mirror,
    orientation: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].orientation,
    padding: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].padding,
    reversed: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].reversed,
    scale: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].scale,
    tickCount: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].tickCount,
    type: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].type,
    width: __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["implicitYAxis"].width,
    yAxisId: 0
};
class YAxis extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Component"] {
    render() {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](YAxisSettingsDispatcher, this.props);
    }
}
_defineProperty(YAxis, "displayName", 'YAxis');
_defineProperty(YAxis, "defaultProps", YAxisDefaultProps);
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/Brush.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Brush",
    ()=>Brush
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$victory$2d$vendor$2f$es$2f$d3$2d$scale$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/victory-vendor/es/d3-scale.js [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$d3$2d$scale$2f$src$2f$band$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__point__as__scalePoint$3e$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/d3-scale/src/band.js [app-ssr] (ecmascript) <export point as scalePoint>");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$es$2d$toolkit$2f$compat$2f$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/es-toolkit/compat/range.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/container/Layer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/Text.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ChartUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DataUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$CssPrefixUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/CssPrefixUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartDataContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/chartDataContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$brushUpdateContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/brushUpdateContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$chartDataSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/chartDataSlice.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$brushSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/brushSlice.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/PanoramaContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$brushSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/brushSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$synchronisation$2f$useChartSynchronisation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/synchronisation/useChartSynchronisation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/resolveDefaultProps.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/svgPropertiesNoEvents.js [app-ssr] (ecmascript)");
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
// Why is this tickFormatter different from the other TickFormatters? This one allows to return numbers too for some reason.
function DefaultTraveller(props) {
    var { x, y, width, height, stroke } = props;
    var lineY = Math.floor(y + height / 2) - 1;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
        x: x,
        y: y,
        width: width,
        height: height,
        fill: stroke,
        stroke: "none"
    }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("line", {
        x1: x + 1,
        y1: lineY,
        x2: x + width - 1,
        y2: lineY,
        fill: "none",
        stroke: "#fff"
    }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("line", {
        x1: x + 1,
        y1: lineY + 2,
        x2: x + width - 1,
        y2: lineY + 2,
        fill: "none",
        stroke: "#fff"
    }));
}
function Traveller(props) {
    var { travellerProps, travellerType } = props;
    if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](travellerType)) {
        // @ts-expect-error element cloning disagrees with the types (and it should)
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](travellerType, travellerProps);
    }
    if (typeof travellerType === 'function') {
        return travellerType(travellerProps);
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](DefaultTraveller, travellerProps);
}
function TravellerLayer(_ref) {
    var _data$startIndex, _data$endIndex;
    var { otherProps, travellerX, id, onMouseEnter, onMouseLeave, onMouseDown, onTouchStart, onTravellerMoveKeyboard, onFocus, onBlur } = _ref;
    var { y, x: xFromProps, travellerWidth, height, traveller, ariaLabel, data, startIndex, endIndex } = otherProps;
    var x = Math.max(travellerX, xFromProps);
    var travellerProps = _objectSpread(_objectSpread({}, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$svgPropertiesNoEvents$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["svgPropertiesNoEvents"])(otherProps)), {}, {
        x,
        y,
        width: travellerWidth,
        height
    });
    var ariaLabelBrush = ariaLabel || "Min value: ".concat((_data$startIndex = data[startIndex]) === null || _data$startIndex === void 0 ? void 0 : _data$startIndex.name, ", Max value: ").concat((_data$endIndex = data[endIndex]) === null || _data$endIndex === void 0 ? void 0 : _data$endIndex.name);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
        tabIndex: 0,
        role: "slider",
        "aria-label": ariaLabelBrush,
        "aria-valuenow": travellerX,
        className: "recharts-brush-traveller",
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        onMouseDown: onMouseDown,
        onTouchStart: onTouchStart,
        onKeyDown: (e)=>{
            if (![
                'ArrowLeft',
                'ArrowRight'
            ].includes(e.key)) {
                return;
            }
            e.preventDefault();
            e.stopPropagation();
            onTravellerMoveKeyboard(e.key === 'ArrowRight' ? 1 : -1, id);
        },
        onFocus: onFocus,
        onBlur: onBlur,
        style: {
            cursor: 'col-resize'
        }
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Traveller, {
        travellerType: traveller,
        travellerProps: travellerProps
    }));
}
/*
 * This one cannot be a React Component because React is not happy with it returning only string | number.
 * React wants a full React.JSX.Element but that is not compatible with Text component.
 */ function getTextOfTick(props) {
    var { index, data, tickFormatter, dataKey } = props;
    // @ts-expect-error getValueByDataKey does not validate the output type
    var text = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ChartUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getValueByDataKey"])(data[index], dataKey, index);
    return typeof tickFormatter === 'function' ? tickFormatter(text, index) : text;
}
function getIndexInRange(valueRange, x) {
    var len = valueRange.length;
    var start = 0;
    var end = len - 1;
    while(end - start > 1){
        var middle = Math.floor((start + end) / 2);
        if (valueRange[middle] > x) {
            end = middle;
        } else {
            start = middle;
        }
    }
    return x >= valueRange[end] ? end : start;
}
function getIndex(_ref2) {
    var { startX, endX, scaleValues, gap, data } = _ref2;
    var lastIndex = data.length - 1;
    var min = Math.min(startX, endX);
    var max = Math.max(startX, endX);
    var minIndex = getIndexInRange(scaleValues, min);
    var maxIndex = getIndexInRange(scaleValues, max);
    return {
        startIndex: minIndex - minIndex % gap,
        endIndex: maxIndex === lastIndex ? lastIndex : maxIndex - maxIndex % gap
    };
}
function Background(_ref3) {
    var { x, y, width, height, fill, stroke } = _ref3;
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
        stroke: stroke,
        fill: fill,
        x: x,
        y: y,
        width: width,
        height: height
    });
}
function BrushText(_ref4) {
    var { startIndex, endIndex, y, height, travellerWidth, stroke, tickFormatter, dataKey, data, startX, endX } = _ref4;
    var offset = 5;
    var attrs = {
        pointerEvents: 'none',
        fill: stroke
    };
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
        className: "recharts-brush-texts"
    }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], _extends({
        textAnchor: "end",
        verticalAnchor: "middle",
        x: Math.min(startX, endX) - offset,
        y: y + height / 2
    }, attrs), getTextOfTick({
        index: startIndex,
        tickFormatter,
        dataKey,
        data
    })), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Text$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Text"], _extends({
        textAnchor: "start",
        verticalAnchor: "middle",
        x: Math.max(startX, endX) + travellerWidth + offset,
        y: y + height / 2
    }, attrs), getTextOfTick({
        index: endIndex,
        tickFormatter,
        dataKey,
        data
    })));
}
function Slide(_ref5) {
    var { y, height, stroke, travellerWidth, startX, endX, onMouseEnter, onMouseLeave, onMouseDown, onTouchStart } = _ref5;
    var x = Math.min(startX, endX) + travellerWidth;
    var width = Math.max(Math.abs(endX - startX) - travellerWidth, 0);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("rect", {
        className: "recharts-brush-slide",
        onMouseEnter: onMouseEnter,
        onMouseLeave: onMouseLeave,
        onMouseDown: onMouseDown,
        onTouchStart: onTouchStart,
        style: {
            cursor: 'move'
        },
        stroke: "none",
        fill: stroke,
        fillOpacity: 0.2,
        x: x,
        y: y,
        width: width,
        height: height
    });
}
function Panorama(_ref6) {
    var { x, y, width, height, data, children, padding } = _ref6;
    var isPanoramic = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].count(children) === 1;
    if (!isPanoramic) {
        return null;
    }
    var chartElement = __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Children"].only(children);
    if (!chartElement) {
        return null;
    }
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](chartElement, {
        x,
        y,
        width,
        height,
        margin: padding,
        compact: true,
        data
    });
}
var createScale = (_ref7)=>{
    var { data, startIndex, endIndex, x, width, travellerWidth } = _ref7;
    if (!data || !data.length) {
        return {};
    }
    var len = data.length;
    var scale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$d3$2d$scale$2f$src$2f$band$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__point__as__scalePoint$3e$__["scalePoint"])().domain((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$es$2d$toolkit$2f$compat$2f$range$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"])(0, len)).range([
        x,
        x + width - travellerWidth
    ]);
    var scaleValues = scale.domain().map((entry)=>scale(entry));
    return {
        isTextActive: false,
        isSlideMoving: false,
        isTravellerMoving: false,
        isTravellerFocused: false,
        startX: scale(startIndex),
        endX: scale(endIndex),
        scale,
        scaleValues
    };
};
var isTouch = (e)=>e.changedTouches && !!e.changedTouches.length;
class BrushWithState extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PureComponent"] {
    constructor(props){
        super(props);
        _defineProperty(this, "handleDrag", (e)=>{
            if (this.leaveTimer) {
                clearTimeout(this.leaveTimer);
                this.leaveTimer = null;
            }
            if (this.state.isTravellerMoving) {
                this.handleTravellerMove(e);
            } else if (this.state.isSlideMoving) {
                this.handleSlideDrag(e);
            }
        });
        _defineProperty(this, "handleTouchMove", (e)=>{
            if (e.changedTouches != null && e.changedTouches.length > 0) {
                this.handleDrag(e.changedTouches[0]);
            }
        });
        _defineProperty(this, "handleDragEnd", ()=>{
            this.setState({
                isTravellerMoving: false,
                isSlideMoving: false
            }, ()=>{
                var { endIndex, onDragEnd, startIndex } = this.props;
                onDragEnd === null || onDragEnd === void 0 || onDragEnd({
                    endIndex,
                    startIndex
                });
            });
            this.detachDragEndListener();
        });
        _defineProperty(this, "handleLeaveWrapper", ()=>{
            if (this.state.isTravellerMoving || this.state.isSlideMoving) {
                this.leaveTimer = window.setTimeout(this.handleDragEnd, this.props.leaveTimeOut);
            }
        });
        _defineProperty(this, "handleEnterSlideOrTraveller", ()=>{
            this.setState({
                isTextActive: true
            });
        });
        _defineProperty(this, "handleLeaveSlideOrTraveller", ()=>{
            this.setState({
                isTextActive: false
            });
        });
        _defineProperty(this, "handleSlideDragStart", (e)=>{
            var event = isTouch(e) ? e.changedTouches[0] : e;
            this.setState({
                isTravellerMoving: false,
                isSlideMoving: true,
                slideMoveStartX: event.pageX
            });
            this.attachDragEndListener();
        });
        _defineProperty(this, "handleTravellerMoveKeyboard", (direction, id)=>{
            var { data, gap } = this.props;
            // scaleValues are a list of coordinates. For example: [65, 250, 435, 620, 805, 990].
            var { scaleValues, startX, endX } = this.state;
            if (scaleValues == null) {
                return;
            }
            // currentScaleValue refers to which coordinate the current traveller should be placed at.
            var currentScaleValue = this.state[id];
            var currentIndex = scaleValues.indexOf(currentScaleValue);
            if (currentIndex === -1) {
                return;
            }
            var newIndex = currentIndex + direction;
            if (newIndex === -1 || newIndex >= scaleValues.length) {
                return;
            }
            var newScaleValue = scaleValues[newIndex];
            // Prevent travellers from being on top of each other or overlapping
            if (id === 'startX' && newScaleValue >= endX || id === 'endX' && newScaleValue <= startX) {
                return;
            }
            this.setState(// @ts-expect-error not sure why typescript is not happy with this, partial update is fine in React
            {
                [id]: newScaleValue
            }, ()=>{
                this.props.onChange(getIndex({
                    startX: this.state.startX,
                    endX: this.state.endX,
                    data,
                    gap,
                    scaleValues
                }));
            });
        });
        this.travellerDragStartHandlers = {
            startX: this.handleTravellerDragStart.bind(this, 'startX'),
            endX: this.handleTravellerDragStart.bind(this, 'endX')
        };
        this.state = {
            brushMoveStartX: 0,
            movingTravellerId: undefined,
            endX: 0,
            startX: 0,
            slideMoveStartX: 0
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        var { data, width, x, travellerWidth, startIndex, endIndex, startIndexControlledFromProps, endIndexControlledFromProps } = nextProps;
        if (data !== prevState.prevData) {
            return _objectSpread({
                prevData: data,
                prevTravellerWidth: travellerWidth,
                prevX: x,
                prevWidth: width
            }, data && data.length ? createScale({
                data,
                width,
                x,
                travellerWidth,
                startIndex,
                endIndex
            }) : {
                scale: undefined,
                scaleValues: undefined
            });
        }
        var prevScale = prevState.scale;
        if (prevScale && (width !== prevState.prevWidth || x !== prevState.prevX || travellerWidth !== prevState.prevTravellerWidth)) {
            prevScale.range([
                x,
                x + width - travellerWidth
            ]);
            var scaleValues = prevScale.domain().map((entry)=>prevScale(entry)).filter(Boolean);
            return {
                prevData: data,
                prevTravellerWidth: travellerWidth,
                prevX: x,
                prevWidth: width,
                startX: prevScale(nextProps.startIndex),
                endX: prevScale(nextProps.endIndex),
                scaleValues
            };
        }
        if (prevState.scale && !prevState.isSlideMoving && !prevState.isTravellerMoving && !prevState.isTravellerFocused && !prevState.isTextActive) {
            /*
       * If the startIndex or endIndex are controlled from the outside,
       * we need to keep the startX and end up to date.
       * Also we do not want to do that while user is interacting in the brush,
       * because this will trigger re-render and interrupt the drag&drop.
       */ if (startIndexControlledFromProps != null && prevState.prevStartIndexControlledFromProps !== startIndexControlledFromProps) {
                return {
                    startX: prevState.scale(startIndexControlledFromProps),
                    prevStartIndexControlledFromProps: startIndexControlledFromProps
                };
            }
            if (endIndexControlledFromProps != null && prevState.prevEndIndexControlledFromProps !== endIndexControlledFromProps) {
                return {
                    endX: prevState.scale(endIndexControlledFromProps),
                    prevEndIndexControlledFromProps: endIndexControlledFromProps
                };
            }
        }
        return null;
    }
    componentWillUnmount() {
        if (this.leaveTimer) {
            clearTimeout(this.leaveTimer);
            this.leaveTimer = null;
        }
        this.detachDragEndListener();
    }
    attachDragEndListener() {
        window.addEventListener('mouseup', this.handleDragEnd, true);
        window.addEventListener('touchend', this.handleDragEnd, true);
        window.addEventListener('mousemove', this.handleDrag, true);
    }
    detachDragEndListener() {
        window.removeEventListener('mouseup', this.handleDragEnd, true);
        window.removeEventListener('touchend', this.handleDragEnd, true);
        window.removeEventListener('mousemove', this.handleDrag, true);
    }
    handleSlideDrag(e) {
        var { slideMoveStartX, startX, endX, scaleValues } = this.state;
        if (scaleValues == null) {
            return;
        }
        var { x, width, travellerWidth, startIndex, endIndex, onChange, data, gap } = this.props;
        var delta = e.pageX - slideMoveStartX;
        if (delta > 0) {
            delta = Math.min(delta, x + width - travellerWidth - endX, x + width - travellerWidth - startX);
        } else if (delta < 0) {
            delta = Math.max(delta, x - startX, x - endX);
        }
        var newIndex = getIndex({
            startX: startX + delta,
            endX: endX + delta,
            data,
            gap,
            scaleValues
        });
        if ((newIndex.startIndex !== startIndex || newIndex.endIndex !== endIndex) && onChange) {
            onChange(newIndex);
        }
        this.setState({
            startX: startX + delta,
            endX: endX + delta,
            slideMoveStartX: e.pageX
        });
    }
    handleTravellerDragStart(id, e) {
        var event = isTouch(e) ? e.changedTouches[0] : e;
        this.setState({
            isSlideMoving: false,
            isTravellerMoving: true,
            movingTravellerId: id,
            brushMoveStartX: event.pageX
        });
        this.attachDragEndListener();
    }
    handleTravellerMove(e) {
        var { brushMoveStartX, movingTravellerId, endX, startX, scaleValues } = this.state;
        if (movingTravellerId == null) {
            return;
        }
        var prevValue = this.state[movingTravellerId];
        var { x, width, travellerWidth, onChange, gap, data } = this.props;
        var params = {
            startX: this.state.startX,
            endX: this.state.endX,
            data,
            gap,
            scaleValues
        };
        var delta = e.pageX - brushMoveStartX;
        if (delta > 0) {
            delta = Math.min(delta, x + width - travellerWidth - prevValue);
        } else if (delta < 0) {
            delta = Math.max(delta, x - prevValue);
        }
        params[movingTravellerId] = prevValue + delta;
        var newIndex = getIndex(params);
        var { startIndex, endIndex } = newIndex;
        var isFullGap = ()=>{
            var lastIndex = data.length - 1;
            if (movingTravellerId === 'startX' && (endX > startX ? startIndex % gap === 0 : endIndex % gap === 0) || endX < startX && endIndex === lastIndex || movingTravellerId === 'endX' && (endX > startX ? endIndex % gap === 0 : startIndex % gap === 0) || endX > startX && endIndex === lastIndex) {
                return true;
            }
            return false;
        };
        this.setState(// @ts-expect-error not sure why typescript is not happy with this, partial update is fine in React
        {
            [movingTravellerId]: prevValue + delta,
            brushMoveStartX: e.pageX
        }, ()=>{
            if (onChange) {
                if (isFullGap()) {
                    onChange(newIndex);
                }
            }
        });
    }
    render() {
        var { data, className, children, x, y, dy, width, height, alwaysShowText, fill, stroke, startIndex, endIndex, travellerWidth, tickFormatter, dataKey, padding } = this.props;
        var { startX, endX, isTextActive, isSlideMoving, isTravellerMoving, isTravellerFocused } = this.state;
        if (!data || !data.length || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(x) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(y) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(width) || !(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumber"])(height) || width <= 0 || height <= 0) {
            return null;
        }
        var layerClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-brush', className);
        var style = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$CssPrefixUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["generatePrefixStyle"])('userSelect', 'none');
        var calculatedY = y + (dy !== null && dy !== void 0 ? dy : 0);
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
            className: layerClass,
            onMouseLeave: this.handleLeaveWrapper,
            onTouchMove: this.handleTouchMove,
            style: style
        }, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Background, {
            x: x,
            y: calculatedY,
            width: width,
            height: height,
            fill: fill,
            stroke: stroke
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["PanoramaContextProvider"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Panorama, {
            x: x,
            y: calculatedY,
            width: width,
            height: height,
            data: data,
            padding: padding
        }, children)), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](Slide, {
            y: calculatedY,
            height: height,
            stroke: stroke,
            travellerWidth: travellerWidth,
            startX: startX,
            endX: endX,
            onMouseEnter: this.handleEnterSlideOrTraveller,
            onMouseLeave: this.handleLeaveSlideOrTraveller,
            onMouseDown: this.handleSlideDragStart,
            onTouchStart: this.handleSlideDragStart
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](TravellerLayer, {
            travellerX: startX,
            id: "startX",
            otherProps: _objectSpread(_objectSpread({}, this.props), {}, {
                y: calculatedY
            }),
            onMouseEnter: this.handleEnterSlideOrTraveller,
            onMouseLeave: this.handleLeaveSlideOrTraveller,
            onMouseDown: this.travellerDragStartHandlers.startX,
            onTouchStart: this.travellerDragStartHandlers.startX,
            onTravellerMoveKeyboard: this.handleTravellerMoveKeyboard,
            onFocus: ()=>{
                this.setState({
                    isTravellerFocused: true
                });
            },
            onBlur: ()=>{
                this.setState({
                    isTravellerFocused: false
                });
            }
        }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](TravellerLayer, {
            travellerX: endX,
            id: "endX",
            otherProps: _objectSpread(_objectSpread({}, this.props), {}, {
                y: calculatedY
            }),
            onMouseEnter: this.handleEnterSlideOrTraveller,
            onMouseLeave: this.handleLeaveSlideOrTraveller,
            onMouseDown: this.travellerDragStartHandlers.endX,
            onTouchStart: this.travellerDragStartHandlers.endX,
            onTravellerMoveKeyboard: this.handleTravellerMoveKeyboard,
            onFocus: ()=>{
                this.setState({
                    isTravellerFocused: true
                });
            },
            onBlur: ()=>{
                this.setState({
                    isTravellerFocused: false
                });
            }
        }), (isTextActive || isSlideMoving || isTravellerMoving || isTravellerFocused || alwaysShowText) && /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](BrushText, {
            startIndex: startIndex,
            endIndex: endIndex,
            y: calculatedY,
            height: height,
            travellerWidth: travellerWidth,
            stroke: stroke,
            tickFormatter: tickFormatter,
            dataKey: dataKey,
            data: data,
            startX: startX,
            endX: endX
        }));
    }
}
function BrushInternal(props) {
    var dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    var chartData = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartDataContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChartData"])();
    var dataIndexes = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartDataContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useDataIndex"])();
    var onChangeFromContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useContext"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$brushUpdateContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["BrushUpdateDispatchContext"]);
    var onChangeFromProps = props.onChange;
    var { startIndex: startIndexFromProps, endIndex: endIndexFromProps } = props;
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // start and end index can be controlled from props, and we need them to stay up-to-date in the Redux state too
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$chartDataSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDataStartEndIndexes"])({
            startIndex: startIndexFromProps,
            endIndex: endIndexFromProps
        }));
    }, [
        dispatch,
        endIndexFromProps,
        startIndexFromProps
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$synchronisation$2f$useChartSynchronisation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useBrushChartSynchronisation"])();
    var onChange = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((nextState)=>{
        if (dataIndexes == null) {
            return;
        }
        var { startIndex, endIndex } = dataIndexes;
        if (nextState.startIndex !== startIndex || nextState.endIndex !== endIndex) {
            onChangeFromContext === null || onChangeFromContext === void 0 || onChangeFromContext(nextState);
            onChangeFromProps === null || onChangeFromProps === void 0 || onChangeFromProps(nextState);
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$chartDataSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setDataStartEndIndexes"])(nextState));
        }
    }, [
        onChangeFromProps,
        onChangeFromContext,
        dispatch,
        dataIndexes
    ]);
    var brushDimensions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])(__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$brushSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectBrushDimensions"]);
    if (brushDimensions == null || dataIndexes == null || chartData == null || !chartData.length) {
        return null;
    }
    var { startIndex, endIndex } = dataIndexes;
    var { x, y, width } = brushDimensions;
    var contextProperties = {
        data: chartData,
        x,
        y,
        width,
        startIndex,
        endIndex,
        onChange
    };
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](BrushWithState, _extends({}, props, contextProperties, {
        startIndexControlledFromProps: startIndexFromProps !== null && startIndexFromProps !== void 0 ? startIndexFromProps : undefined,
        endIndexControlledFromProps: endIndexFromProps !== null && endIndexFromProps !== void 0 ? endIndexFromProps : undefined
    }));
}
function BrushSettingsDispatcher(props) {
    var dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$brushSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setBrushSettings"])(props));
        return ()=>{
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$brushSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["setBrushSettings"])(null));
        };
    }, [
        dispatch,
        props
    ]);
    return null;
}
var defaultBrushProps = {
    height: 40,
    travellerWidth: 5,
    gap: 1,
    fill: '#fff',
    stroke: '#666',
    padding: {
        top: 1,
        right: 1,
        bottom: 1,
        left: 1
    },
    leaveTimeOut: 1000,
    alwaysShowText: false
};
function Brush(outsideProps) {
    var props = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$resolveDefaultProps$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["resolveDefaultProps"])(outsideProps, defaultBrushProps);
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](BrushSettingsDispatcher, {
        height: props.height,
        x: props.x,
        y: props.y,
        width: props.width,
        padding: props.padding
    }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](BrushInternal, props));
}
Brush.displayName = 'Brush';
}),
"[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/cartesian/ReferenceLine.js [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ReferenceLine",
    ()=>ReferenceLine,
    "getEndPoints",
    ()=>getEndPoints
]);
/**
 * @fileOverview Reference Line
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/clsx/dist/clsx.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/container/Layer.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Label$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/component/Label.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/DataUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$CartesianUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/CartesianUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/util/ReactUtils.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/chartLayoutContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$referenceElementsSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/referenceElementsSlice.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/hooks.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/state/selectors/axisSelectors.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/context/PanoramaContext.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$ClipPathProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Documents/backtest-mvp/frontend/node_modules/recharts/es6/container/ClipPathProvider.js [app-ssr] (ecmascript)");
function ownKeys(e, r) {
    var t = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
        var o = Object.getOwnPropertySymbols(e);
        r && (o = o.filter(function(r) {
            return Object.getOwnPropertyDescriptor(e, r).enumerable;
        })), t.push.apply(t, o);
    }
    return t;
}
function _objectSpread(e) {
    for(var r = 1; r < arguments.length; r++){
        var t = null != arguments[r] ? arguments[r] : {};
        r % 2 ? ownKeys(Object(t), !0).forEach(function(r) {
            _defineProperty(e, r, t[r]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r) {
            Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r));
        });
    }
    return e;
}
function _defineProperty(e, r, t) {
    return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, {
        value: t,
        enumerable: !0,
        configurable: !0,
        writable: !0
    }) : e[r] = t, e;
}
function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
}
function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
}
function _extends() {
    return _extends = ("TURBOPACK compile-time truthy", 1) ? Object.assign.bind() : "TURBOPACK unreachable", _extends.apply(null, arguments);
}
;
;
;
;
;
;
;
;
;
;
;
;
;
;
/**
 * This excludes `viewBox` prop from svg for two reasons:
 * 1. The components wants viewBox of object type, and svg wants string
 *    - so there's a conflict, and the component will throw if it gets string
 * 2. Internally the component calls `filterProps` which filters the viewBox away anyway
 */ var renderLine = (option, props)=>{
    var line;
    if (/*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isValidElement"](option)) {
        line = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["cloneElement"](option, props);
    } else if (typeof option === 'function') {
        line = option(props);
    } else {
        line = /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"]("line", _extends({}, props, {
            className: "recharts-reference-line-line"
        }));
    }
    return line;
};
var getEndPoints = (scales, isFixedX, isFixedY, isSegment, viewBox, position, xAxisOrientation, yAxisOrientation, props)=>{
    var { x, y, width, height } = viewBox;
    if (isFixedY) {
        var { y: yCoord } = props;
        var coord = scales.y.apply(yCoord, {
            position
        });
        // don't render the line if the scale can't compute a result that makes sense
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNan"])(coord)) return null;
        if (props.ifOverflow === 'discard' && !scales.y.isInRange(coord)) {
            return null;
        }
        var points = [
            {
                x: x + width,
                y: coord
            },
            {
                x,
                y: coord
            }
        ];
        return yAxisOrientation === 'left' ? points.reverse() : points;
    }
    if (isFixedX) {
        var { x: xCoord } = props;
        var _coord = scales.x.apply(xCoord, {
            position
        });
        // don't render the line if the scale can't compute a result that makes sense
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNan"])(_coord)) return null;
        if (props.ifOverflow === 'discard' && !scales.x.isInRange(_coord)) {
            return null;
        }
        var _points = [
            {
                x: _coord,
                y: y + height
            },
            {
                x: _coord,
                y
            }
        ];
        return xAxisOrientation === 'top' ? _points.reverse() : _points;
    }
    if (isSegment) {
        var { segment } = props;
        var _points2 = segment.map((p)=>scales.apply(p, {
                position
            }));
        if (props.ifOverflow === 'discard' && _points2.some((p)=>!scales.isInRange(p))) {
            return null;
        }
        return _points2;
    }
    return null;
};
function ReportReferenceLine(props) {
    var dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$referenceElementsSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["addLine"])(props));
        return ()=>{
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$referenceElementsSlice$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["removeLine"])(props));
        };
    });
    return null;
}
function ReferenceLineImpl(props) {
    var { x: fixedX, y: fixedY, segment, xAxisId, yAxisId, shape, className, ifOverflow } = props;
    var isPanorama = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$PanoramaContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useIsPanorama"])();
    var clipPathId = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$ClipPathProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useClipPathId"])();
    var xAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectXAxisSettings"])(state, xAxisId));
    var yAxis = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectYAxisSettings"])(state, yAxisId));
    var xAxisScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisScale"])(state, 'xAxis', xAxisId, isPanorama));
    var yAxisScale = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$hooks$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppSelector"])((state)=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$state$2f$selectors$2f$axisSelectors$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["selectAxisScale"])(state, 'yAxis', yAxisId, isPanorama));
    var viewBox = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$context$2f$chartLayoutContext$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useViewBox"])();
    var isFixedX = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumOrStr"])(fixedX);
    var isFixedY = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$DataUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["isNumOrStr"])(fixedY);
    if (!clipPathId || !viewBox || xAxis == null || yAxis == null || xAxisScale == null || yAxisScale == null) {
        return null;
    }
    var scales = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$CartesianUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createLabeledScales"])({
        x: xAxisScale,
        y: yAxisScale
    });
    var isSegment = segment && segment.length === 2;
    var endPoints = getEndPoints(scales, isFixedX, isFixedY, isSegment, viewBox, props.position, xAxis.orientation, yAxis.orientation, props);
    if (!endPoints) {
        return null;
    }
    var [{ x: x1, y: y1 }, { x: x2, y: y2 }] = endPoints;
    var clipPath = ifOverflow === 'hidden' ? "url(#".concat(clipPathId, ")") : undefined;
    var lineProps = _objectSpread(_objectSpread({
        clipPath
    }, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$ReactUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["filterProps"])(props, true)), {}, {
        x1,
        y1,
        x2,
        y2
    });
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$container$2f$Layer$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Layer"], {
        className: (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["clsx"])('recharts-reference-line', className)
    }, renderLine(shape, lineProps), __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$component$2f$Label$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Label"].renderCallByParent(props, (0, __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$recharts$2f$es6$2f$util$2f$CartesianUtils$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["rectWithCoords"])({
        x1,
        y1,
        x2,
        y2
    })));
}
function ReferenceLineSettingsDispatcher(props) {
    return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](__TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], null, /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](ReportReferenceLine, {
        yAxisId: props.yAxisId,
        xAxisId: props.xAxisId,
        ifOverflow: props.ifOverflow,
        x: props.x,
        y: props.y
    }), /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](ReferenceLineImpl, props));
}
class ReferenceLine extends __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Component"] {
    render() {
        return /*#__PURE__*/ __TURBOPACK__imported__module__$5b$project$5d2f$Documents$2f$backtest$2d$mvp$2f$frontend$2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createElement"](ReferenceLineSettingsDispatcher, this.props);
    }
}
_defineProperty(ReferenceLine, "displayName", 'ReferenceLine');
_defineProperty(ReferenceLine, "defaultProps", {
    ifOverflow: 'discard',
    xAxisId: 0,
    yAxisId: 0,
    fill: 'none',
    stroke: '#ccc',
    fillOpacity: 1,
    strokeWidth: 1,
    position: 'middle'
});
}),
];

//# sourceMappingURL=7fa8d_recharts_es6_cartesian_ed279c4e._.js.map