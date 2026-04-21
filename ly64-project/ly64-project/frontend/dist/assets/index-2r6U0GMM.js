var ap = Object.defineProperty;
var op = (e, t, n) =>
  t in e ? ap(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : (e[t] = n);
var $ = (e, t, n) => op(e, typeof t != 'symbol' ? t + '' : t, n);
function lp(e, t) {
  for (var n = 0; n < t.length; n++) {
    const r = t[n];
    if (typeof r != 'string' && !Array.isArray(r)) {
      for (const s in r)
        if (s !== 'default' && !(s in e)) {
          const a = Object.getOwnPropertyDescriptor(r, s);
          a && Object.defineProperty(e, s, a.get ? a : { enumerable: !0, get: () => r[s] });
        }
    }
  }
  return Object.freeze(Object.defineProperty(e, Symbol.toStringTag, { value: 'Module' }));
}
(function () {
  const t = document.createElement('link').relList;
  if (t && t.supports && t.supports('modulepreload')) return;
  for (const s of document.querySelectorAll('link[rel="modulepreload"]')) r(s);
  new MutationObserver(s => {
    for (const a of s)
      if (a.type === 'childList')
        for (const l of a.addedNodes) l.tagName === 'LINK' && l.rel === 'modulepreload' && r(l);
  }).observe(document, { childList: !0, subtree: !0 });
  function n(s) {
    const a = {};
    return (
      s.integrity && (a.integrity = s.integrity),
      s.referrerPolicy && (a.referrerPolicy = s.referrerPolicy),
      s.crossOrigin === 'use-credentials'
        ? (a.credentials = 'include')
        : s.crossOrigin === 'anonymous'
          ? (a.credentials = 'omit')
          : (a.credentials = 'same-origin'),
      a
    );
  }
  function r(s) {
    if (s.ep) return;
    s.ep = !0;
    const a = n(s);
    fetch(s.href, a);
  }
})();
function Uc(e) {
  return e && e.__esModule && Object.prototype.hasOwnProperty.call(e, 'default') ? e.default : e;
}
var Hc = { exports: {} },
  Ea = {},
  Wc = { exports: {} },
  W = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var ts = Symbol.for('react.element'),
  ip = Symbol.for('react.portal'),
  up = Symbol.for('react.fragment'),
  cp = Symbol.for('react.strict_mode'),
  dp = Symbol.for('react.profiler'),
  fp = Symbol.for('react.provider'),
  pp = Symbol.for('react.context'),
  mp = Symbol.for('react.forward_ref'),
  hp = Symbol.for('react.suspense'),
  gp = Symbol.for('react.memo'),
  xp = Symbol.for('react.lazy'),
  Xi = Symbol.iterator;
function yp(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (Xi && e[Xi]) || e['@@iterator']), typeof e == 'function' ? e : null);
}
var Vc = {
    isMounted: function () {
      return !1;
    },
    enqueueForceUpdate: function () {},
    enqueueReplaceState: function () {},
    enqueueSetState: function () {},
  },
  Gc = Object.assign,
  Kc = {};
function or(e, t, n) {
  ((this.props = e), (this.context = t), (this.refs = Kc), (this.updater = n || Vc));
}
or.prototype.isReactComponent = {};
or.prototype.setState = function (e, t) {
  if (typeof e != 'object' && typeof e != 'function' && e != null)
    throw Error(
      'setState(...): takes an object of state variables to update or a function which returns an object of state variables.'
    );
  this.updater.enqueueSetState(this, e, t, 'setState');
};
or.prototype.forceUpdate = function (e) {
  this.updater.enqueueForceUpdate(this, e, 'forceUpdate');
};
function Qc() {}
Qc.prototype = or.prototype;
function Wl(e, t, n) {
  ((this.props = e), (this.context = t), (this.refs = Kc), (this.updater = n || Vc));
}
var Vl = (Wl.prototype = new Qc());
Vl.constructor = Wl;
Gc(Vl, or.prototype);
Vl.isPureReactComponent = !0;
var Zi = Array.isArray,
  qc = Object.prototype.hasOwnProperty,
  Gl = { current: null },
  Yc = { key: !0, ref: !0, __self: !0, __source: !0 };
function Jc(e, t, n) {
  var r,
    s = {},
    a = null,
    l = null;
  if (t != null)
    for (r in (t.ref !== void 0 && (l = t.ref), t.key !== void 0 && (a = '' + t.key), t))
      qc.call(t, r) && !Yc.hasOwnProperty(r) && (s[r] = t[r]);
  var i = arguments.length - 2;
  if (i === 1) s.children = n;
  else if (1 < i) {
    for (var u = Array(i), c = 0; c < i; c++) u[c] = arguments[c + 2];
    s.children = u;
  }
  if (e && e.defaultProps) for (r in ((i = e.defaultProps), i)) s[r] === void 0 && (s[r] = i[r]);
  return { $$typeof: ts, type: e, key: a, ref: l, props: s, _owner: Gl.current };
}
function vp(e, t) {
  return { $$typeof: ts, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function Kl(e) {
  return typeof e == 'object' && e !== null && e.$$typeof === ts;
}
function wp(e) {
  var t = { '=': '=0', ':': '=2' };
  return (
    '$' +
    e.replace(/[=:]/g, function (n) {
      return t[n];
    })
  );
}
var eu = /\/+/g;
function Xa(e, t) {
  return typeof e == 'object' && e !== null && e.key != null ? wp('' + e.key) : t.toString(36);
}
function Os(e, t, n, r, s) {
  var a = typeof e;
  (a === 'undefined' || a === 'boolean') && (e = null);
  var l = !1;
  if (e === null) l = !0;
  else
    switch (a) {
      case 'string':
      case 'number':
        l = !0;
        break;
      case 'object':
        switch (e.$$typeof) {
          case ts:
          case ip:
            l = !0;
        }
    }
  if (l)
    return (
      (l = e),
      (s = s(l)),
      (e = r === '' ? '.' + Xa(l, 0) : r),
      Zi(s)
        ? ((n = ''),
          e != null && (n = e.replace(eu, '$&/') + '/'),
          Os(s, t, n, '', function (c) {
            return c;
          }))
        : s != null &&
          (Kl(s) &&
            (s = vp(
              s,
              n +
                (!s.key || (l && l.key === s.key) ? '' : ('' + s.key).replace(eu, '$&/') + '/') +
                e
            )),
          t.push(s)),
      1
    );
  if (((l = 0), (r = r === '' ? '.' : r + ':'), Zi(e)))
    for (var i = 0; i < e.length; i++) {
      a = e[i];
      var u = r + Xa(a, i);
      l += Os(a, t, n, u, s);
    }
  else if (((u = yp(e)), typeof u == 'function'))
    for (e = u.call(e), i = 0; !(a = e.next()).done; )
      ((a = a.value), (u = r + Xa(a, i++)), (l += Os(a, t, n, u, s)));
  else if (a === 'object')
    throw (
      (t = String(e)),
      Error(
        'Objects are not valid as a React child (found: ' +
          (t === '[object Object]' ? 'object with keys {' + Object.keys(e).join(', ') + '}' : t) +
          '). If you meant to render a collection of children, use an array instead.'
      )
    );
  return l;
}
function ms(e, t, n) {
  if (e == null) return e;
  var r = [],
    s = 0;
  return (
    Os(e, r, '', '', function (a) {
      return t.call(n, a, s++);
    }),
    r
  );
}
function bp(e) {
  if (e._status === -1) {
    var t = e._result;
    ((t = t()),
      t.then(
        function (n) {
          (e._status === 0 || e._status === -1) && ((e._status = 1), (e._result = n));
        },
        function (n) {
          (e._status === 0 || e._status === -1) && ((e._status = 2), (e._result = n));
        }
      ),
      e._status === -1 && ((e._status = 0), (e._result = t)));
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var Le = { current: null },
  Ms = { transition: null },
  jp = { ReactCurrentDispatcher: Le, ReactCurrentBatchConfig: Ms, ReactCurrentOwner: Gl };
function Xc() {
  throw Error('act(...) is not supported in production builds of React.');
}
W.Children = {
  map: ms,
  forEach: function (e, t, n) {
    ms(
      e,
      function () {
        t.apply(this, arguments);
      },
      n
    );
  },
  count: function (e) {
    var t = 0;
    return (
      ms(e, function () {
        t++;
      }),
      t
    );
  },
  toArray: function (e) {
    return (
      ms(e, function (t) {
        return t;
      }) || []
    );
  },
  only: function (e) {
    if (!Kl(e))
      throw Error('React.Children.only expected to receive a single React element child.');
    return e;
  },
};
W.Component = or;
W.Fragment = up;
W.Profiler = dp;
W.PureComponent = Wl;
W.StrictMode = cp;
W.Suspense = hp;
W.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = jp;
W.act = Xc;
W.cloneElement = function (e, t, n) {
  if (e == null)
    throw Error(
      'React.cloneElement(...): The argument must be a React element, but you passed ' + e + '.'
    );
  var r = Gc({}, e.props),
    s = e.key,
    a = e.ref,
    l = e._owner;
  if (t != null) {
    if (
      (t.ref !== void 0 && ((a = t.ref), (l = Gl.current)),
      t.key !== void 0 && (s = '' + t.key),
      e.type && e.type.defaultProps)
    )
      var i = e.type.defaultProps;
    for (u in t)
      qc.call(t, u) &&
        !Yc.hasOwnProperty(u) &&
        (r[u] = t[u] === void 0 && i !== void 0 ? i[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    i = Array(u);
    for (var c = 0; c < u; c++) i[c] = arguments[c + 2];
    r.children = i;
  }
  return { $$typeof: ts, type: e.type, key: s, ref: a, props: r, _owner: l };
};
W.createContext = function (e) {
  return (
    (e = {
      $$typeof: pp,
      _currentValue: e,
      _currentValue2: e,
      _threadCount: 0,
      Provider: null,
      Consumer: null,
      _defaultValue: null,
      _globalName: null,
    }),
    (e.Provider = { $$typeof: fp, _context: e }),
    (e.Consumer = e)
  );
};
W.createElement = Jc;
W.createFactory = function (e) {
  var t = Jc.bind(null, e);
  return ((t.type = e), t);
};
W.createRef = function () {
  return { current: null };
};
W.forwardRef = function (e) {
  return { $$typeof: mp, render: e };
};
W.isValidElement = Kl;
W.lazy = function (e) {
  return { $$typeof: xp, _payload: { _status: -1, _result: e }, _init: bp };
};
W.memo = function (e, t) {
  return { $$typeof: gp, type: e, compare: t === void 0 ? null : t };
};
W.startTransition = function (e) {
  var t = Ms.transition;
  Ms.transition = {};
  try {
    e();
  } finally {
    Ms.transition = t;
  }
};
W.unstable_act = Xc;
W.useCallback = function (e, t) {
  return Le.current.useCallback(e, t);
};
W.useContext = function (e) {
  return Le.current.useContext(e);
};
W.useDebugValue = function () {};
W.useDeferredValue = function (e) {
  return Le.current.useDeferredValue(e);
};
W.useEffect = function (e, t) {
  return Le.current.useEffect(e, t);
};
W.useId = function () {
  return Le.current.useId();
};
W.useImperativeHandle = function (e, t, n) {
  return Le.current.useImperativeHandle(e, t, n);
};
W.useInsertionEffect = function (e, t) {
  return Le.current.useInsertionEffect(e, t);
};
W.useLayoutEffect = function (e, t) {
  return Le.current.useLayoutEffect(e, t);
};
W.useMemo = function (e, t) {
  return Le.current.useMemo(e, t);
};
W.useReducer = function (e, t, n) {
  return Le.current.useReducer(e, t, n);
};
W.useRef = function (e) {
  return Le.current.useRef(e);
};
W.useState = function (e) {
  return Le.current.useState(e);
};
W.useSyncExternalStore = function (e, t, n) {
  return Le.current.useSyncExternalStore(e, t, n);
};
W.useTransition = function () {
  return Le.current.useTransition();
};
W.version = '18.3.1';
Wc.exports = W;
var y = Wc.exports;
const Ql = Uc(y),
  Np = lp({ __proto__: null, default: Ql }, [y]);
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Sp = y,
  kp = Symbol.for('react.element'),
  Ep = Symbol.for('react.fragment'),
  Cp = Object.prototype.hasOwnProperty,
  Tp = Sp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,
  _p = { key: !0, ref: !0, __self: !0, __source: !0 };
function Zc(e, t, n) {
  var r,
    s = {},
    a = null,
    l = null;
  (n !== void 0 && (a = '' + n),
    t.key !== void 0 && (a = '' + t.key),
    t.ref !== void 0 && (l = t.ref));
  for (r in t) Cp.call(t, r) && !_p.hasOwnProperty(r) && (s[r] = t[r]);
  if (e && e.defaultProps) for (r in ((t = e.defaultProps), t)) s[r] === void 0 && (s[r] = t[r]);
  return { $$typeof: kp, type: e, key: a, ref: l, props: s, _owner: Tp.current };
}
Ea.Fragment = Ep;
Ea.jsx = Zc;
Ea.jsxs = Zc;
Hc.exports = Ea;
var o = Hc.exports,
  Ro = {},
  ed = { exports: {} },
  Ge = {},
  td = { exports: {} },
  nd = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ (function (e) {
  function t(C, M) {
    var O = C.length;
    C.push(M);
    e: for (; 0 < O; ) {
      var T = (O - 1) >>> 1,
        I = C[T];
      if (0 < s(I, M)) ((C[T] = M), (C[O] = I), (O = T));
      else break e;
    }
  }
  function n(C) {
    return C.length === 0 ? null : C[0];
  }
  function r(C) {
    if (C.length === 0) return null;
    var M = C[0],
      O = C.pop();
    if (O !== M) {
      C[0] = O;
      e: for (var T = 0, I = C.length, U = I >>> 1; T < U; ) {
        var Z = 2 * (T + 1) - 1,
          Re = C[Z],
          nn = Z + 1,
          ps = C[nn];
        if (0 > s(Re, O))
          nn < I && 0 > s(ps, Re)
            ? ((C[T] = ps), (C[nn] = O), (T = nn))
            : ((C[T] = Re), (C[Z] = O), (T = Z));
        else if (nn < I && 0 > s(ps, O)) ((C[T] = ps), (C[nn] = O), (T = nn));
        else break e;
      }
    }
    return M;
  }
  function s(C, M) {
    var O = C.sortIndex - M.sortIndex;
    return O !== 0 ? O : C.id - M.id;
  }
  if (typeof performance == 'object' && typeof performance.now == 'function') {
    var a = performance;
    e.unstable_now = function () {
      return a.now();
    };
  } else {
    var l = Date,
      i = l.now();
    e.unstable_now = function () {
      return l.now() - i;
    };
  }
  var u = [],
    c = [],
    d = 1,
    f = null,
    m = 3,
    b = !1,
    x = !1,
    w = !1,
    v = typeof setTimeout == 'function' ? setTimeout : null,
    h = typeof clearTimeout == 'function' ? clearTimeout : null,
    p = typeof setImmediate < 'u' ? setImmediate : null;
  typeof navigator < 'u' &&
    navigator.scheduling !== void 0 &&
    navigator.scheduling.isInputPending !== void 0 &&
    navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function g(C) {
    for (var M = n(c); M !== null; ) {
      if (M.callback === null) r(c);
      else if (M.startTime <= C) (r(c), (M.sortIndex = M.expirationTime), t(u, M));
      else break;
      M = n(c);
    }
  }
  function j(C) {
    if (((w = !1), g(C), !x))
      if (n(u) !== null) ((x = !0), ue(k));
      else {
        var M = n(c);
        M !== null && D(j, M.startTime - C);
      }
  }
  function k(C, M) {
    ((x = !1), w && ((w = !1), h(S), (S = -1)), (b = !0));
    var O = m;
    try {
      for (g(M), f = n(u); f !== null && (!(f.expirationTime > M) || (C && !z())); ) {
        var T = f.callback;
        if (typeof T == 'function') {
          ((f.callback = null), (m = f.priorityLevel));
          var I = T(f.expirationTime <= M);
          ((M = e.unstable_now()),
            typeof I == 'function' ? (f.callback = I) : f === n(u) && r(u),
            g(M));
        } else r(u);
        f = n(u);
      }
      if (f !== null) var U = !0;
      else {
        var Z = n(c);
        (Z !== null && D(j, Z.startTime - M), (U = !1));
      }
      return U;
    } finally {
      ((f = null), (m = O), (b = !1));
    }
  }
  var A = !1,
    _ = null,
    S = -1,
    P = 5,
    R = -1;
  function z() {
    return !(e.unstable_now() - R < P);
  }
  function K() {
    if (_ !== null) {
      var C = e.unstable_now();
      R = C;
      var M = !0;
      try {
        M = _(!0, C);
      } finally {
        M ? F() : ((A = !1), (_ = null));
      }
    } else A = !1;
  }
  var F;
  if (typeof p == 'function')
    F = function () {
      p(K);
    };
  else if (typeof MessageChannel < 'u') {
    var Q = new MessageChannel(),
      Fe = Q.port2;
    ((Q.port1.onmessage = K),
      (F = function () {
        Fe.postMessage(null);
      }));
  } else
    F = function () {
      v(K, 0);
    };
  function ue(C) {
    ((_ = C), A || ((A = !0), F()));
  }
  function D(C, M) {
    S = v(function () {
      C(e.unstable_now());
    }, M);
  }
  ((e.unstable_IdlePriority = 5),
    (e.unstable_ImmediatePriority = 1),
    (e.unstable_LowPriority = 4),
    (e.unstable_NormalPriority = 3),
    (e.unstable_Profiling = null),
    (e.unstable_UserBlockingPriority = 2),
    (e.unstable_cancelCallback = function (C) {
      C.callback = null;
    }),
    (e.unstable_continueExecution = function () {
      x || b || ((x = !0), ue(k));
    }),
    (e.unstable_forceFrameRate = function (C) {
      0 > C || 125 < C
        ? console.error(
            'forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported'
          )
        : (P = 0 < C ? Math.floor(1e3 / C) : 5);
    }),
    (e.unstable_getCurrentPriorityLevel = function () {
      return m;
    }),
    (e.unstable_getFirstCallbackNode = function () {
      return n(u);
    }),
    (e.unstable_next = function (C) {
      switch (m) {
        case 1:
        case 2:
        case 3:
          var M = 3;
          break;
        default:
          M = m;
      }
      var O = m;
      m = M;
      try {
        return C();
      } finally {
        m = O;
      }
    }),
    (e.unstable_pauseExecution = function () {}),
    (e.unstable_requestPaint = function () {}),
    (e.unstable_runWithPriority = function (C, M) {
      switch (C) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
          break;
        default:
          C = 3;
      }
      var O = m;
      m = C;
      try {
        return M();
      } finally {
        m = O;
      }
    }),
    (e.unstable_scheduleCallback = function (C, M, O) {
      var T = e.unstable_now();
      switch (
        (typeof O == 'object' && O !== null
          ? ((O = O.delay), (O = typeof O == 'number' && 0 < O ? T + O : T))
          : (O = T),
        C)
      ) {
        case 1:
          var I = -1;
          break;
        case 2:
          I = 250;
          break;
        case 5:
          I = 1073741823;
          break;
        case 4:
          I = 1e4;
          break;
        default:
          I = 5e3;
      }
      return (
        (I = O + I),
        (C = {
          id: d++,
          callback: M,
          priorityLevel: C,
          startTime: O,
          expirationTime: I,
          sortIndex: -1,
        }),
        O > T
          ? ((C.sortIndex = O),
            t(c, C),
            n(u) === null && C === n(c) && (w ? (h(S), (S = -1)) : (w = !0), D(j, O - T)))
          : ((C.sortIndex = I), t(u, C), x || b || ((x = !0), ue(k))),
        C
      );
    }),
    (e.unstable_shouldYield = z),
    (e.unstable_wrapCallback = function (C) {
      var M = m;
      return function () {
        var O = m;
        m = M;
        try {
          return C.apply(this, arguments);
        } finally {
          m = O;
        }
      };
    }));
})(nd);
td.exports = nd;
var Ap = td.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Lp = y,
  Ve = Ap;
function E(e) {
  for (
    var t = 'https://reactjs.org/docs/error-decoder.html?invariant=' + e, n = 1;
    n < arguments.length;
    n++
  )
    t += '&args[]=' + encodeURIComponent(arguments[n]);
  return (
    'Minified React error #' +
    e +
    '; visit ' +
    t +
    ' for the full message or use the non-minified dev environment for full errors and additional helpful warnings.'
  );
}
var rd = new Set(),
  Or = {};
function Sn(e, t) {
  (Yn(e, t), Yn(e + 'Capture', t));
}
function Yn(e, t) {
  for (Or[e] = t, e = 0; e < t.length; e++) rd.add(t[e]);
}
var Nt = !(
    typeof window > 'u' ||
    typeof window.document > 'u' ||
    typeof window.document.createElement > 'u'
  ),
  Io = Object.prototype.hasOwnProperty,
  Pp =
    /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,
  tu = {},
  nu = {};
function Rp(e) {
  return Io.call(nu, e) ? !0 : Io.call(tu, e) ? !1 : Pp.test(e) ? (nu[e] = !0) : ((tu[e] = !0), !1);
}
function Ip(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case 'function':
    case 'symbol':
      return !0;
    case 'boolean':
      return r
        ? !1
        : n !== null
          ? !n.acceptsBooleans
          : ((e = e.toLowerCase().slice(0, 5)), e !== 'data-' && e !== 'aria-');
    default:
      return !1;
  }
}
function Op(e, t, n, r) {
  if (t === null || typeof t > 'u' || Ip(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null)
    switch (n.type) {
      case 3:
        return !t;
      case 4:
        return t === !1;
      case 5:
        return isNaN(t);
      case 6:
        return isNaN(t) || 1 > t;
    }
  return !1;
}
function Pe(e, t, n, r, s, a, l) {
  ((this.acceptsBooleans = t === 2 || t === 3 || t === 4),
    (this.attributeName = r),
    (this.attributeNamespace = s),
    (this.mustUseProperty = n),
    (this.propertyName = e),
    (this.type = t),
    (this.sanitizeURL = a),
    (this.removeEmptyString = l));
}
var we = {};
'children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style'
  .split(' ')
  .forEach(function (e) {
    we[e] = new Pe(e, 0, !1, e, null, !1, !1);
  });
[
  ['acceptCharset', 'accept-charset'],
  ['className', 'class'],
  ['htmlFor', 'for'],
  ['httpEquiv', 'http-equiv'],
].forEach(function (e) {
  var t = e[0];
  we[t] = new Pe(t, 1, !1, e[1], null, !1, !1);
});
['contentEditable', 'draggable', 'spellCheck', 'value'].forEach(function (e) {
  we[e] = new Pe(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
['autoReverse', 'externalResourcesRequired', 'focusable', 'preserveAlpha'].forEach(function (e) {
  we[e] = new Pe(e, 2, !1, e, null, !1, !1);
});
'allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope'
  .split(' ')
  .forEach(function (e) {
    we[e] = new Pe(e, 3, !1, e.toLowerCase(), null, !1, !1);
  });
['checked', 'multiple', 'muted', 'selected'].forEach(function (e) {
  we[e] = new Pe(e, 3, !0, e, null, !1, !1);
});
['capture', 'download'].forEach(function (e) {
  we[e] = new Pe(e, 4, !1, e, null, !1, !1);
});
['cols', 'rows', 'size', 'span'].forEach(function (e) {
  we[e] = new Pe(e, 6, !1, e, null, !1, !1);
});
['rowSpan', 'start'].forEach(function (e) {
  we[e] = new Pe(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var ql = /[\-:]([a-z])/g;
function Yl(e) {
  return e[1].toUpperCase();
}
'accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height'
  .split(' ')
  .forEach(function (e) {
    var t = e.replace(ql, Yl);
    we[t] = new Pe(t, 1, !1, e, null, !1, !1);
  });
'xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type'
  .split(' ')
  .forEach(function (e) {
    var t = e.replace(ql, Yl);
    we[t] = new Pe(t, 1, !1, e, 'http://www.w3.org/1999/xlink', !1, !1);
  });
['xml:base', 'xml:lang', 'xml:space'].forEach(function (e) {
  var t = e.replace(ql, Yl);
  we[t] = new Pe(t, 1, !1, e, 'http://www.w3.org/XML/1998/namespace', !1, !1);
});
['tabIndex', 'crossOrigin'].forEach(function (e) {
  we[e] = new Pe(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
we.xlinkHref = new Pe('xlinkHref', 1, !1, 'xlink:href', 'http://www.w3.org/1999/xlink', !0, !1);
['src', 'href', 'action', 'formAction'].forEach(function (e) {
  we[e] = new Pe(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function Jl(e, t, n, r) {
  var s = we.hasOwnProperty(t) ? we[t] : null;
  (s !== null
    ? s.type !== 0
    : r || !(2 < t.length) || (t[0] !== 'o' && t[0] !== 'O') || (t[1] !== 'n' && t[1] !== 'N')) &&
    (Op(t, n, s, r) && (n = null),
    r || s === null
      ? Rp(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, '' + n))
      : s.mustUseProperty
        ? (e[s.propertyName] = n === null ? (s.type === 3 ? !1 : '') : n)
        : ((t = s.attributeName),
          (r = s.attributeNamespace),
          n === null
            ? e.removeAttribute(t)
            : ((s = s.type),
              (n = s === 3 || (s === 4 && n === !0) ? '' : '' + n),
              r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var Tt = Lp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
  hs = Symbol.for('react.element'),
  An = Symbol.for('react.portal'),
  Ln = Symbol.for('react.fragment'),
  Xl = Symbol.for('react.strict_mode'),
  Oo = Symbol.for('react.profiler'),
  sd = Symbol.for('react.provider'),
  ad = Symbol.for('react.context'),
  Zl = Symbol.for('react.forward_ref'),
  Mo = Symbol.for('react.suspense'),
  Do = Symbol.for('react.suspense_list'),
  ei = Symbol.for('react.memo'),
  Lt = Symbol.for('react.lazy'),
  od = Symbol.for('react.offscreen'),
  ru = Symbol.iterator;
function fr(e) {
  return e === null || typeof e != 'object'
    ? null
    : ((e = (ru && e[ru]) || e['@@iterator']), typeof e == 'function' ? e : null);
}
var re = Object.assign,
  Za;
function jr(e) {
  if (Za === void 0)
    try {
      throw Error();
    } catch (n) {
      var t = n.stack.trim().match(/\n( *(at )?)/);
      Za = (t && t[1]) || '';
    }
  return (
    `
` +
    Za +
    e
  );
}
var eo = !1;
function to(e, t) {
  if (!e || eo) return '';
  eo = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t)
      if (
        ((t = function () {
          throw Error();
        }),
        Object.defineProperty(t.prototype, 'props', {
          set: function () {
            throw Error();
          },
        }),
        typeof Reflect == 'object' && Reflect.construct)
      ) {
        try {
          Reflect.construct(t, []);
        } catch (c) {
          var r = c;
        }
        Reflect.construct(e, [], t);
      } else {
        try {
          t.call();
        } catch (c) {
          r = c;
        }
        e.call(t.prototype);
      }
    else {
      try {
        throw Error();
      } catch (c) {
        r = c;
      }
      e();
    }
  } catch (c) {
    if (c && r && typeof c.stack == 'string') {
      for (
        var s = c.stack.split(`
`),
          a = r.stack.split(`
`),
          l = s.length - 1,
          i = a.length - 1;
        1 <= l && 0 <= i && s[l] !== a[i];
      )
        i--;
      for (; 1 <= l && 0 <= i; l--, i--)
        if (s[l] !== a[i]) {
          if (l !== 1 || i !== 1)
            do
              if ((l--, i--, 0 > i || s[l] !== a[i])) {
                var u =
                  `
` + s[l].replace(' at new ', ' at ');
                return (
                  e.displayName &&
                    u.includes('<anonymous>') &&
                    (u = u.replace('<anonymous>', e.displayName)),
                  u
                );
              }
            while (1 <= l && 0 <= i);
          break;
        }
    }
  } finally {
    ((eo = !1), (Error.prepareStackTrace = n));
  }
  return (e = e ? e.displayName || e.name : '') ? jr(e) : '';
}
function Mp(e) {
  switch (e.tag) {
    case 5:
      return jr(e.type);
    case 16:
      return jr('Lazy');
    case 13:
      return jr('Suspense');
    case 19:
      return jr('SuspenseList');
    case 0:
    case 2:
    case 15:
      return ((e = to(e.type, !1)), e);
    case 11:
      return ((e = to(e.type.render, !1)), e);
    case 1:
      return ((e = to(e.type, !0)), e);
    default:
      return '';
  }
}
function zo(e) {
  if (e == null) return null;
  if (typeof e == 'function') return e.displayName || e.name || null;
  if (typeof e == 'string') return e;
  switch (e) {
    case Ln:
      return 'Fragment';
    case An:
      return 'Portal';
    case Oo:
      return 'Profiler';
    case Xl:
      return 'StrictMode';
    case Mo:
      return 'Suspense';
    case Do:
      return 'SuspenseList';
  }
  if (typeof e == 'object')
    switch (e.$$typeof) {
      case ad:
        return (e.displayName || 'Context') + '.Consumer';
      case sd:
        return (e._context.displayName || 'Context') + '.Provider';
      case Zl:
        var t = e.render;
        return (
          (e = e.displayName),
          e ||
            ((e = t.displayName || t.name || ''),
            (e = e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')),
          e
        );
      case ei:
        return ((t = e.displayName || null), t !== null ? t : zo(e.type) || 'Memo');
      case Lt:
        ((t = e._payload), (e = e._init));
        try {
          return zo(e(t));
        } catch {}
    }
  return null;
}
function Dp(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return 'Cache';
    case 9:
      return (t.displayName || 'Context') + '.Consumer';
    case 10:
      return (t._context.displayName || 'Context') + '.Provider';
    case 18:
      return 'DehydratedFragment';
    case 11:
      return (
        (e = t.render),
        (e = e.displayName || e.name || ''),
        t.displayName || (e !== '' ? 'ForwardRef(' + e + ')' : 'ForwardRef')
      );
    case 7:
      return 'Fragment';
    case 5:
      return t;
    case 4:
      return 'Portal';
    case 3:
      return 'Root';
    case 6:
      return 'Text';
    case 16:
      return zo(t);
    case 8:
      return t === Xl ? 'StrictMode' : 'Mode';
    case 22:
      return 'Offscreen';
    case 12:
      return 'Profiler';
    case 21:
      return 'Scope';
    case 13:
      return 'Suspense';
    case 19:
      return 'SuspenseList';
    case 25:
      return 'TracingMarker';
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == 'function') return t.displayName || t.name || null;
      if (typeof t == 'string') return t;
  }
  return null;
}
function Qt(e) {
  switch (typeof e) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'undefined':
      return e;
    case 'object':
      return e;
    default:
      return '';
  }
}
function ld(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === 'input' && (t === 'checkbox' || t === 'radio');
}
function zp(e) {
  var t = ld(e) ? 'checked' : 'value',
    n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t),
    r = '' + e[t];
  if (
    !e.hasOwnProperty(t) &&
    typeof n < 'u' &&
    typeof n.get == 'function' &&
    typeof n.set == 'function'
  ) {
    var s = n.get,
      a = n.set;
    return (
      Object.defineProperty(e, t, {
        configurable: !0,
        get: function () {
          return s.call(this);
        },
        set: function (l) {
          ((r = '' + l), a.call(this, l));
        },
      }),
      Object.defineProperty(e, t, { enumerable: n.enumerable }),
      {
        getValue: function () {
          return r;
        },
        setValue: function (l) {
          r = '' + l;
        },
        stopTracking: function () {
          ((e._valueTracker = null), delete e[t]);
        },
      }
    );
  }
}
function gs(e) {
  e._valueTracker || (e._valueTracker = zp(e));
}
function id(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(),
    r = '';
  return (
    e && (r = ld(e) ? (e.checked ? 'true' : 'false') : e.value),
    (e = r),
    e !== n ? (t.setValue(e), !0) : !1
  );
}
function Xs(e) {
  if (((e = e || (typeof document < 'u' ? document : void 0)), typeof e > 'u')) return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function $o(e, t) {
  var n = t.checked;
  return re({}, t, {
    defaultChecked: void 0,
    defaultValue: void 0,
    value: void 0,
    checked: n ?? e._wrapperState.initialChecked,
  });
}
function su(e, t) {
  var n = t.defaultValue == null ? '' : t.defaultValue,
    r = t.checked != null ? t.checked : t.defaultChecked;
  ((n = Qt(t.value != null ? t.value : n)),
    (e._wrapperState = {
      initialChecked: r,
      initialValue: n,
      controlled: t.type === 'checkbox' || t.type === 'radio' ? t.checked != null : t.value != null,
    }));
}
function ud(e, t) {
  ((t = t.checked), t != null && Jl(e, 'checked', t, !1));
}
function Bo(e, t) {
  ud(e, t);
  var n = Qt(t.value),
    r = t.type;
  if (n != null)
    r === 'number'
      ? ((n === 0 && e.value === '') || e.value != n) && (e.value = '' + n)
      : e.value !== '' + n && (e.value = '' + n);
  else if (r === 'submit' || r === 'reset') {
    e.removeAttribute('value');
    return;
  }
  (t.hasOwnProperty('value')
    ? Fo(e, t.type, n)
    : t.hasOwnProperty('defaultValue') && Fo(e, t.type, Qt(t.defaultValue)),
    t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked));
}
function au(e, t, n) {
  if (t.hasOwnProperty('value') || t.hasOwnProperty('defaultValue')) {
    var r = t.type;
    if (!((r !== 'submit' && r !== 'reset') || (t.value !== void 0 && t.value !== null))) return;
    ((t = '' + e._wrapperState.initialValue),
      n || t === e.value || (e.value = t),
      (e.defaultValue = t));
  }
  ((n = e.name),
    n !== '' && (e.name = ''),
    (e.defaultChecked = !!e._wrapperState.initialChecked),
    n !== '' && (e.name = n));
}
function Fo(e, t, n) {
  (t !== 'number' || Xs(e.ownerDocument) !== e) &&
    (n == null
      ? (e.defaultValue = '' + e._wrapperState.initialValue)
      : e.defaultValue !== '' + n && (e.defaultValue = '' + n));
}
var Nr = Array.isArray;
function Wn(e, t, n, r) {
  if (((e = e.options), t)) {
    t = {};
    for (var s = 0; s < n.length; s++) t['$' + n[s]] = !0;
    for (n = 0; n < e.length; n++)
      ((s = t.hasOwnProperty('$' + e[n].value)),
        e[n].selected !== s && (e[n].selected = s),
        s && r && (e[n].defaultSelected = !0));
  } else {
    for (n = '' + Qt(n), t = null, s = 0; s < e.length; s++) {
      if (e[s].value === n) {
        ((e[s].selected = !0), r && (e[s].defaultSelected = !0));
        return;
      }
      t !== null || e[s].disabled || (t = e[s]);
    }
    t !== null && (t.selected = !0);
  }
}
function Uo(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(E(91));
  return re({}, t, {
    value: void 0,
    defaultValue: void 0,
    children: '' + e._wrapperState.initialValue,
  });
}
function ou(e, t) {
  var n = t.value;
  if (n == null) {
    if (((n = t.children), (t = t.defaultValue), n != null)) {
      if (t != null) throw Error(E(92));
      if (Nr(n)) {
        if (1 < n.length) throw Error(E(93));
        n = n[0];
      }
      t = n;
    }
    (t == null && (t = ''), (n = t));
  }
  e._wrapperState = { initialValue: Qt(n) };
}
function cd(e, t) {
  var n = Qt(t.value),
    r = Qt(t.defaultValue);
  (n != null &&
    ((n = '' + n),
    n !== e.value && (e.value = n),
    t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)),
    r != null && (e.defaultValue = '' + r));
}
function lu(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== '' && t !== null && (e.value = t);
}
function dd(e) {
  switch (e) {
    case 'svg':
      return 'http://www.w3.org/2000/svg';
    case 'math':
      return 'http://www.w3.org/1998/Math/MathML';
    default:
      return 'http://www.w3.org/1999/xhtml';
  }
}
function Ho(e, t) {
  return e == null || e === 'http://www.w3.org/1999/xhtml'
    ? dd(t)
    : e === 'http://www.w3.org/2000/svg' && t === 'foreignObject'
      ? 'http://www.w3.org/1999/xhtml'
      : e;
}
var xs,
  fd = (function (e) {
    return typeof MSApp < 'u' && MSApp.execUnsafeLocalFunction
      ? function (t, n, r, s) {
          MSApp.execUnsafeLocalFunction(function () {
            return e(t, n, r, s);
          });
        }
      : e;
  })(function (e, t) {
    if (e.namespaceURI !== 'http://www.w3.org/2000/svg' || 'innerHTML' in e) e.innerHTML = t;
    else {
      for (
        xs = xs || document.createElement('div'),
          xs.innerHTML = '<svg>' + t.valueOf().toString() + '</svg>',
          t = xs.firstChild;
        e.firstChild;
      )
        e.removeChild(e.firstChild);
      for (; t.firstChild; ) e.appendChild(t.firstChild);
    }
  });
function Mr(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var Er = {
    animationIterationCount: !0,
    aspectRatio: !0,
    borderImageOutset: !0,
    borderImageSlice: !0,
    borderImageWidth: !0,
    boxFlex: !0,
    boxFlexGroup: !0,
    boxOrdinalGroup: !0,
    columnCount: !0,
    columns: !0,
    flex: !0,
    flexGrow: !0,
    flexPositive: !0,
    flexShrink: !0,
    flexNegative: !0,
    flexOrder: !0,
    gridArea: !0,
    gridRow: !0,
    gridRowEnd: !0,
    gridRowSpan: !0,
    gridRowStart: !0,
    gridColumn: !0,
    gridColumnEnd: !0,
    gridColumnSpan: !0,
    gridColumnStart: !0,
    fontWeight: !0,
    lineClamp: !0,
    lineHeight: !0,
    opacity: !0,
    order: !0,
    orphans: !0,
    tabSize: !0,
    widows: !0,
    zIndex: !0,
    zoom: !0,
    fillOpacity: !0,
    floodOpacity: !0,
    stopOpacity: !0,
    strokeDasharray: !0,
    strokeDashoffset: !0,
    strokeMiterlimit: !0,
    strokeOpacity: !0,
    strokeWidth: !0,
  },
  $p = ['Webkit', 'ms', 'Moz', 'O'];
Object.keys(Er).forEach(function (e) {
  $p.forEach(function (t) {
    ((t = t + e.charAt(0).toUpperCase() + e.substring(1)), (Er[t] = Er[e]));
  });
});
function pd(e, t, n) {
  return t == null || typeof t == 'boolean' || t === ''
    ? ''
    : n || typeof t != 'number' || t === 0 || (Er.hasOwnProperty(e) && Er[e])
      ? ('' + t).trim()
      : t + 'px';
}
function md(e, t) {
  e = e.style;
  for (var n in t)
    if (t.hasOwnProperty(n)) {
      var r = n.indexOf('--') === 0,
        s = pd(n, t[n], r);
      (n === 'float' && (n = 'cssFloat'), r ? e.setProperty(n, s) : (e[n] = s));
    }
}
var Bp = re(
  { menuitem: !0 },
  {
    area: !0,
    base: !0,
    br: !0,
    col: !0,
    embed: !0,
    hr: !0,
    img: !0,
    input: !0,
    keygen: !0,
    link: !0,
    meta: !0,
    param: !0,
    source: !0,
    track: !0,
    wbr: !0,
  }
);
function Wo(e, t) {
  if (t) {
    if (Bp[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(E(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(E(60));
      if (typeof t.dangerouslySetInnerHTML != 'object' || !('__html' in t.dangerouslySetInnerHTML))
        throw Error(E(61));
    }
    if (t.style != null && typeof t.style != 'object') throw Error(E(62));
  }
}
function Vo(e, t) {
  if (e.indexOf('-') === -1) return typeof t.is == 'string';
  switch (e) {
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return !1;
    default:
      return !0;
  }
}
var Go = null;
function ti(e) {
  return (
    (e = e.target || e.srcElement || window),
    e.correspondingUseElement && (e = e.correspondingUseElement),
    e.nodeType === 3 ? e.parentNode : e
  );
}
var Ko = null,
  Vn = null,
  Gn = null;
function iu(e) {
  if ((e = ss(e))) {
    if (typeof Ko != 'function') throw Error(E(280));
    var t = e.stateNode;
    t && ((t = La(t)), Ko(e.stateNode, e.type, t));
  }
}
function hd(e) {
  Vn ? (Gn ? Gn.push(e) : (Gn = [e])) : (Vn = e);
}
function gd() {
  if (Vn) {
    var e = Vn,
      t = Gn;
    if (((Gn = Vn = null), iu(e), t)) for (e = 0; e < t.length; e++) iu(t[e]);
  }
}
function xd(e, t) {
  return e(t);
}
function yd() {}
var no = !1;
function vd(e, t, n) {
  if (no) return e(t, n);
  no = !0;
  try {
    return xd(e, t, n);
  } finally {
    ((no = !1), (Vn !== null || Gn !== null) && (yd(), gd()));
  }
}
function Dr(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = La(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case 'onClick':
    case 'onClickCapture':
    case 'onDoubleClick':
    case 'onDoubleClickCapture':
    case 'onMouseDown':
    case 'onMouseDownCapture':
    case 'onMouseMove':
    case 'onMouseMoveCapture':
    case 'onMouseUp':
    case 'onMouseUpCapture':
    case 'onMouseEnter':
      ((r = !r.disabled) ||
        ((e = e.type),
        (r = !(e === 'button' || e === 'input' || e === 'select' || e === 'textarea'))),
        (e = !r));
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != 'function') throw Error(E(231, t, typeof n));
  return n;
}
var Qo = !1;
if (Nt)
  try {
    var pr = {};
    (Object.defineProperty(pr, 'passive', {
      get: function () {
        Qo = !0;
      },
    }),
      window.addEventListener('test', pr, pr),
      window.removeEventListener('test', pr, pr));
  } catch {
    Qo = !1;
  }
function Fp(e, t, n, r, s, a, l, i, u) {
  var c = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, c);
  } catch (d) {
    this.onError(d);
  }
}
var Cr = !1,
  Zs = null,
  ea = !1,
  qo = null,
  Up = {
    onError: function (e) {
      ((Cr = !0), (Zs = e));
    },
  };
function Hp(e, t, n, r, s, a, l, i, u) {
  ((Cr = !1), (Zs = null), Fp.apply(Up, arguments));
}
function Wp(e, t, n, r, s, a, l, i, u) {
  if ((Hp.apply(this, arguments), Cr)) {
    if (Cr) {
      var c = Zs;
      ((Cr = !1), (Zs = null));
    } else throw Error(E(198));
    ea || ((ea = !0), (qo = c));
  }
}
function kn(e) {
  var t = e,
    n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do ((t = e), t.flags & 4098 && (n = t.return), (e = t.return));
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function wd(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if ((t === null && ((e = e.alternate), e !== null && (t = e.memoizedState)), t !== null))
      return t.dehydrated;
  }
  return null;
}
function uu(e) {
  if (kn(e) !== e) throw Error(E(188));
}
function Vp(e) {
  var t = e.alternate;
  if (!t) {
    if (((t = kn(e)), t === null)) throw Error(E(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var s = n.return;
    if (s === null) break;
    var a = s.alternate;
    if (a === null) {
      if (((r = s.return), r !== null)) {
        n = r;
        continue;
      }
      break;
    }
    if (s.child === a.child) {
      for (a = s.child; a; ) {
        if (a === n) return (uu(s), e);
        if (a === r) return (uu(s), t);
        a = a.sibling;
      }
      throw Error(E(188));
    }
    if (n.return !== r.return) ((n = s), (r = a));
    else {
      for (var l = !1, i = s.child; i; ) {
        if (i === n) {
          ((l = !0), (n = s), (r = a));
          break;
        }
        if (i === r) {
          ((l = !0), (r = s), (n = a));
          break;
        }
        i = i.sibling;
      }
      if (!l) {
        for (i = a.child; i; ) {
          if (i === n) {
            ((l = !0), (n = a), (r = s));
            break;
          }
          if (i === r) {
            ((l = !0), (r = a), (n = s));
            break;
          }
          i = i.sibling;
        }
        if (!l) throw Error(E(189));
      }
    }
    if (n.alternate !== r) throw Error(E(190));
  }
  if (n.tag !== 3) throw Error(E(188));
  return n.stateNode.current === n ? e : t;
}
function bd(e) {
  return ((e = Vp(e)), e !== null ? jd(e) : null);
}
function jd(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = jd(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Nd = Ve.unstable_scheduleCallback,
  cu = Ve.unstable_cancelCallback,
  Gp = Ve.unstable_shouldYield,
  Kp = Ve.unstable_requestPaint,
  ae = Ve.unstable_now,
  Qp = Ve.unstable_getCurrentPriorityLevel,
  ni = Ve.unstable_ImmediatePriority,
  Sd = Ve.unstable_UserBlockingPriority,
  ta = Ve.unstable_NormalPriority,
  qp = Ve.unstable_LowPriority,
  kd = Ve.unstable_IdlePriority,
  Ca = null,
  ht = null;
function Yp(e) {
  if (ht && typeof ht.onCommitFiberRoot == 'function')
    try {
      ht.onCommitFiberRoot(Ca, e, void 0, (e.current.flags & 128) === 128);
    } catch {}
}
var at = Math.clz32 ? Math.clz32 : Zp,
  Jp = Math.log,
  Xp = Math.LN2;
function Zp(e) {
  return ((e >>>= 0), e === 0 ? 32 : (31 - ((Jp(e) / Xp) | 0)) | 0);
}
var ys = 64,
  vs = 4194304;
function Sr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function na(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0,
    s = e.suspendedLanes,
    a = e.pingedLanes,
    l = n & 268435455;
  if (l !== 0) {
    var i = l & ~s;
    i !== 0 ? (r = Sr(i)) : ((a &= l), a !== 0 && (r = Sr(a)));
  } else ((l = n & ~s), l !== 0 ? (r = Sr(l)) : a !== 0 && (r = Sr(a)));
  if (r === 0) return 0;
  if (
    t !== 0 &&
    t !== r &&
    !(t & s) &&
    ((s = r & -r), (a = t & -t), s >= a || (s === 16 && (a & 4194240) !== 0))
  )
    return t;
  if ((r & 4 && (r |= n & 16), (t = e.entangledLanes), t !== 0))
    for (e = e.entanglements, t &= r; 0 < t; )
      ((n = 31 - at(t)), (s = 1 << n), (r |= e[n]), (t &= ~s));
  return r;
}
function em(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function tm(e, t) {
  for (
    var n = e.suspendedLanes, r = e.pingedLanes, s = e.expirationTimes, a = e.pendingLanes;
    0 < a;
  ) {
    var l = 31 - at(a),
      i = 1 << l,
      u = s[l];
    (u === -1 ? (!(i & n) || i & r) && (s[l] = em(i, t)) : u <= t && (e.expiredLanes |= i),
      (a &= ~i));
  }
}
function Yo(e) {
  return ((e = e.pendingLanes & -1073741825), e !== 0 ? e : e & 1073741824 ? 1073741824 : 0);
}
function Ed() {
  var e = ys;
  return ((ys <<= 1), !(ys & 4194240) && (ys = 64), e);
}
function ro(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function ns(e, t, n) {
  ((e.pendingLanes |= t),
    t !== 536870912 && ((e.suspendedLanes = 0), (e.pingedLanes = 0)),
    (e = e.eventTimes),
    (t = 31 - at(t)),
    (e[t] = n));
}
function nm(e, t) {
  var n = e.pendingLanes & ~t;
  ((e.pendingLanes = t),
    (e.suspendedLanes = 0),
    (e.pingedLanes = 0),
    (e.expiredLanes &= t),
    (e.mutableReadLanes &= t),
    (e.entangledLanes &= t),
    (t = e.entanglements));
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var s = 31 - at(n),
      a = 1 << s;
    ((t[s] = 0), (r[s] = -1), (e[s] = -1), (n &= ~a));
  }
}
function ri(e, t) {
  var n = (e.entangledLanes |= t);
  for (e = e.entanglements; n; ) {
    var r = 31 - at(n),
      s = 1 << r;
    ((s & t) | (e[r] & t) && (e[r] |= t), (n &= ~s));
  }
}
var G = 0;
function Cd(e) {
  return ((e &= -e), 1 < e ? (4 < e ? (e & 268435455 ? 16 : 536870912) : 4) : 1);
}
var Td,
  si,
  _d,
  Ad,
  Ld,
  Jo = !1,
  ws = [],
  $t = null,
  Bt = null,
  Ft = null,
  zr = new Map(),
  $r = new Map(),
  Rt = [],
  rm =
    'mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit'.split(
      ' '
    );
function du(e, t) {
  switch (e) {
    case 'focusin':
    case 'focusout':
      $t = null;
      break;
    case 'dragenter':
    case 'dragleave':
      Bt = null;
      break;
    case 'mouseover':
    case 'mouseout':
      Ft = null;
      break;
    case 'pointerover':
    case 'pointerout':
      zr.delete(t.pointerId);
      break;
    case 'gotpointercapture':
    case 'lostpointercapture':
      $r.delete(t.pointerId);
  }
}
function mr(e, t, n, r, s, a) {
  return e === null || e.nativeEvent !== a
    ? ((e = {
        blockedOn: t,
        domEventName: n,
        eventSystemFlags: r,
        nativeEvent: a,
        targetContainers: [s],
      }),
      t !== null && ((t = ss(t)), t !== null && si(t)),
      e)
    : ((e.eventSystemFlags |= r),
      (t = e.targetContainers),
      s !== null && t.indexOf(s) === -1 && t.push(s),
      e);
}
function sm(e, t, n, r, s) {
  switch (t) {
    case 'focusin':
      return (($t = mr($t, e, t, n, r, s)), !0);
    case 'dragenter':
      return ((Bt = mr(Bt, e, t, n, r, s)), !0);
    case 'mouseover':
      return ((Ft = mr(Ft, e, t, n, r, s)), !0);
    case 'pointerover':
      var a = s.pointerId;
      return (zr.set(a, mr(zr.get(a) || null, e, t, n, r, s)), !0);
    case 'gotpointercapture':
      return ((a = s.pointerId), $r.set(a, mr($r.get(a) || null, e, t, n, r, s)), !0);
  }
  return !1;
}
function Pd(e) {
  var t = cn(e.target);
  if (t !== null) {
    var n = kn(t);
    if (n !== null) {
      if (((t = n.tag), t === 13)) {
        if (((t = wd(n)), t !== null)) {
          ((e.blockedOn = t),
            Ld(e.priority, function () {
              _d(n);
            }));
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function Ds(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Xo(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      ((Go = r), n.target.dispatchEvent(r), (Go = null));
    } else return ((t = ss(n)), t !== null && si(t), (e.blockedOn = n), !1);
    t.shift();
  }
  return !0;
}
function fu(e, t, n) {
  Ds(e) && n.delete(t);
}
function am() {
  ((Jo = !1),
    $t !== null && Ds($t) && ($t = null),
    Bt !== null && Ds(Bt) && (Bt = null),
    Ft !== null && Ds(Ft) && (Ft = null),
    zr.forEach(fu),
    $r.forEach(fu));
}
function hr(e, t) {
  e.blockedOn === t &&
    ((e.blockedOn = null),
    Jo || ((Jo = !0), Ve.unstable_scheduleCallback(Ve.unstable_NormalPriority, am)));
}
function Br(e) {
  function t(s) {
    return hr(s, e);
  }
  if (0 < ws.length) {
    hr(ws[0], e);
    for (var n = 1; n < ws.length; n++) {
      var r = ws[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (
    $t !== null && hr($t, e),
      Bt !== null && hr(Bt, e),
      Ft !== null && hr(Ft, e),
      zr.forEach(t),
      $r.forEach(t),
      n = 0;
    n < Rt.length;
    n++
  )
    ((r = Rt[n]), r.blockedOn === e && (r.blockedOn = null));
  for (; 0 < Rt.length && ((n = Rt[0]), n.blockedOn === null); )
    (Pd(n), n.blockedOn === null && Rt.shift());
}
var Kn = Tt.ReactCurrentBatchConfig,
  ra = !0;
function om(e, t, n, r) {
  var s = G,
    a = Kn.transition;
  Kn.transition = null;
  try {
    ((G = 1), ai(e, t, n, r));
  } finally {
    ((G = s), (Kn.transition = a));
  }
}
function lm(e, t, n, r) {
  var s = G,
    a = Kn.transition;
  Kn.transition = null;
  try {
    ((G = 4), ai(e, t, n, r));
  } finally {
    ((G = s), (Kn.transition = a));
  }
}
function ai(e, t, n, r) {
  if (ra) {
    var s = Xo(e, t, n, r);
    if (s === null) (mo(e, t, r, sa, n), du(e, r));
    else if (sm(s, e, t, n, r)) r.stopPropagation();
    else if ((du(e, r), t & 4 && -1 < rm.indexOf(e))) {
      for (; s !== null; ) {
        var a = ss(s);
        if ((a !== null && Td(a), (a = Xo(e, t, n, r)), a === null && mo(e, t, r, sa, n), a === s))
          break;
        s = a;
      }
      s !== null && r.stopPropagation();
    } else mo(e, t, r, null, n);
  }
}
var sa = null;
function Xo(e, t, n, r) {
  if (((sa = null), (e = ti(r)), (e = cn(e)), e !== null))
    if (((t = kn(e)), t === null)) e = null;
    else if (((n = t.tag), n === 13)) {
      if (((e = wd(t)), e !== null)) return e;
      e = null;
    } else if (n === 3) {
      if (t.stateNode.current.memoizedState.isDehydrated)
        return t.tag === 3 ? t.stateNode.containerInfo : null;
      e = null;
    } else t !== e && (e = null);
  return ((sa = e), null);
}
function Rd(e) {
  switch (e) {
    case 'cancel':
    case 'click':
    case 'close':
    case 'contextmenu':
    case 'copy':
    case 'cut':
    case 'auxclick':
    case 'dblclick':
    case 'dragend':
    case 'dragstart':
    case 'drop':
    case 'focusin':
    case 'focusout':
    case 'input':
    case 'invalid':
    case 'keydown':
    case 'keypress':
    case 'keyup':
    case 'mousedown':
    case 'mouseup':
    case 'paste':
    case 'pause':
    case 'play':
    case 'pointercancel':
    case 'pointerdown':
    case 'pointerup':
    case 'ratechange':
    case 'reset':
    case 'resize':
    case 'seeked':
    case 'submit':
    case 'touchcancel':
    case 'touchend':
    case 'touchstart':
    case 'volumechange':
    case 'change':
    case 'selectionchange':
    case 'textInput':
    case 'compositionstart':
    case 'compositionend':
    case 'compositionupdate':
    case 'beforeblur':
    case 'afterblur':
    case 'beforeinput':
    case 'blur':
    case 'fullscreenchange':
    case 'focus':
    case 'hashchange':
    case 'popstate':
    case 'select':
    case 'selectstart':
      return 1;
    case 'drag':
    case 'dragenter':
    case 'dragexit':
    case 'dragleave':
    case 'dragover':
    case 'mousemove':
    case 'mouseout':
    case 'mouseover':
    case 'pointermove':
    case 'pointerout':
    case 'pointerover':
    case 'scroll':
    case 'toggle':
    case 'touchmove':
    case 'wheel':
    case 'mouseenter':
    case 'mouseleave':
    case 'pointerenter':
    case 'pointerleave':
      return 4;
    case 'message':
      switch (Qp()) {
        case ni:
          return 1;
        case Sd:
          return 4;
        case ta:
        case qp:
          return 16;
        case kd:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var Mt = null,
  oi = null,
  zs = null;
function Id() {
  if (zs) return zs;
  var e,
    t = oi,
    n = t.length,
    r,
    s = 'value' in Mt ? Mt.value : Mt.textContent,
    a = s.length;
  for (e = 0; e < n && t[e] === s[e]; e++);
  var l = n - e;
  for (r = 1; r <= l && t[n - r] === s[a - r]; r++);
  return (zs = s.slice(e, 1 < r ? 1 - r : void 0));
}
function $s(e) {
  var t = e.keyCode;
  return (
    'charCode' in e ? ((e = e.charCode), e === 0 && t === 13 && (e = 13)) : (e = t),
    e === 10 && (e = 13),
    32 <= e || e === 13 ? e : 0
  );
}
function bs() {
  return !0;
}
function pu() {
  return !1;
}
function Ke(e) {
  function t(n, r, s, a, l) {
    ((this._reactName = n),
      (this._targetInst = s),
      (this.type = r),
      (this.nativeEvent = a),
      (this.target = l),
      (this.currentTarget = null));
    for (var i in e) e.hasOwnProperty(i) && ((n = e[i]), (this[i] = n ? n(a) : a[i]));
    return (
      (this.isDefaultPrevented = (
        a.defaultPrevented != null ? a.defaultPrevented : a.returnValue === !1
      )
        ? bs
        : pu),
      (this.isPropagationStopped = pu),
      this
    );
  }
  return (
    re(t.prototype, {
      preventDefault: function () {
        this.defaultPrevented = !0;
        var n = this.nativeEvent;
        n &&
          (n.preventDefault
            ? n.preventDefault()
            : typeof n.returnValue != 'unknown' && (n.returnValue = !1),
          (this.isDefaultPrevented = bs));
      },
      stopPropagation: function () {
        var n = this.nativeEvent;
        n &&
          (n.stopPropagation
            ? n.stopPropagation()
            : typeof n.cancelBubble != 'unknown' && (n.cancelBubble = !0),
          (this.isPropagationStopped = bs));
      },
      persist: function () {},
      isPersistent: bs,
    }),
    t
  );
}
var lr = {
    eventPhase: 0,
    bubbles: 0,
    cancelable: 0,
    timeStamp: function (e) {
      return e.timeStamp || Date.now();
    },
    defaultPrevented: 0,
    isTrusted: 0,
  },
  li = Ke(lr),
  rs = re({}, lr, { view: 0, detail: 0 }),
  im = Ke(rs),
  so,
  ao,
  gr,
  Ta = re({}, rs, {
    screenX: 0,
    screenY: 0,
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    getModifierState: ii,
    button: 0,
    buttons: 0,
    relatedTarget: function (e) {
      return e.relatedTarget === void 0
        ? e.fromElement === e.srcElement
          ? e.toElement
          : e.fromElement
        : e.relatedTarget;
    },
    movementX: function (e) {
      return 'movementX' in e
        ? e.movementX
        : (e !== gr &&
            (gr && e.type === 'mousemove'
              ? ((so = e.screenX - gr.screenX), (ao = e.screenY - gr.screenY))
              : (ao = so = 0),
            (gr = e)),
          so);
    },
    movementY: function (e) {
      return 'movementY' in e ? e.movementY : ao;
    },
  }),
  mu = Ke(Ta),
  um = re({}, Ta, { dataTransfer: 0 }),
  cm = Ke(um),
  dm = re({}, rs, { relatedTarget: 0 }),
  oo = Ke(dm),
  fm = re({}, lr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }),
  pm = Ke(fm),
  mm = re({}, lr, {
    clipboardData: function (e) {
      return 'clipboardData' in e ? e.clipboardData : window.clipboardData;
    },
  }),
  hm = Ke(mm),
  gm = re({}, lr, { data: 0 }),
  hu = Ke(gm),
  xm = {
    Esc: 'Escape',
    Spacebar: ' ',
    Left: 'ArrowLeft',
    Up: 'ArrowUp',
    Right: 'ArrowRight',
    Down: 'ArrowDown',
    Del: 'Delete',
    Win: 'OS',
    Menu: 'ContextMenu',
    Apps: 'ContextMenu',
    Scroll: 'ScrollLock',
    MozPrintableKey: 'Unidentified',
  },
  ym = {
    8: 'Backspace',
    9: 'Tab',
    12: 'Clear',
    13: 'Enter',
    16: 'Shift',
    17: 'Control',
    18: 'Alt',
    19: 'Pause',
    20: 'CapsLock',
    27: 'Escape',
    32: ' ',
    33: 'PageUp',
    34: 'PageDown',
    35: 'End',
    36: 'Home',
    37: 'ArrowLeft',
    38: 'ArrowUp',
    39: 'ArrowRight',
    40: 'ArrowDown',
    45: 'Insert',
    46: 'Delete',
    112: 'F1',
    113: 'F2',
    114: 'F3',
    115: 'F4',
    116: 'F5',
    117: 'F6',
    118: 'F7',
    119: 'F8',
    120: 'F9',
    121: 'F10',
    122: 'F11',
    123: 'F12',
    144: 'NumLock',
    145: 'ScrollLock',
    224: 'Meta',
  },
  vm = { Alt: 'altKey', Control: 'ctrlKey', Meta: 'metaKey', Shift: 'shiftKey' };
function wm(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = vm[e]) ? !!t[e] : !1;
}
function ii() {
  return wm;
}
var bm = re({}, rs, {
    key: function (e) {
      if (e.key) {
        var t = xm[e.key] || e.key;
        if (t !== 'Unidentified') return t;
      }
      return e.type === 'keypress'
        ? ((e = $s(e)), e === 13 ? 'Enter' : String.fromCharCode(e))
        : e.type === 'keydown' || e.type === 'keyup'
          ? ym[e.keyCode] || 'Unidentified'
          : '';
    },
    code: 0,
    location: 0,
    ctrlKey: 0,
    shiftKey: 0,
    altKey: 0,
    metaKey: 0,
    repeat: 0,
    locale: 0,
    getModifierState: ii,
    charCode: function (e) {
      return e.type === 'keypress' ? $s(e) : 0;
    },
    keyCode: function (e) {
      return e.type === 'keydown' || e.type === 'keyup' ? e.keyCode : 0;
    },
    which: function (e) {
      return e.type === 'keypress'
        ? $s(e)
        : e.type === 'keydown' || e.type === 'keyup'
          ? e.keyCode
          : 0;
    },
  }),
  jm = Ke(bm),
  Nm = re({}, Ta, {
    pointerId: 0,
    width: 0,
    height: 0,
    pressure: 0,
    tangentialPressure: 0,
    tiltX: 0,
    tiltY: 0,
    twist: 0,
    pointerType: 0,
    isPrimary: 0,
  }),
  gu = Ke(Nm),
  Sm = re({}, rs, {
    touches: 0,
    targetTouches: 0,
    changedTouches: 0,
    altKey: 0,
    metaKey: 0,
    ctrlKey: 0,
    shiftKey: 0,
    getModifierState: ii,
  }),
  km = Ke(Sm),
  Em = re({}, lr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }),
  Cm = Ke(Em),
  Tm = re({}, Ta, {
    deltaX: function (e) {
      return 'deltaX' in e ? e.deltaX : 'wheelDeltaX' in e ? -e.wheelDeltaX : 0;
    },
    deltaY: function (e) {
      return 'deltaY' in e
        ? e.deltaY
        : 'wheelDeltaY' in e
          ? -e.wheelDeltaY
          : 'wheelDelta' in e
            ? -e.wheelDelta
            : 0;
    },
    deltaZ: 0,
    deltaMode: 0,
  }),
  _m = Ke(Tm),
  Am = [9, 13, 27, 32],
  ui = Nt && 'CompositionEvent' in window,
  Tr = null;
Nt && 'documentMode' in document && (Tr = document.documentMode);
var Lm = Nt && 'TextEvent' in window && !Tr,
  Od = Nt && (!ui || (Tr && 8 < Tr && 11 >= Tr)),
  xu = ' ',
  yu = !1;
function Md(e, t) {
  switch (e) {
    case 'keyup':
      return Am.indexOf(t.keyCode) !== -1;
    case 'keydown':
      return t.keyCode !== 229;
    case 'keypress':
    case 'mousedown':
    case 'focusout':
      return !0;
    default:
      return !1;
  }
}
function Dd(e) {
  return ((e = e.detail), typeof e == 'object' && 'data' in e ? e.data : null);
}
var Pn = !1;
function Pm(e, t) {
  switch (e) {
    case 'compositionend':
      return Dd(t);
    case 'keypress':
      return t.which !== 32 ? null : ((yu = !0), xu);
    case 'textInput':
      return ((e = t.data), e === xu && yu ? null : e);
    default:
      return null;
  }
}
function Rm(e, t) {
  if (Pn)
    return e === 'compositionend' || (!ui && Md(e, t))
      ? ((e = Id()), (zs = oi = Mt = null), (Pn = !1), e)
      : null;
  switch (e) {
    case 'paste':
      return null;
    case 'keypress':
      if (!(t.ctrlKey || t.altKey || t.metaKey) || (t.ctrlKey && t.altKey)) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case 'compositionend':
      return Od && t.locale !== 'ko' ? null : t.data;
    default:
      return null;
  }
}
var Im = {
  color: !0,
  date: !0,
  datetime: !0,
  'datetime-local': !0,
  email: !0,
  month: !0,
  number: !0,
  password: !0,
  range: !0,
  search: !0,
  tel: !0,
  text: !0,
  time: !0,
  url: !0,
  week: !0,
};
function vu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === 'input' ? !!Im[e.type] : t === 'textarea';
}
function zd(e, t, n, r) {
  (hd(r),
    (t = aa(t, 'onChange')),
    0 < t.length &&
      ((n = new li('onChange', 'change', null, n, r)), e.push({ event: n, listeners: t })));
}
var _r = null,
  Fr = null;
function Om(e) {
  qd(e, 0);
}
function _a(e) {
  var t = On(e);
  if (id(t)) return e;
}
function Mm(e, t) {
  if (e === 'change') return t;
}
var $d = !1;
if (Nt) {
  var lo;
  if (Nt) {
    var io = 'oninput' in document;
    if (!io) {
      var wu = document.createElement('div');
      (wu.setAttribute('oninput', 'return;'), (io = typeof wu.oninput == 'function'));
    }
    lo = io;
  } else lo = !1;
  $d = lo && (!document.documentMode || 9 < document.documentMode);
}
function bu() {
  _r && (_r.detachEvent('onpropertychange', Bd), (Fr = _r = null));
}
function Bd(e) {
  if (e.propertyName === 'value' && _a(Fr)) {
    var t = [];
    (zd(t, Fr, e, ti(e)), vd(Om, t));
  }
}
function Dm(e, t, n) {
  e === 'focusin'
    ? (bu(), (_r = t), (Fr = n), _r.attachEvent('onpropertychange', Bd))
    : e === 'focusout' && bu();
}
function zm(e) {
  if (e === 'selectionchange' || e === 'keyup' || e === 'keydown') return _a(Fr);
}
function $m(e, t) {
  if (e === 'click') return _a(t);
}
function Bm(e, t) {
  if (e === 'input' || e === 'change') return _a(t);
}
function Fm(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var lt = typeof Object.is == 'function' ? Object.is : Fm;
function Ur(e, t) {
  if (lt(e, t)) return !0;
  if (typeof e != 'object' || e === null || typeof t != 'object' || t === null) return !1;
  var n = Object.keys(e),
    r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var s = n[r];
    if (!Io.call(t, s) || !lt(e[s], t[s])) return !1;
  }
  return !0;
}
function ju(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function Nu(e, t) {
  var n = ju(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (((r = e + n.textContent.length), e <= t && r >= t)) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = ju(n);
  }
}
function Fd(e, t) {
  return e && t
    ? e === t
      ? !0
      : e && e.nodeType === 3
        ? !1
        : t && t.nodeType === 3
          ? Fd(e, t.parentNode)
          : 'contains' in e
            ? e.contains(t)
            : e.compareDocumentPosition
              ? !!(e.compareDocumentPosition(t) & 16)
              : !1
    : !1;
}
function Ud() {
  for (var e = window, t = Xs(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == 'string';
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Xs(e.document);
  }
  return t;
}
function ci(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return (
    t &&
    ((t === 'input' &&
      (e.type === 'text' ||
        e.type === 'search' ||
        e.type === 'tel' ||
        e.type === 'url' ||
        e.type === 'password')) ||
      t === 'textarea' ||
      e.contentEditable === 'true')
  );
}
function Um(e) {
  var t = Ud(),
    n = e.focusedElem,
    r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Fd(n.ownerDocument.documentElement, n)) {
    if (r !== null && ci(n)) {
      if (((t = r.start), (e = r.end), e === void 0 && (e = t), 'selectionStart' in n))
        ((n.selectionStart = t), (n.selectionEnd = Math.min(e, n.value.length)));
      else if (
        ((e = ((t = n.ownerDocument || document) && t.defaultView) || window), e.getSelection)
      ) {
        e = e.getSelection();
        var s = n.textContent.length,
          a = Math.min(r.start, s);
        ((r = r.end === void 0 ? a : Math.min(r.end, s)),
          !e.extend && a > r && ((s = r), (r = a), (a = s)),
          (s = Nu(n, a)));
        var l = Nu(n, r);
        s &&
          l &&
          (e.rangeCount !== 1 ||
            e.anchorNode !== s.node ||
            e.anchorOffset !== s.offset ||
            e.focusNode !== l.node ||
            e.focusOffset !== l.offset) &&
          ((t = t.createRange()),
          t.setStart(s.node, s.offset),
          e.removeAllRanges(),
          a > r
            ? (e.addRange(t), e.extend(l.node, l.offset))
            : (t.setEnd(l.node, l.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; (e = e.parentNode); )
      e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == 'function' && n.focus(), n = 0; n < t.length; n++)
      ((e = t[n]), (e.element.scrollLeft = e.left), (e.element.scrollTop = e.top));
  }
}
var Hm = Nt && 'documentMode' in document && 11 >= document.documentMode,
  Rn = null,
  Zo = null,
  Ar = null,
  el = !1;
function Su(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  el ||
    Rn == null ||
    Rn !== Xs(r) ||
    ((r = Rn),
    'selectionStart' in r && ci(r)
      ? (r = { start: r.selectionStart, end: r.selectionEnd })
      : ((r = ((r.ownerDocument && r.ownerDocument.defaultView) || window).getSelection()),
        (r = {
          anchorNode: r.anchorNode,
          anchorOffset: r.anchorOffset,
          focusNode: r.focusNode,
          focusOffset: r.focusOffset,
        })),
    (Ar && Ur(Ar, r)) ||
      ((Ar = r),
      (r = aa(Zo, 'onSelect')),
      0 < r.length &&
        ((t = new li('onSelect', 'select', null, t, n)),
        e.push({ event: t, listeners: r }),
        (t.target = Rn))));
}
function js(e, t) {
  var n = {};
  return (
    (n[e.toLowerCase()] = t.toLowerCase()),
    (n['Webkit' + e] = 'webkit' + t),
    (n['Moz' + e] = 'moz' + t),
    n
  );
}
var In = {
    animationend: js('Animation', 'AnimationEnd'),
    animationiteration: js('Animation', 'AnimationIteration'),
    animationstart: js('Animation', 'AnimationStart'),
    transitionend: js('Transition', 'TransitionEnd'),
  },
  uo = {},
  Hd = {};
Nt &&
  ((Hd = document.createElement('div').style),
  'AnimationEvent' in window ||
    (delete In.animationend.animation,
    delete In.animationiteration.animation,
    delete In.animationstart.animation),
  'TransitionEvent' in window || delete In.transitionend.transition);
function Aa(e) {
  if (uo[e]) return uo[e];
  if (!In[e]) return e;
  var t = In[e],
    n;
  for (n in t) if (t.hasOwnProperty(n) && n in Hd) return (uo[e] = t[n]);
  return e;
}
var Wd = Aa('animationend'),
  Vd = Aa('animationiteration'),
  Gd = Aa('animationstart'),
  Kd = Aa('transitionend'),
  Qd = new Map(),
  ku =
    'abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel'.split(
      ' '
    );
function Yt(e, t) {
  (Qd.set(e, t), Sn(t, [e]));
}
for (var co = 0; co < ku.length; co++) {
  var fo = ku[co],
    Wm = fo.toLowerCase(),
    Vm = fo[0].toUpperCase() + fo.slice(1);
  Yt(Wm, 'on' + Vm);
}
Yt(Wd, 'onAnimationEnd');
Yt(Vd, 'onAnimationIteration');
Yt(Gd, 'onAnimationStart');
Yt('dblclick', 'onDoubleClick');
Yt('focusin', 'onFocus');
Yt('focusout', 'onBlur');
Yt(Kd, 'onTransitionEnd');
Yn('onMouseEnter', ['mouseout', 'mouseover']);
Yn('onMouseLeave', ['mouseout', 'mouseover']);
Yn('onPointerEnter', ['pointerout', 'pointerover']);
Yn('onPointerLeave', ['pointerout', 'pointerover']);
Sn('onChange', 'change click focusin focusout input keydown keyup selectionchange'.split(' '));
Sn(
  'onSelect',
  'focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange'.split(' ')
);
Sn('onBeforeInput', ['compositionend', 'keypress', 'textInput', 'paste']);
Sn('onCompositionEnd', 'compositionend focusout keydown keypress keyup mousedown'.split(' '));
Sn('onCompositionStart', 'compositionstart focusout keydown keypress keyup mousedown'.split(' '));
Sn('onCompositionUpdate', 'compositionupdate focusout keydown keypress keyup mousedown'.split(' '));
var kr =
    'abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting'.split(
      ' '
    ),
  Gm = new Set('cancel close invalid load scroll toggle'.split(' ').concat(kr));
function Eu(e, t, n) {
  var r = e.type || 'unknown-event';
  ((e.currentTarget = n), Wp(r, t, void 0, e), (e.currentTarget = null));
}
function qd(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n],
      s = r.event;
    r = r.listeners;
    e: {
      var a = void 0;
      if (t)
        for (var l = r.length - 1; 0 <= l; l--) {
          var i = r[l],
            u = i.instance,
            c = i.currentTarget;
          if (((i = i.listener), u !== a && s.isPropagationStopped())) break e;
          (Eu(s, i, c), (a = u));
        }
      else
        for (l = 0; l < r.length; l++) {
          if (
            ((i = r[l]),
            (u = i.instance),
            (c = i.currentTarget),
            (i = i.listener),
            u !== a && s.isPropagationStopped())
          )
            break e;
          (Eu(s, i, c), (a = u));
        }
    }
  }
  if (ea) throw ((e = qo), (ea = !1), (qo = null), e);
}
function Y(e, t) {
  var n = t[al];
  n === void 0 && (n = t[al] = new Set());
  var r = e + '__bubble';
  n.has(r) || (Yd(t, e, 2, !1), n.add(r));
}
function po(e, t, n) {
  var r = 0;
  (t && (r |= 4), Yd(n, e, r, t));
}
var Ns = '_reactListening' + Math.random().toString(36).slice(2);
function Hr(e) {
  if (!e[Ns]) {
    ((e[Ns] = !0),
      rd.forEach(function (n) {
        n !== 'selectionchange' && (Gm.has(n) || po(n, !1, e), po(n, !0, e));
      }));
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Ns] || ((t[Ns] = !0), po('selectionchange', !1, t));
  }
}
function Yd(e, t, n, r) {
  switch (Rd(t)) {
    case 1:
      var s = om;
      break;
    case 4:
      s = lm;
      break;
    default:
      s = ai;
  }
  ((n = s.bind(null, t, n, e)),
    (s = void 0),
    !Qo || (t !== 'touchstart' && t !== 'touchmove' && t !== 'wheel') || (s = !0),
    r
      ? s !== void 0
        ? e.addEventListener(t, n, { capture: !0, passive: s })
        : e.addEventListener(t, n, !0)
      : s !== void 0
        ? e.addEventListener(t, n, { passive: s })
        : e.addEventListener(t, n, !1));
}
function mo(e, t, n, r, s) {
  var a = r;
  if (!(t & 1) && !(t & 2) && r !== null)
    e: for (;;) {
      if (r === null) return;
      var l = r.tag;
      if (l === 3 || l === 4) {
        var i = r.stateNode.containerInfo;
        if (i === s || (i.nodeType === 8 && i.parentNode === s)) break;
        if (l === 4)
          for (l = r.return; l !== null; ) {
            var u = l.tag;
            if (
              (u === 3 || u === 4) &&
              ((u = l.stateNode.containerInfo), u === s || (u.nodeType === 8 && u.parentNode === s))
            )
              return;
            l = l.return;
          }
        for (; i !== null; ) {
          if (((l = cn(i)), l === null)) return;
          if (((u = l.tag), u === 5 || u === 6)) {
            r = a = l;
            continue e;
          }
          i = i.parentNode;
        }
      }
      r = r.return;
    }
  vd(function () {
    var c = a,
      d = ti(n),
      f = [];
    e: {
      var m = Qd.get(e);
      if (m !== void 0) {
        var b = li,
          x = e;
        switch (e) {
          case 'keypress':
            if ($s(n) === 0) break e;
          case 'keydown':
          case 'keyup':
            b = jm;
            break;
          case 'focusin':
            ((x = 'focus'), (b = oo));
            break;
          case 'focusout':
            ((x = 'blur'), (b = oo));
            break;
          case 'beforeblur':
          case 'afterblur':
            b = oo;
            break;
          case 'click':
            if (n.button === 2) break e;
          case 'auxclick':
          case 'dblclick':
          case 'mousedown':
          case 'mousemove':
          case 'mouseup':
          case 'mouseout':
          case 'mouseover':
          case 'contextmenu':
            b = mu;
            break;
          case 'drag':
          case 'dragend':
          case 'dragenter':
          case 'dragexit':
          case 'dragleave':
          case 'dragover':
          case 'dragstart':
          case 'drop':
            b = cm;
            break;
          case 'touchcancel':
          case 'touchend':
          case 'touchmove':
          case 'touchstart':
            b = km;
            break;
          case Wd:
          case Vd:
          case Gd:
            b = pm;
            break;
          case Kd:
            b = Cm;
            break;
          case 'scroll':
            b = im;
            break;
          case 'wheel':
            b = _m;
            break;
          case 'copy':
          case 'cut':
          case 'paste':
            b = hm;
            break;
          case 'gotpointercapture':
          case 'lostpointercapture':
          case 'pointercancel':
          case 'pointerdown':
          case 'pointermove':
          case 'pointerout':
          case 'pointerover':
          case 'pointerup':
            b = gu;
        }
        var w = (t & 4) !== 0,
          v = !w && e === 'scroll',
          h = w ? (m !== null ? m + 'Capture' : null) : m;
        w = [];
        for (var p = c, g; p !== null; ) {
          g = p;
          var j = g.stateNode;
          if (
            (g.tag === 5 &&
              j !== null &&
              ((g = j), h !== null && ((j = Dr(p, h)), j != null && w.push(Wr(p, j, g)))),
            v)
          )
            break;
          p = p.return;
        }
        0 < w.length && ((m = new b(m, x, null, n, d)), f.push({ event: m, listeners: w }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (
          ((m = e === 'mouseover' || e === 'pointerover'),
          (b = e === 'mouseout' || e === 'pointerout'),
          m && n !== Go && (x = n.relatedTarget || n.fromElement) && (cn(x) || x[St]))
        )
          break e;
        if (
          (b || m) &&
          ((m =
            d.window === d ? d : (m = d.ownerDocument) ? m.defaultView || m.parentWindow : window),
          b
            ? ((x = n.relatedTarget || n.toElement),
              (b = c),
              (x = x ? cn(x) : null),
              x !== null && ((v = kn(x)), x !== v || (x.tag !== 5 && x.tag !== 6)) && (x = null))
            : ((b = null), (x = c)),
          b !== x)
        ) {
          if (
            ((w = mu),
            (j = 'onMouseLeave'),
            (h = 'onMouseEnter'),
            (p = 'mouse'),
            (e === 'pointerout' || e === 'pointerover') &&
              ((w = gu), (j = 'onPointerLeave'), (h = 'onPointerEnter'), (p = 'pointer')),
            (v = b == null ? m : On(b)),
            (g = x == null ? m : On(x)),
            (m = new w(j, p + 'leave', b, n, d)),
            (m.target = v),
            (m.relatedTarget = g),
            (j = null),
            cn(d) === c &&
              ((w = new w(h, p + 'enter', x, n, d)),
              (w.target = g),
              (w.relatedTarget = v),
              (j = w)),
            (v = j),
            b && x)
          )
            t: {
              for (w = b, h = x, p = 0, g = w; g; g = Cn(g)) p++;
              for (g = 0, j = h; j; j = Cn(j)) g++;
              for (; 0 < p - g; ) ((w = Cn(w)), p--);
              for (; 0 < g - p; ) ((h = Cn(h)), g--);
              for (; p--; ) {
                if (w === h || (h !== null && w === h.alternate)) break t;
                ((w = Cn(w)), (h = Cn(h)));
              }
              w = null;
            }
          else w = null;
          (b !== null && Cu(f, m, b, w, !1), x !== null && v !== null && Cu(f, v, x, w, !0));
        }
      }
      e: {
        if (
          ((m = c ? On(c) : window),
          (b = m.nodeName && m.nodeName.toLowerCase()),
          b === 'select' || (b === 'input' && m.type === 'file'))
        )
          var k = Mm;
        else if (vu(m))
          if ($d) k = Bm;
          else {
            k = zm;
            var A = Dm;
          }
        else
          (b = m.nodeName) &&
            b.toLowerCase() === 'input' &&
            (m.type === 'checkbox' || m.type === 'radio') &&
            (k = $m);
        if (k && (k = k(e, c))) {
          zd(f, k, n, d);
          break e;
        }
        (A && A(e, m, c),
          e === 'focusout' &&
            (A = m._wrapperState) &&
            A.controlled &&
            m.type === 'number' &&
            Fo(m, 'number', m.value));
      }
      switch (((A = c ? On(c) : window), e)) {
        case 'focusin':
          (vu(A) || A.contentEditable === 'true') && ((Rn = A), (Zo = c), (Ar = null));
          break;
        case 'focusout':
          Ar = Zo = Rn = null;
          break;
        case 'mousedown':
          el = !0;
          break;
        case 'contextmenu':
        case 'mouseup':
        case 'dragend':
          ((el = !1), Su(f, n, d));
          break;
        case 'selectionchange':
          if (Hm) break;
        case 'keydown':
        case 'keyup':
          Su(f, n, d);
      }
      var _;
      if (ui)
        e: {
          switch (e) {
            case 'compositionstart':
              var S = 'onCompositionStart';
              break e;
            case 'compositionend':
              S = 'onCompositionEnd';
              break e;
            case 'compositionupdate':
              S = 'onCompositionUpdate';
              break e;
          }
          S = void 0;
        }
      else
        Pn
          ? Md(e, n) && (S = 'onCompositionEnd')
          : e === 'keydown' && n.keyCode === 229 && (S = 'onCompositionStart');
      (S &&
        (Od &&
          n.locale !== 'ko' &&
          (Pn || S !== 'onCompositionStart'
            ? S === 'onCompositionEnd' && Pn && (_ = Id())
            : ((Mt = d), (oi = 'value' in Mt ? Mt.value : Mt.textContent), (Pn = !0))),
        (A = aa(c, S)),
        0 < A.length &&
          ((S = new hu(S, e, null, n, d)),
          f.push({ event: S, listeners: A }),
          _ ? (S.data = _) : ((_ = Dd(n)), _ !== null && (S.data = _)))),
        (_ = Lm ? Pm(e, n) : Rm(e, n)) &&
          ((c = aa(c, 'onBeforeInput')),
          0 < c.length &&
            ((d = new hu('onBeforeInput', 'beforeinput', null, n, d)),
            f.push({ event: d, listeners: c }),
            (d.data = _))));
    }
    qd(f, t);
  });
}
function Wr(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function aa(e, t) {
  for (var n = t + 'Capture', r = []; e !== null; ) {
    var s = e,
      a = s.stateNode;
    (s.tag === 5 &&
      a !== null &&
      ((s = a),
      (a = Dr(e, n)),
      a != null && r.unshift(Wr(e, a, s)),
      (a = Dr(e, t)),
      a != null && r.push(Wr(e, a, s))),
      (e = e.return));
  }
  return r;
}
function Cn(e) {
  if (e === null) return null;
  do e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function Cu(e, t, n, r, s) {
  for (var a = t._reactName, l = []; n !== null && n !== r; ) {
    var i = n,
      u = i.alternate,
      c = i.stateNode;
    if (u !== null && u === r) break;
    (i.tag === 5 &&
      c !== null &&
      ((i = c),
      s
        ? ((u = Dr(n, a)), u != null && l.unshift(Wr(n, u, i)))
        : s || ((u = Dr(n, a)), u != null && l.push(Wr(n, u, i)))),
      (n = n.return));
  }
  l.length !== 0 && e.push({ event: t, listeners: l });
}
var Km = /\r\n?/g,
  Qm = /\u0000|\uFFFD/g;
function Tu(e) {
  return (typeof e == 'string' ? e : '' + e)
    .replace(
      Km,
      `
`
    )
    .replace(Qm, '');
}
function Ss(e, t, n) {
  if (((t = Tu(t)), Tu(e) !== t && n)) throw Error(E(425));
}
function oa() {}
var tl = null,
  nl = null;
function rl(e, t) {
  return (
    e === 'textarea' ||
    e === 'noscript' ||
    typeof t.children == 'string' ||
    typeof t.children == 'number' ||
    (typeof t.dangerouslySetInnerHTML == 'object' &&
      t.dangerouslySetInnerHTML !== null &&
      t.dangerouslySetInnerHTML.__html != null)
  );
}
var sl = typeof setTimeout == 'function' ? setTimeout : void 0,
  qm = typeof clearTimeout == 'function' ? clearTimeout : void 0,
  _u = typeof Promise == 'function' ? Promise : void 0,
  Ym =
    typeof queueMicrotask == 'function'
      ? queueMicrotask
      : typeof _u < 'u'
        ? function (e) {
            return _u.resolve(null).then(e).catch(Jm);
          }
        : sl;
function Jm(e) {
  setTimeout(function () {
    throw e;
  });
}
function ho(e, t) {
  var n = t,
    r = 0;
  do {
    var s = n.nextSibling;
    if ((e.removeChild(n), s && s.nodeType === 8))
      if (((n = s.data), n === '/$')) {
        if (r === 0) {
          (e.removeChild(s), Br(t));
          return;
        }
        r--;
      } else (n !== '$' && n !== '$?' && n !== '$!') || r++;
    n = s;
  } while (n);
  Br(t);
}
function Ut(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (((t = e.data), t === '$' || t === '$!' || t === '$?')) break;
      if (t === '/$') return null;
    }
  }
  return e;
}
function Au(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === '$' || n === '$!' || n === '$?') {
        if (t === 0) return e;
        t--;
      } else n === '/$' && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var ir = Math.random().toString(36).slice(2),
  pt = '__reactFiber$' + ir,
  Vr = '__reactProps$' + ir,
  St = '__reactContainer$' + ir,
  al = '__reactEvents$' + ir,
  Xm = '__reactListeners$' + ir,
  Zm = '__reactHandles$' + ir;
function cn(e) {
  var t = e[pt];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if ((t = n[St] || n[pt])) {
      if (((n = t.alternate), t.child !== null || (n !== null && n.child !== null)))
        for (e = Au(e); e !== null; ) {
          if ((n = e[pt])) return n;
          e = Au(e);
        }
      return t;
    }
    ((e = n), (n = e.parentNode));
  }
  return null;
}
function ss(e) {
  return (
    (e = e[pt] || e[St]),
    !e || (e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3) ? null : e
  );
}
function On(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(E(33));
}
function La(e) {
  return e[Vr] || null;
}
var ol = [],
  Mn = -1;
function Jt(e) {
  return { current: e };
}
function J(e) {
  0 > Mn || ((e.current = ol[Mn]), (ol[Mn] = null), Mn--);
}
function q(e, t) {
  (Mn++, (ol[Mn] = e.current), (e.current = t));
}
var qt = {},
  Te = Jt(qt),
  Me = Jt(!1),
  yn = qt;
function Jn(e, t) {
  var n = e.type.contextTypes;
  if (!n) return qt;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t)
    return r.__reactInternalMemoizedMaskedChildContext;
  var s = {},
    a;
  for (a in n) s[a] = t[a];
  return (
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = t),
      (e.__reactInternalMemoizedMaskedChildContext = s)),
    s
  );
}
function De(e) {
  return ((e = e.childContextTypes), e != null);
}
function la() {
  (J(Me), J(Te));
}
function Lu(e, t, n) {
  if (Te.current !== qt) throw Error(E(168));
  (q(Te, t), q(Me, n));
}
function Jd(e, t, n) {
  var r = e.stateNode;
  if (((t = t.childContextTypes), typeof r.getChildContext != 'function')) return n;
  r = r.getChildContext();
  for (var s in r) if (!(s in t)) throw Error(E(108, Dp(e) || 'Unknown', s));
  return re({}, n, r);
}
function ia(e) {
  return (
    (e = ((e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext) || qt),
    (yn = Te.current),
    q(Te, e),
    q(Me, Me.current),
    !0
  );
}
function Pu(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(E(169));
  (n
    ? ((e = Jd(e, t, yn)),
      (r.__reactInternalMemoizedMergedChildContext = e),
      J(Me),
      J(Te),
      q(Te, e))
    : J(Me),
    q(Me, n));
}
var vt = null,
  Pa = !1,
  go = !1;
function Xd(e) {
  vt === null ? (vt = [e]) : vt.push(e);
}
function eh(e) {
  ((Pa = !0), Xd(e));
}
function Xt() {
  if (!go && vt !== null) {
    go = !0;
    var e = 0,
      t = G;
    try {
      var n = vt;
      for (G = 1; e < n.length; e++) {
        var r = n[e];
        do r = r(!0);
        while (r !== null);
      }
      ((vt = null), (Pa = !1));
    } catch (s) {
      throw (vt !== null && (vt = vt.slice(e + 1)), Nd(ni, Xt), s);
    } finally {
      ((G = t), (go = !1));
    }
  }
  return null;
}
var Dn = [],
  zn = 0,
  ua = null,
  ca = 0,
  qe = [],
  Ye = 0,
  vn = null,
  wt = 1,
  bt = '';
function rn(e, t) {
  ((Dn[zn++] = ca), (Dn[zn++] = ua), (ua = e), (ca = t));
}
function Zd(e, t, n) {
  ((qe[Ye++] = wt), (qe[Ye++] = bt), (qe[Ye++] = vn), (vn = e));
  var r = wt;
  e = bt;
  var s = 32 - at(r) - 1;
  ((r &= ~(1 << s)), (n += 1));
  var a = 32 - at(t) + s;
  if (30 < a) {
    var l = s - (s % 5);
    ((a = (r & ((1 << l) - 1)).toString(32)),
      (r >>= l),
      (s -= l),
      (wt = (1 << (32 - at(t) + s)) | (n << s) | r),
      (bt = a + e));
  } else ((wt = (1 << a) | (n << s) | r), (bt = e));
}
function di(e) {
  e.return !== null && (rn(e, 1), Zd(e, 1, 0));
}
function fi(e) {
  for (; e === ua; ) ((ua = Dn[--zn]), (Dn[zn] = null), (ca = Dn[--zn]), (Dn[zn] = null));
  for (; e === vn; )
    ((vn = qe[--Ye]),
      (qe[Ye] = null),
      (bt = qe[--Ye]),
      (qe[Ye] = null),
      (wt = qe[--Ye]),
      (qe[Ye] = null));
}
var We = null,
  He = null,
  X = !1,
  st = null;
function ef(e, t) {
  var n = Je(5, null, null, 0);
  ((n.elementType = 'DELETED'),
    (n.stateNode = t),
    (n.return = e),
    (t = e.deletions),
    t === null ? ((e.deletions = [n]), (e.flags |= 16)) : t.push(n));
}
function Ru(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return (
        (t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t),
        t !== null ? ((e.stateNode = t), (We = e), (He = Ut(t.firstChild)), !0) : !1
      );
    case 6:
      return (
        (t = e.pendingProps === '' || t.nodeType !== 3 ? null : t),
        t !== null ? ((e.stateNode = t), (We = e), (He = null), !0) : !1
      );
    case 13:
      return (
        (t = t.nodeType !== 8 ? null : t),
        t !== null
          ? ((n = vn !== null ? { id: wt, overflow: bt } : null),
            (e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }),
            (n = Je(18, null, null, 0)),
            (n.stateNode = t),
            (n.return = e),
            (e.child = n),
            (We = e),
            (He = null),
            !0)
          : !1
      );
    default:
      return !1;
  }
}
function ll(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function il(e) {
  if (X) {
    var t = He;
    if (t) {
      var n = t;
      if (!Ru(e, t)) {
        if (ll(e)) throw Error(E(418));
        t = Ut(n.nextSibling);
        var r = We;
        t && Ru(e, t) ? ef(r, n) : ((e.flags = (e.flags & -4097) | 2), (X = !1), (We = e));
      }
    } else {
      if (ll(e)) throw Error(E(418));
      ((e.flags = (e.flags & -4097) | 2), (X = !1), (We = e));
    }
  }
}
function Iu(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  We = e;
}
function ks(e) {
  if (e !== We) return !1;
  if (!X) return (Iu(e), (X = !0), !1);
  var t;
  if (
    ((t = e.tag !== 3) &&
      !(t = e.tag !== 5) &&
      ((t = e.type), (t = t !== 'head' && t !== 'body' && !rl(e.type, e.memoizedProps))),
    t && (t = He))
  ) {
    if (ll(e)) throw (tf(), Error(E(418)));
    for (; t; ) (ef(e, t), (t = Ut(t.nextSibling)));
  }
  if ((Iu(e), e.tag === 13)) {
    if (((e = e.memoizedState), (e = e !== null ? e.dehydrated : null), !e)) throw Error(E(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === '/$') {
            if (t === 0) {
              He = Ut(e.nextSibling);
              break e;
            }
            t--;
          } else (n !== '$' && n !== '$!' && n !== '$?') || t++;
        }
        e = e.nextSibling;
      }
      He = null;
    }
  } else He = We ? Ut(e.stateNode.nextSibling) : null;
  return !0;
}
function tf() {
  for (var e = He; e; ) e = Ut(e.nextSibling);
}
function Xn() {
  ((He = We = null), (X = !1));
}
function pi(e) {
  st === null ? (st = [e]) : st.push(e);
}
var th = Tt.ReactCurrentBatchConfig;
function xr(e, t, n) {
  if (((e = n.ref), e !== null && typeof e != 'function' && typeof e != 'object')) {
    if (n._owner) {
      if (((n = n._owner), n)) {
        if (n.tag !== 1) throw Error(E(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(E(147, e));
      var s = r,
        a = '' + e;
      return t !== null && t.ref !== null && typeof t.ref == 'function' && t.ref._stringRef === a
        ? t.ref
        : ((t = function (l) {
            var i = s.refs;
            l === null ? delete i[a] : (i[a] = l);
          }),
          (t._stringRef = a),
          t);
    }
    if (typeof e != 'string') throw Error(E(284));
    if (!n._owner) throw Error(E(290, e));
  }
  return e;
}
function Es(e, t) {
  throw (
    (e = Object.prototype.toString.call(t)),
    Error(
      E(31, e === '[object Object]' ? 'object with keys {' + Object.keys(t).join(', ') + '}' : e)
    )
  );
}
function Ou(e) {
  var t = e._init;
  return t(e._payload);
}
function nf(e) {
  function t(h, p) {
    if (e) {
      var g = h.deletions;
      g === null ? ((h.deletions = [p]), (h.flags |= 16)) : g.push(p);
    }
  }
  function n(h, p) {
    if (!e) return null;
    for (; p !== null; ) (t(h, p), (p = p.sibling));
    return null;
  }
  function r(h, p) {
    for (h = new Map(); p !== null; )
      (p.key !== null ? h.set(p.key, p) : h.set(p.index, p), (p = p.sibling));
    return h;
  }
  function s(h, p) {
    return ((h = Gt(h, p)), (h.index = 0), (h.sibling = null), h);
  }
  function a(h, p, g) {
    return (
      (h.index = g),
      e
        ? ((g = h.alternate),
          g !== null ? ((g = g.index), g < p ? ((h.flags |= 2), p) : g) : ((h.flags |= 2), p))
        : ((h.flags |= 1048576), p)
    );
  }
  function l(h) {
    return (e && h.alternate === null && (h.flags |= 2), h);
  }
  function i(h, p, g, j) {
    return p === null || p.tag !== 6
      ? ((p = No(g, h.mode, j)), (p.return = h), p)
      : ((p = s(p, g)), (p.return = h), p);
  }
  function u(h, p, g, j) {
    var k = g.type;
    return k === Ln
      ? d(h, p, g.props.children, j, g.key)
      : p !== null &&
          (p.elementType === k ||
            (typeof k == 'object' && k !== null && k.$$typeof === Lt && Ou(k) === p.type))
        ? ((j = s(p, g.props)), (j.ref = xr(h, p, g)), (j.return = h), j)
        : ((j = Gs(g.type, g.key, g.props, null, h.mode, j)),
          (j.ref = xr(h, p, g)),
          (j.return = h),
          j);
  }
  function c(h, p, g, j) {
    return p === null ||
      p.tag !== 4 ||
      p.stateNode.containerInfo !== g.containerInfo ||
      p.stateNode.implementation !== g.implementation
      ? ((p = So(g, h.mode, j)), (p.return = h), p)
      : ((p = s(p, g.children || [])), (p.return = h), p);
  }
  function d(h, p, g, j, k) {
    return p === null || p.tag !== 7
      ? ((p = gn(g, h.mode, j, k)), (p.return = h), p)
      : ((p = s(p, g)), (p.return = h), p);
  }
  function f(h, p, g) {
    if ((typeof p == 'string' && p !== '') || typeof p == 'number')
      return ((p = No('' + p, h.mode, g)), (p.return = h), p);
    if (typeof p == 'object' && p !== null) {
      switch (p.$$typeof) {
        case hs:
          return (
            (g = Gs(p.type, p.key, p.props, null, h.mode, g)),
            (g.ref = xr(h, null, p)),
            (g.return = h),
            g
          );
        case An:
          return ((p = So(p, h.mode, g)), (p.return = h), p);
        case Lt:
          var j = p._init;
          return f(h, j(p._payload), g);
      }
      if (Nr(p) || fr(p)) return ((p = gn(p, h.mode, g, null)), (p.return = h), p);
      Es(h, p);
    }
    return null;
  }
  function m(h, p, g, j) {
    var k = p !== null ? p.key : null;
    if ((typeof g == 'string' && g !== '') || typeof g == 'number')
      return k !== null ? null : i(h, p, '' + g, j);
    if (typeof g == 'object' && g !== null) {
      switch (g.$$typeof) {
        case hs:
          return g.key === k ? u(h, p, g, j) : null;
        case An:
          return g.key === k ? c(h, p, g, j) : null;
        case Lt:
          return ((k = g._init), m(h, p, k(g._payload), j));
      }
      if (Nr(g) || fr(g)) return k !== null ? null : d(h, p, g, j, null);
      Es(h, g);
    }
    return null;
  }
  function b(h, p, g, j, k) {
    if ((typeof j == 'string' && j !== '') || typeof j == 'number')
      return ((h = h.get(g) || null), i(p, h, '' + j, k));
    if (typeof j == 'object' && j !== null) {
      switch (j.$$typeof) {
        case hs:
          return ((h = h.get(j.key === null ? g : j.key) || null), u(p, h, j, k));
        case An:
          return ((h = h.get(j.key === null ? g : j.key) || null), c(p, h, j, k));
        case Lt:
          var A = j._init;
          return b(h, p, g, A(j._payload), k);
      }
      if (Nr(j) || fr(j)) return ((h = h.get(g) || null), d(p, h, j, k, null));
      Es(p, j);
    }
    return null;
  }
  function x(h, p, g, j) {
    for (var k = null, A = null, _ = p, S = (p = 0), P = null; _ !== null && S < g.length; S++) {
      _.index > S ? ((P = _), (_ = null)) : (P = _.sibling);
      var R = m(h, _, g[S], j);
      if (R === null) {
        _ === null && (_ = P);
        break;
      }
      (e && _ && R.alternate === null && t(h, _),
        (p = a(R, p, S)),
        A === null ? (k = R) : (A.sibling = R),
        (A = R),
        (_ = P));
    }
    if (S === g.length) return (n(h, _), X && rn(h, S), k);
    if (_ === null) {
      for (; S < g.length; S++)
        ((_ = f(h, g[S], j)),
          _ !== null && ((p = a(_, p, S)), A === null ? (k = _) : (A.sibling = _), (A = _)));
      return (X && rn(h, S), k);
    }
    for (_ = r(h, _); S < g.length; S++)
      ((P = b(_, h, S, g[S], j)),
        P !== null &&
          (e && P.alternate !== null && _.delete(P.key === null ? S : P.key),
          (p = a(P, p, S)),
          A === null ? (k = P) : (A.sibling = P),
          (A = P)));
    return (
      e &&
        _.forEach(function (z) {
          return t(h, z);
        }),
      X && rn(h, S),
      k
    );
  }
  function w(h, p, g, j) {
    var k = fr(g);
    if (typeof k != 'function') throw Error(E(150));
    if (((g = k.call(g)), g == null)) throw Error(E(151));
    for (
      var A = (k = null), _ = p, S = (p = 0), P = null, R = g.next();
      _ !== null && !R.done;
      S++, R = g.next()
    ) {
      _.index > S ? ((P = _), (_ = null)) : (P = _.sibling);
      var z = m(h, _, R.value, j);
      if (z === null) {
        _ === null && (_ = P);
        break;
      }
      (e && _ && z.alternate === null && t(h, _),
        (p = a(z, p, S)),
        A === null ? (k = z) : (A.sibling = z),
        (A = z),
        (_ = P));
    }
    if (R.done) return (n(h, _), X && rn(h, S), k);
    if (_ === null) {
      for (; !R.done; S++, R = g.next())
        ((R = f(h, R.value, j)),
          R !== null && ((p = a(R, p, S)), A === null ? (k = R) : (A.sibling = R), (A = R)));
      return (X && rn(h, S), k);
    }
    for (_ = r(h, _); !R.done; S++, R = g.next())
      ((R = b(_, h, S, R.value, j)),
        R !== null &&
          (e && R.alternate !== null && _.delete(R.key === null ? S : R.key),
          (p = a(R, p, S)),
          A === null ? (k = R) : (A.sibling = R),
          (A = R)));
    return (
      e &&
        _.forEach(function (K) {
          return t(h, K);
        }),
      X && rn(h, S),
      k
    );
  }
  function v(h, p, g, j) {
    if (
      (typeof g == 'object' &&
        g !== null &&
        g.type === Ln &&
        g.key === null &&
        (g = g.props.children),
      typeof g == 'object' && g !== null)
    ) {
      switch (g.$$typeof) {
        case hs:
          e: {
            for (var k = g.key, A = p; A !== null; ) {
              if (A.key === k) {
                if (((k = g.type), k === Ln)) {
                  if (A.tag === 7) {
                    (n(h, A.sibling), (p = s(A, g.props.children)), (p.return = h), (h = p));
                    break e;
                  }
                } else if (
                  A.elementType === k ||
                  (typeof k == 'object' && k !== null && k.$$typeof === Lt && Ou(k) === A.type)
                ) {
                  (n(h, A.sibling),
                    (p = s(A, g.props)),
                    (p.ref = xr(h, A, g)),
                    (p.return = h),
                    (h = p));
                  break e;
                }
                n(h, A);
                break;
              } else t(h, A);
              A = A.sibling;
            }
            g.type === Ln
              ? ((p = gn(g.props.children, h.mode, j, g.key)), (p.return = h), (h = p))
              : ((j = Gs(g.type, g.key, g.props, null, h.mode, j)),
                (j.ref = xr(h, p, g)),
                (j.return = h),
                (h = j));
          }
          return l(h);
        case An:
          e: {
            for (A = g.key; p !== null; ) {
              if (p.key === A)
                if (
                  p.tag === 4 &&
                  p.stateNode.containerInfo === g.containerInfo &&
                  p.stateNode.implementation === g.implementation
                ) {
                  (n(h, p.sibling), (p = s(p, g.children || [])), (p.return = h), (h = p));
                  break e;
                } else {
                  n(h, p);
                  break;
                }
              else t(h, p);
              p = p.sibling;
            }
            ((p = So(g, h.mode, j)), (p.return = h), (h = p));
          }
          return l(h);
        case Lt:
          return ((A = g._init), v(h, p, A(g._payload), j));
      }
      if (Nr(g)) return x(h, p, g, j);
      if (fr(g)) return w(h, p, g, j);
      Es(h, g);
    }
    return (typeof g == 'string' && g !== '') || typeof g == 'number'
      ? ((g = '' + g),
        p !== null && p.tag === 6
          ? (n(h, p.sibling), (p = s(p, g)), (p.return = h), (h = p))
          : (n(h, p), (p = No(g, h.mode, j)), (p.return = h), (h = p)),
        l(h))
      : n(h, p);
  }
  return v;
}
var Zn = nf(!0),
  rf = nf(!1),
  da = Jt(null),
  fa = null,
  $n = null,
  mi = null;
function hi() {
  mi = $n = fa = null;
}
function gi(e) {
  var t = da.current;
  (J(da), (e._currentValue = t));
}
function ul(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if (
      ((e.childLanes & t) !== t
        ? ((e.childLanes |= t), r !== null && (r.childLanes |= t))
        : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t),
      e === n)
    )
      break;
    e = e.return;
  }
}
function Qn(e, t) {
  ((fa = e),
    (mi = $n = null),
    (e = e.dependencies),
    e !== null && e.firstContext !== null && (e.lanes & t && (Oe = !0), (e.firstContext = null)));
}
function Ze(e) {
  var t = e._currentValue;
  if (mi !== e)
    if (((e = { context: e, memoizedValue: t, next: null }), $n === null)) {
      if (fa === null) throw Error(E(308));
      (($n = e), (fa.dependencies = { lanes: 0, firstContext: e }));
    } else $n = $n.next = e;
  return t;
}
var dn = null;
function xi(e) {
  dn === null ? (dn = [e]) : dn.push(e);
}
function sf(e, t, n, r) {
  var s = t.interleaved;
  return (
    s === null ? ((n.next = n), xi(t)) : ((n.next = s.next), (s.next = n)),
    (t.interleaved = n),
    kt(e, r)
  );
}
function kt(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; )
    ((e.childLanes |= t),
      (n = e.alternate),
      n !== null && (n.childLanes |= t),
      (n = e),
      (e = e.return));
  return n.tag === 3 ? n.stateNode : null;
}
var Pt = !1;
function yi(e) {
  e.updateQueue = {
    baseState: e.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: { pending: null, interleaved: null, lanes: 0 },
    effects: null,
  };
}
function af(e, t) {
  ((e = e.updateQueue),
    t.updateQueue === e &&
      (t.updateQueue = {
        baseState: e.baseState,
        firstBaseUpdate: e.firstBaseUpdate,
        lastBaseUpdate: e.lastBaseUpdate,
        shared: e.shared,
        effects: e.effects,
      }));
}
function jt(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function Ht(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (((r = r.shared), V & 2)) {
    var s = r.pending;
    return (
      s === null ? (t.next = t) : ((t.next = s.next), (s.next = t)),
      (r.pending = t),
      kt(e, n)
    );
  }
  return (
    (s = r.interleaved),
    s === null ? ((t.next = t), xi(r)) : ((t.next = s.next), (s.next = t)),
    (r.interleaved = t),
    kt(e, n)
  );
}
function Bs(e, t, n) {
  if (((t = t.updateQueue), t !== null && ((t = t.shared), (n & 4194240) !== 0))) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ri(e, n));
  }
}
function Mu(e, t) {
  var n = e.updateQueue,
    r = e.alternate;
  if (r !== null && ((r = r.updateQueue), n === r)) {
    var s = null,
      a = null;
    if (((n = n.firstBaseUpdate), n !== null)) {
      do {
        var l = {
          eventTime: n.eventTime,
          lane: n.lane,
          tag: n.tag,
          payload: n.payload,
          callback: n.callback,
          next: null,
        };
        (a === null ? (s = a = l) : (a = a.next = l), (n = n.next));
      } while (n !== null);
      a === null ? (s = a = t) : (a = a.next = t);
    } else s = a = t;
    ((n = {
      baseState: r.baseState,
      firstBaseUpdate: s,
      lastBaseUpdate: a,
      shared: r.shared,
      effects: r.effects,
    }),
      (e.updateQueue = n));
    return;
  }
  ((e = n.lastBaseUpdate),
    e === null ? (n.firstBaseUpdate = t) : (e.next = t),
    (n.lastBaseUpdate = t));
}
function pa(e, t, n, r) {
  var s = e.updateQueue;
  Pt = !1;
  var a = s.firstBaseUpdate,
    l = s.lastBaseUpdate,
    i = s.shared.pending;
  if (i !== null) {
    s.shared.pending = null;
    var u = i,
      c = u.next;
    ((u.next = null), l === null ? (a = c) : (l.next = c), (l = u));
    var d = e.alternate;
    d !== null &&
      ((d = d.updateQueue),
      (i = d.lastBaseUpdate),
      i !== l && (i === null ? (d.firstBaseUpdate = c) : (i.next = c), (d.lastBaseUpdate = u)));
  }
  if (a !== null) {
    var f = s.baseState;
    ((l = 0), (d = c = u = null), (i = a));
    do {
      var m = i.lane,
        b = i.eventTime;
      if ((r & m) === m) {
        d !== null &&
          (d = d.next =
            {
              eventTime: b,
              lane: 0,
              tag: i.tag,
              payload: i.payload,
              callback: i.callback,
              next: null,
            });
        e: {
          var x = e,
            w = i;
          switch (((m = t), (b = n), w.tag)) {
            case 1:
              if (((x = w.payload), typeof x == 'function')) {
                f = x.call(b, f, m);
                break e;
              }
              f = x;
              break e;
            case 3:
              x.flags = (x.flags & -65537) | 128;
            case 0:
              if (((x = w.payload), (m = typeof x == 'function' ? x.call(b, f, m) : x), m == null))
                break e;
              f = re({}, f, m);
              break e;
            case 2:
              Pt = !0;
          }
        }
        i.callback !== null &&
          i.lane !== 0 &&
          ((e.flags |= 64), (m = s.effects), m === null ? (s.effects = [i]) : m.push(i));
      } else
        ((b = {
          eventTime: b,
          lane: m,
          tag: i.tag,
          payload: i.payload,
          callback: i.callback,
          next: null,
        }),
          d === null ? ((c = d = b), (u = f)) : (d = d.next = b),
          (l |= m));
      if (((i = i.next), i === null)) {
        if (((i = s.shared.pending), i === null)) break;
        ((m = i), (i = m.next), (m.next = null), (s.lastBaseUpdate = m), (s.shared.pending = null));
      }
    } while (!0);
    if (
      (d === null && (u = f),
      (s.baseState = u),
      (s.firstBaseUpdate = c),
      (s.lastBaseUpdate = d),
      (t = s.shared.interleaved),
      t !== null)
    ) {
      s = t;
      do ((l |= s.lane), (s = s.next));
      while (s !== t);
    } else a === null && (s.shared.lanes = 0);
    ((bn |= l), (e.lanes = l), (e.memoizedState = f));
  }
}
function Du(e, t, n) {
  if (((e = t.effects), (t.effects = null), e !== null))
    for (t = 0; t < e.length; t++) {
      var r = e[t],
        s = r.callback;
      if (s !== null) {
        if (((r.callback = null), (r = n), typeof s != 'function')) throw Error(E(191, s));
        s.call(r);
      }
    }
}
var as = {},
  gt = Jt(as),
  Gr = Jt(as),
  Kr = Jt(as);
function fn(e) {
  if (e === as) throw Error(E(174));
  return e;
}
function vi(e, t) {
  switch ((q(Kr, t), q(Gr, e), q(gt, as), (e = t.nodeType), e)) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Ho(null, '');
      break;
    default:
      ((e = e === 8 ? t.parentNode : t),
        (t = e.namespaceURI || null),
        (e = e.tagName),
        (t = Ho(t, e)));
  }
  (J(gt), q(gt, t));
}
function er() {
  (J(gt), J(Gr), J(Kr));
}
function of(e) {
  fn(Kr.current);
  var t = fn(gt.current),
    n = Ho(t, e.type);
  t !== n && (q(Gr, e), q(gt, n));
}
function wi(e) {
  Gr.current === e && (J(gt), J(Gr));
}
var ee = Jt(0);
function ma(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && ((n = n.dehydrated), n === null || n.data === '$?' || n.data === '$!'))
        return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      ((t.child.return = t), (t = t.child));
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    ((t.sibling.return = t.return), (t = t.sibling));
  }
  return null;
}
var xo = [];
function bi() {
  for (var e = 0; e < xo.length; e++) xo[e]._workInProgressVersionPrimary = null;
  xo.length = 0;
}
var Fs = Tt.ReactCurrentDispatcher,
  yo = Tt.ReactCurrentBatchConfig,
  wn = 0,
  ne = null,
  ce = null,
  me = null,
  ha = !1,
  Lr = !1,
  Qr = 0,
  nh = 0;
function be() {
  throw Error(E(321));
}
function ji(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!lt(e[n], t[n])) return !1;
  return !0;
}
function Ni(e, t, n, r, s, a) {
  if (
    ((wn = a),
    (ne = t),
    (t.memoizedState = null),
    (t.updateQueue = null),
    (t.lanes = 0),
    (Fs.current = e === null || e.memoizedState === null ? oh : lh),
    (e = n(r, s)),
    Lr)
  ) {
    a = 0;
    do {
      if (((Lr = !1), (Qr = 0), 25 <= a)) throw Error(E(301));
      ((a += 1), (me = ce = null), (t.updateQueue = null), (Fs.current = ih), (e = n(r, s)));
    } while (Lr);
  }
  if (
    ((Fs.current = ga),
    (t = ce !== null && ce.next !== null),
    (wn = 0),
    (me = ce = ne = null),
    (ha = !1),
    t)
  )
    throw Error(E(300));
  return e;
}
function Si() {
  var e = Qr !== 0;
  return ((Qr = 0), e);
}
function dt() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return (me === null ? (ne.memoizedState = me = e) : (me = me.next = e), me);
}
function et() {
  if (ce === null) {
    var e = ne.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = ce.next;
  var t = me === null ? ne.memoizedState : me.next;
  if (t !== null) ((me = t), (ce = e));
  else {
    if (e === null) throw Error(E(310));
    ((ce = e),
      (e = {
        memoizedState: ce.memoizedState,
        baseState: ce.baseState,
        baseQueue: ce.baseQueue,
        queue: ce.queue,
        next: null,
      }),
      me === null ? (ne.memoizedState = me = e) : (me = me.next = e));
  }
  return me;
}
function qr(e, t) {
  return typeof t == 'function' ? t(e) : t;
}
function vo(e) {
  var t = et(),
    n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = ce,
    s = r.baseQueue,
    a = n.pending;
  if (a !== null) {
    if (s !== null) {
      var l = s.next;
      ((s.next = a.next), (a.next = l));
    }
    ((r.baseQueue = s = a), (n.pending = null));
  }
  if (s !== null) {
    ((a = s.next), (r = r.baseState));
    var i = (l = null),
      u = null,
      c = a;
    do {
      var d = c.lane;
      if ((wn & d) === d)
        (u !== null &&
          (u = u.next =
            {
              lane: 0,
              action: c.action,
              hasEagerState: c.hasEagerState,
              eagerState: c.eagerState,
              next: null,
            }),
          (r = c.hasEagerState ? c.eagerState : e(r, c.action)));
      else {
        var f = {
          lane: d,
          action: c.action,
          hasEagerState: c.hasEagerState,
          eagerState: c.eagerState,
          next: null,
        };
        (u === null ? ((i = u = f), (l = r)) : (u = u.next = f), (ne.lanes |= d), (bn |= d));
      }
      c = c.next;
    } while (c !== null && c !== a);
    (u === null ? (l = r) : (u.next = i),
      lt(r, t.memoizedState) || (Oe = !0),
      (t.memoizedState = r),
      (t.baseState = l),
      (t.baseQueue = u),
      (n.lastRenderedState = r));
  }
  if (((e = n.interleaved), e !== null)) {
    s = e;
    do ((a = s.lane), (ne.lanes |= a), (bn |= a), (s = s.next));
    while (s !== e);
  } else s === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function wo(e) {
  var t = et(),
    n = t.queue;
  if (n === null) throw Error(E(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch,
    s = n.pending,
    a = t.memoizedState;
  if (s !== null) {
    n.pending = null;
    var l = (s = s.next);
    do ((a = e(a, l.action)), (l = l.next));
    while (l !== s);
    (lt(a, t.memoizedState) || (Oe = !0),
      (t.memoizedState = a),
      t.baseQueue === null && (t.baseState = a),
      (n.lastRenderedState = a));
  }
  return [a, r];
}
function lf() {}
function uf(e, t) {
  var n = ne,
    r = et(),
    s = t(),
    a = !lt(r.memoizedState, s);
  if (
    (a && ((r.memoizedState = s), (Oe = !0)),
    (r = r.queue),
    ki(ff.bind(null, n, r, e), [e]),
    r.getSnapshot !== t || a || (me !== null && me.memoizedState.tag & 1))
  ) {
    if (((n.flags |= 2048), Yr(9, df.bind(null, n, r, s, t), void 0, null), ge === null))
      throw Error(E(349));
    wn & 30 || cf(n, t, s);
  }
  return s;
}
function cf(e, t, n) {
  ((e.flags |= 16384),
    (e = { getSnapshot: t, value: n }),
    (t = ne.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }), (ne.updateQueue = t), (t.stores = [e]))
      : ((n = t.stores), n === null ? (t.stores = [e]) : n.push(e)));
}
function df(e, t, n, r) {
  ((t.value = n), (t.getSnapshot = r), pf(t) && mf(e));
}
function ff(e, t, n) {
  return n(function () {
    pf(t) && mf(e);
  });
}
function pf(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !lt(e, n);
  } catch {
    return !0;
  }
}
function mf(e) {
  var t = kt(e, 1);
  t !== null && ot(t, e, 1, -1);
}
function zu(e) {
  var t = dt();
  return (
    typeof e == 'function' && (e = e()),
    (t.memoizedState = t.baseState = e),
    (e = {
      pending: null,
      interleaved: null,
      lanes: 0,
      dispatch: null,
      lastRenderedReducer: qr,
      lastRenderedState: e,
    }),
    (t.queue = e),
    (e = e.dispatch = ah.bind(null, ne, e)),
    [t.memoizedState, e]
  );
}
function Yr(e, t, n, r) {
  return (
    (e = { tag: e, create: t, destroy: n, deps: r, next: null }),
    (t = ne.updateQueue),
    t === null
      ? ((t = { lastEffect: null, stores: null }),
        (ne.updateQueue = t),
        (t.lastEffect = e.next = e))
      : ((n = t.lastEffect),
        n === null
          ? (t.lastEffect = e.next = e)
          : ((r = n.next), (n.next = e), (e.next = r), (t.lastEffect = e))),
    e
  );
}
function hf() {
  return et().memoizedState;
}
function Us(e, t, n, r) {
  var s = dt();
  ((ne.flags |= e), (s.memoizedState = Yr(1 | t, n, void 0, r === void 0 ? null : r)));
}
function Ra(e, t, n, r) {
  var s = et();
  r = r === void 0 ? null : r;
  var a = void 0;
  if (ce !== null) {
    var l = ce.memoizedState;
    if (((a = l.destroy), r !== null && ji(r, l.deps))) {
      s.memoizedState = Yr(t, n, a, r);
      return;
    }
  }
  ((ne.flags |= e), (s.memoizedState = Yr(1 | t, n, a, r)));
}
function $u(e, t) {
  return Us(8390656, 8, e, t);
}
function ki(e, t) {
  return Ra(2048, 8, e, t);
}
function gf(e, t) {
  return Ra(4, 2, e, t);
}
function xf(e, t) {
  return Ra(4, 4, e, t);
}
function yf(e, t) {
  if (typeof t == 'function')
    return (
      (e = e()),
      t(e),
      function () {
        t(null);
      }
    );
  if (t != null)
    return (
      (e = e()),
      (t.current = e),
      function () {
        t.current = null;
      }
    );
}
function vf(e, t, n) {
  return ((n = n != null ? n.concat([e]) : null), Ra(4, 4, yf.bind(null, t, e), n));
}
function Ei() {}
function wf(e, t) {
  var n = et();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ji(t, r[1]) ? r[0] : ((n.memoizedState = [e, t]), e);
}
function bf(e, t) {
  var n = et();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ji(t, r[1])
    ? r[0]
    : ((e = e()), (n.memoizedState = [e, t]), e);
}
function jf(e, t, n) {
  return wn & 21
    ? (lt(n, t) || ((n = Ed()), (ne.lanes |= n), (bn |= n), (e.baseState = !0)), t)
    : (e.baseState && ((e.baseState = !1), (Oe = !0)), (e.memoizedState = n));
}
function rh(e, t) {
  var n = G;
  ((G = n !== 0 && 4 > n ? n : 4), e(!0));
  var r = yo.transition;
  yo.transition = {};
  try {
    (e(!1), t());
  } finally {
    ((G = n), (yo.transition = r));
  }
}
function Nf() {
  return et().memoizedState;
}
function sh(e, t, n) {
  var r = Vt(e);
  if (((n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }), Sf(e)))
    kf(t, n);
  else if (((n = sf(e, t, n, r)), n !== null)) {
    var s = Ae();
    (ot(n, e, r, s), Ef(n, t, r));
  }
}
function ah(e, t, n) {
  var r = Vt(e),
    s = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Sf(e)) kf(t, s);
  else {
    var a = e.alternate;
    if (e.lanes === 0 && (a === null || a.lanes === 0) && ((a = t.lastRenderedReducer), a !== null))
      try {
        var l = t.lastRenderedState,
          i = a(l, n);
        if (((s.hasEagerState = !0), (s.eagerState = i), lt(i, l))) {
          var u = t.interleaved;
          (u === null ? ((s.next = s), xi(t)) : ((s.next = u.next), (u.next = s)),
            (t.interleaved = s));
          return;
        }
      } catch {
      } finally {
      }
    ((n = sf(e, t, s, r)), n !== null && ((s = Ae()), ot(n, e, r, s), Ef(n, t, r)));
  }
}
function Sf(e) {
  var t = e.alternate;
  return e === ne || (t !== null && t === ne);
}
function kf(e, t) {
  Lr = ha = !0;
  var n = e.pending;
  (n === null ? (t.next = t) : ((t.next = n.next), (n.next = t)), (e.pending = t));
}
function Ef(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    ((r &= e.pendingLanes), (n |= r), (t.lanes = n), ri(e, n));
  }
}
var ga = {
    readContext: Ze,
    useCallback: be,
    useContext: be,
    useEffect: be,
    useImperativeHandle: be,
    useInsertionEffect: be,
    useLayoutEffect: be,
    useMemo: be,
    useReducer: be,
    useRef: be,
    useState: be,
    useDebugValue: be,
    useDeferredValue: be,
    useTransition: be,
    useMutableSource: be,
    useSyncExternalStore: be,
    useId: be,
    unstable_isNewReconciler: !1,
  },
  oh = {
    readContext: Ze,
    useCallback: function (e, t) {
      return ((dt().memoizedState = [e, t === void 0 ? null : t]), e);
    },
    useContext: Ze,
    useEffect: $u,
    useImperativeHandle: function (e, t, n) {
      return ((n = n != null ? n.concat([e]) : null), Us(4194308, 4, yf.bind(null, t, e), n));
    },
    useLayoutEffect: function (e, t) {
      return Us(4194308, 4, e, t);
    },
    useInsertionEffect: function (e, t) {
      return Us(4, 2, e, t);
    },
    useMemo: function (e, t) {
      var n = dt();
      return ((t = t === void 0 ? null : t), (e = e()), (n.memoizedState = [e, t]), e);
    },
    useReducer: function (e, t, n) {
      var r = dt();
      return (
        (t = n !== void 0 ? n(t) : t),
        (r.memoizedState = r.baseState = t),
        (e = {
          pending: null,
          interleaved: null,
          lanes: 0,
          dispatch: null,
          lastRenderedReducer: e,
          lastRenderedState: t,
        }),
        (r.queue = e),
        (e = e.dispatch = sh.bind(null, ne, e)),
        [r.memoizedState, e]
      );
    },
    useRef: function (e) {
      var t = dt();
      return ((e = { current: e }), (t.memoizedState = e));
    },
    useState: zu,
    useDebugValue: Ei,
    useDeferredValue: function (e) {
      return (dt().memoizedState = e);
    },
    useTransition: function () {
      var e = zu(!1),
        t = e[0];
      return ((e = rh.bind(null, e[1])), (dt().memoizedState = e), [t, e]);
    },
    useMutableSource: function () {},
    useSyncExternalStore: function (e, t, n) {
      var r = ne,
        s = dt();
      if (X) {
        if (n === void 0) throw Error(E(407));
        n = n();
      } else {
        if (((n = t()), ge === null)) throw Error(E(349));
        wn & 30 || cf(r, t, n);
      }
      s.memoizedState = n;
      var a = { value: n, getSnapshot: t };
      return (
        (s.queue = a),
        $u(ff.bind(null, r, a, e), [e]),
        (r.flags |= 2048),
        Yr(9, df.bind(null, r, a, n, t), void 0, null),
        n
      );
    },
    useId: function () {
      var e = dt(),
        t = ge.identifierPrefix;
      if (X) {
        var n = bt,
          r = wt;
        ((n = (r & ~(1 << (32 - at(r) - 1))).toString(32) + n),
          (t = ':' + t + 'R' + n),
          (n = Qr++),
          0 < n && (t += 'H' + n.toString(32)),
          (t += ':'));
      } else ((n = nh++), (t = ':' + t + 'r' + n.toString(32) + ':'));
      return (e.memoizedState = t);
    },
    unstable_isNewReconciler: !1,
  },
  lh = {
    readContext: Ze,
    useCallback: wf,
    useContext: Ze,
    useEffect: ki,
    useImperativeHandle: vf,
    useInsertionEffect: gf,
    useLayoutEffect: xf,
    useMemo: bf,
    useReducer: vo,
    useRef: hf,
    useState: function () {
      return vo(qr);
    },
    useDebugValue: Ei,
    useDeferredValue: function (e) {
      var t = et();
      return jf(t, ce.memoizedState, e);
    },
    useTransition: function () {
      var e = vo(qr)[0],
        t = et().memoizedState;
      return [e, t];
    },
    useMutableSource: lf,
    useSyncExternalStore: uf,
    useId: Nf,
    unstable_isNewReconciler: !1,
  },
  ih = {
    readContext: Ze,
    useCallback: wf,
    useContext: Ze,
    useEffect: ki,
    useImperativeHandle: vf,
    useInsertionEffect: gf,
    useLayoutEffect: xf,
    useMemo: bf,
    useReducer: wo,
    useRef: hf,
    useState: function () {
      return wo(qr);
    },
    useDebugValue: Ei,
    useDeferredValue: function (e) {
      var t = et();
      return ce === null ? (t.memoizedState = e) : jf(t, ce.memoizedState, e);
    },
    useTransition: function () {
      var e = wo(qr)[0],
        t = et().memoizedState;
      return [e, t];
    },
    useMutableSource: lf,
    useSyncExternalStore: uf,
    useId: Nf,
    unstable_isNewReconciler: !1,
  };
function nt(e, t) {
  if (e && e.defaultProps) {
    ((t = re({}, t)), (e = e.defaultProps));
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function cl(e, t, n, r) {
  ((t = e.memoizedState),
    (n = n(r, t)),
    (n = n == null ? t : re({}, t, n)),
    (e.memoizedState = n),
    e.lanes === 0 && (e.updateQueue.baseState = n));
}
var Ia = {
  isMounted: function (e) {
    return (e = e._reactInternals) ? kn(e) === e : !1;
  },
  enqueueSetState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ae(),
      s = Vt(e),
      a = jt(r, s);
    ((a.payload = t),
      n != null && (a.callback = n),
      (t = Ht(e, a, s)),
      t !== null && (ot(t, e, s, r), Bs(t, e, s)));
  },
  enqueueReplaceState: function (e, t, n) {
    e = e._reactInternals;
    var r = Ae(),
      s = Vt(e),
      a = jt(r, s);
    ((a.tag = 1),
      (a.payload = t),
      n != null && (a.callback = n),
      (t = Ht(e, a, s)),
      t !== null && (ot(t, e, s, r), Bs(t, e, s)));
  },
  enqueueForceUpdate: function (e, t) {
    e = e._reactInternals;
    var n = Ae(),
      r = Vt(e),
      s = jt(n, r);
    ((s.tag = 2),
      t != null && (s.callback = t),
      (t = Ht(e, s, r)),
      t !== null && (ot(t, e, r, n), Bs(t, e, r)));
  },
};
function Bu(e, t, n, r, s, a, l) {
  return (
    (e = e.stateNode),
    typeof e.shouldComponentUpdate == 'function'
      ? e.shouldComponentUpdate(r, a, l)
      : t.prototype && t.prototype.isPureReactComponent
        ? !Ur(n, r) || !Ur(s, a)
        : !0
  );
}
function Cf(e, t, n) {
  var r = !1,
    s = qt,
    a = t.contextType;
  return (
    typeof a == 'object' && a !== null
      ? (a = Ze(a))
      : ((s = De(t) ? yn : Te.current),
        (r = t.contextTypes),
        (a = (r = r != null) ? Jn(e, s) : qt)),
    (t = new t(n, a)),
    (e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null),
    (t.updater = Ia),
    (e.stateNode = t),
    (t._reactInternals = e),
    r &&
      ((e = e.stateNode),
      (e.__reactInternalMemoizedUnmaskedChildContext = s),
      (e.__reactInternalMemoizedMaskedChildContext = a)),
    t
  );
}
function Fu(e, t, n, r) {
  ((e = t.state),
    typeof t.componentWillReceiveProps == 'function' && t.componentWillReceiveProps(n, r),
    typeof t.UNSAFE_componentWillReceiveProps == 'function' &&
      t.UNSAFE_componentWillReceiveProps(n, r),
    t.state !== e && Ia.enqueueReplaceState(t, t.state, null));
}
function dl(e, t, n, r) {
  var s = e.stateNode;
  ((s.props = n), (s.state = e.memoizedState), (s.refs = {}), yi(e));
  var a = t.contextType;
  (typeof a == 'object' && a !== null
    ? (s.context = Ze(a))
    : ((a = De(t) ? yn : Te.current), (s.context = Jn(e, a))),
    (s.state = e.memoizedState),
    (a = t.getDerivedStateFromProps),
    typeof a == 'function' && (cl(e, t, a, n), (s.state = e.memoizedState)),
    typeof t.getDerivedStateFromProps == 'function' ||
      typeof s.getSnapshotBeforeUpdate == 'function' ||
      (typeof s.UNSAFE_componentWillMount != 'function' &&
        typeof s.componentWillMount != 'function') ||
      ((t = s.state),
      typeof s.componentWillMount == 'function' && s.componentWillMount(),
      typeof s.UNSAFE_componentWillMount == 'function' && s.UNSAFE_componentWillMount(),
      t !== s.state && Ia.enqueueReplaceState(s, s.state, null),
      pa(e, n, s, r),
      (s.state = e.memoizedState)),
    typeof s.componentDidMount == 'function' && (e.flags |= 4194308));
}
function tr(e, t) {
  try {
    var n = '',
      r = t;
    do ((n += Mp(r)), (r = r.return));
    while (r);
    var s = n;
  } catch (a) {
    s =
      `
Error generating stack: ` +
      a.message +
      `
` +
      a.stack;
  }
  return { value: e, source: t, stack: s, digest: null };
}
function bo(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function fl(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function () {
      throw n;
    });
  }
}
var uh = typeof WeakMap == 'function' ? WeakMap : Map;
function Tf(e, t, n) {
  ((n = jt(-1, n)), (n.tag = 3), (n.payload = { element: null }));
  var r = t.value;
  return (
    (n.callback = function () {
      (ya || ((ya = !0), (jl = r)), fl(e, t));
    }),
    n
  );
}
function _f(e, t, n) {
  ((n = jt(-1, n)), (n.tag = 3));
  var r = e.type.getDerivedStateFromError;
  if (typeof r == 'function') {
    var s = t.value;
    ((n.payload = function () {
      return r(s);
    }),
      (n.callback = function () {
        fl(e, t);
      }));
  }
  var a = e.stateNode;
  return (
    a !== null &&
      typeof a.componentDidCatch == 'function' &&
      (n.callback = function () {
        (fl(e, t), typeof r != 'function' && (Wt === null ? (Wt = new Set([this])) : Wt.add(this)));
        var l = t.stack;
        this.componentDidCatch(t.value, { componentStack: l !== null ? l : '' });
      }),
    n
  );
}
function Uu(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new uh();
    var s = new Set();
    r.set(t, s);
  } else ((s = r.get(t)), s === void 0 && ((s = new Set()), r.set(t, s)));
  s.has(n) || (s.add(n), (e = Nh.bind(null, e, t, n)), t.then(e, e));
}
function Hu(e) {
  do {
    var t;
    if (
      ((t = e.tag === 13) && ((t = e.memoizedState), (t = t !== null ? t.dehydrated !== null : !0)),
      t)
    )
      return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function Wu(e, t, n, r, s) {
  return e.mode & 1
    ? ((e.flags |= 65536), (e.lanes = s), e)
    : (e === t
        ? (e.flags |= 65536)
        : ((e.flags |= 128),
          (n.flags |= 131072),
          (n.flags &= -52805),
          n.tag === 1 &&
            (n.alternate === null ? (n.tag = 17) : ((t = jt(-1, 1)), (t.tag = 2), Ht(n, t, 1))),
          (n.lanes |= 1)),
      e);
}
var ch = Tt.ReactCurrentOwner,
  Oe = !1;
function _e(e, t, n, r) {
  t.child = e === null ? rf(t, null, n, r) : Zn(t, e.child, n, r);
}
function Vu(e, t, n, r, s) {
  n = n.render;
  var a = t.ref;
  return (
    Qn(t, s),
    (r = Ni(e, t, n, r, a, s)),
    (n = Si()),
    e !== null && !Oe
      ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~s), Et(e, t, s))
      : (X && n && di(t), (t.flags |= 1), _e(e, t, r, s), t.child)
  );
}
function Gu(e, t, n, r, s) {
  if (e === null) {
    var a = n.type;
    return typeof a == 'function' &&
      !Ii(a) &&
      a.defaultProps === void 0 &&
      n.compare === null &&
      n.defaultProps === void 0
      ? ((t.tag = 15), (t.type = a), Af(e, t, a, r, s))
      : ((e = Gs(n.type, null, r, t, t.mode, s)), (e.ref = t.ref), (e.return = t), (t.child = e));
  }
  if (((a = e.child), !(e.lanes & s))) {
    var l = a.memoizedProps;
    if (((n = n.compare), (n = n !== null ? n : Ur), n(l, r) && e.ref === t.ref))
      return Et(e, t, s);
  }
  return ((t.flags |= 1), (e = Gt(a, r)), (e.ref = t.ref), (e.return = t), (t.child = e));
}
function Af(e, t, n, r, s) {
  if (e !== null) {
    var a = e.memoizedProps;
    if (Ur(a, r) && e.ref === t.ref)
      if (((Oe = !1), (t.pendingProps = r = a), (e.lanes & s) !== 0)) e.flags & 131072 && (Oe = !0);
      else return ((t.lanes = e.lanes), Et(e, t, s));
  }
  return pl(e, t, n, r, s);
}
function Lf(e, t, n) {
  var r = t.pendingProps,
    s = r.children,
    a = e !== null ? e.memoizedState : null;
  if (r.mode === 'hidden')
    if (!(t.mode & 1))
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        q(Fn, Ue),
        (Ue |= n));
    else {
      if (!(n & 1073741824))
        return (
          (e = a !== null ? a.baseLanes | n : n),
          (t.lanes = t.childLanes = 1073741824),
          (t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }),
          (t.updateQueue = null),
          q(Fn, Ue),
          (Ue |= e),
          null
        );
      ((t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }),
        (r = a !== null ? a.baseLanes : n),
        q(Fn, Ue),
        (Ue |= r));
    }
  else
    (a !== null ? ((r = a.baseLanes | n), (t.memoizedState = null)) : (r = n),
      q(Fn, Ue),
      (Ue |= r));
  return (_e(e, t, s, n), t.child);
}
function Pf(e, t) {
  var n = t.ref;
  ((e === null && n !== null) || (e !== null && e.ref !== n)) &&
    ((t.flags |= 512), (t.flags |= 2097152));
}
function pl(e, t, n, r, s) {
  var a = De(n) ? yn : Te.current;
  return (
    (a = Jn(t, a)),
    Qn(t, s),
    (n = Ni(e, t, n, r, a, s)),
    (r = Si()),
    e !== null && !Oe
      ? ((t.updateQueue = e.updateQueue), (t.flags &= -2053), (e.lanes &= ~s), Et(e, t, s))
      : (X && r && di(t), (t.flags |= 1), _e(e, t, n, s), t.child)
  );
}
function Ku(e, t, n, r, s) {
  if (De(n)) {
    var a = !0;
    ia(t);
  } else a = !1;
  if ((Qn(t, s), t.stateNode === null)) (Hs(e, t), Cf(t, n, r), dl(t, n, r, s), (r = !0));
  else if (e === null) {
    var l = t.stateNode,
      i = t.memoizedProps;
    l.props = i;
    var u = l.context,
      c = n.contextType;
    typeof c == 'object' && c !== null
      ? (c = Ze(c))
      : ((c = De(n) ? yn : Te.current), (c = Jn(t, c)));
    var d = n.getDerivedStateFromProps,
      f = typeof d == 'function' || typeof l.getSnapshotBeforeUpdate == 'function';
    (f ||
      (typeof l.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof l.componentWillReceiveProps != 'function') ||
      ((i !== r || u !== c) && Fu(t, l, r, c)),
      (Pt = !1));
    var m = t.memoizedState;
    ((l.state = m),
      pa(t, r, l, s),
      (u = t.memoizedState),
      i !== r || m !== u || Me.current || Pt
        ? (typeof d == 'function' && (cl(t, n, d, r), (u = t.memoizedState)),
          (i = Pt || Bu(t, n, i, r, m, u, c))
            ? (f ||
                (typeof l.UNSAFE_componentWillMount != 'function' &&
                  typeof l.componentWillMount != 'function') ||
                (typeof l.componentWillMount == 'function' && l.componentWillMount(),
                typeof l.UNSAFE_componentWillMount == 'function' && l.UNSAFE_componentWillMount()),
              typeof l.componentDidMount == 'function' && (t.flags |= 4194308))
            : (typeof l.componentDidMount == 'function' && (t.flags |= 4194308),
              (t.memoizedProps = r),
              (t.memoizedState = u)),
          (l.props = r),
          (l.state = u),
          (l.context = c),
          (r = i))
        : (typeof l.componentDidMount == 'function' && (t.flags |= 4194308), (r = !1)));
  } else {
    ((l = t.stateNode),
      af(e, t),
      (i = t.memoizedProps),
      (c = t.type === t.elementType ? i : nt(t.type, i)),
      (l.props = c),
      (f = t.pendingProps),
      (m = l.context),
      (u = n.contextType),
      typeof u == 'object' && u !== null
        ? (u = Ze(u))
        : ((u = De(n) ? yn : Te.current), (u = Jn(t, u))));
    var b = n.getDerivedStateFromProps;
    ((d = typeof b == 'function' || typeof l.getSnapshotBeforeUpdate == 'function') ||
      (typeof l.UNSAFE_componentWillReceiveProps != 'function' &&
        typeof l.componentWillReceiveProps != 'function') ||
      ((i !== f || m !== u) && Fu(t, l, r, u)),
      (Pt = !1),
      (m = t.memoizedState),
      (l.state = m),
      pa(t, r, l, s));
    var x = t.memoizedState;
    i !== f || m !== x || Me.current || Pt
      ? (typeof b == 'function' && (cl(t, n, b, r), (x = t.memoizedState)),
        (c = Pt || Bu(t, n, c, r, m, x, u) || !1)
          ? (d ||
              (typeof l.UNSAFE_componentWillUpdate != 'function' &&
                typeof l.componentWillUpdate != 'function') ||
              (typeof l.componentWillUpdate == 'function' && l.componentWillUpdate(r, x, u),
              typeof l.UNSAFE_componentWillUpdate == 'function' &&
                l.UNSAFE_componentWillUpdate(r, x, u)),
            typeof l.componentDidUpdate == 'function' && (t.flags |= 4),
            typeof l.getSnapshotBeforeUpdate == 'function' && (t.flags |= 1024))
          : (typeof l.componentDidUpdate != 'function' ||
              (i === e.memoizedProps && m === e.memoizedState) ||
              (t.flags |= 4),
            typeof l.getSnapshotBeforeUpdate != 'function' ||
              (i === e.memoizedProps && m === e.memoizedState) ||
              (t.flags |= 1024),
            (t.memoizedProps = r),
            (t.memoizedState = x)),
        (l.props = r),
        (l.state = x),
        (l.context = u),
        (r = c))
      : (typeof l.componentDidUpdate != 'function' ||
          (i === e.memoizedProps && m === e.memoizedState) ||
          (t.flags |= 4),
        typeof l.getSnapshotBeforeUpdate != 'function' ||
          (i === e.memoizedProps && m === e.memoizedState) ||
          (t.flags |= 1024),
        (r = !1));
  }
  return ml(e, t, n, r, a, s);
}
function ml(e, t, n, r, s, a) {
  Pf(e, t);
  var l = (t.flags & 128) !== 0;
  if (!r && !l) return (s && Pu(t, n, !1), Et(e, t, a));
  ((r = t.stateNode), (ch.current = t));
  var i = l && typeof n.getDerivedStateFromError != 'function' ? null : r.render();
  return (
    (t.flags |= 1),
    e !== null && l
      ? ((t.child = Zn(t, e.child, null, a)), (t.child = Zn(t, null, i, a)))
      : _e(e, t, i, a),
    (t.memoizedState = r.state),
    s && Pu(t, n, !0),
    t.child
  );
}
function Rf(e) {
  var t = e.stateNode;
  (t.pendingContext
    ? Lu(e, t.pendingContext, t.pendingContext !== t.context)
    : t.context && Lu(e, t.context, !1),
    vi(e, t.containerInfo));
}
function Qu(e, t, n, r, s) {
  return (Xn(), pi(s), (t.flags |= 256), _e(e, t, n, r), t.child);
}
var hl = { dehydrated: null, treeContext: null, retryLane: 0 };
function gl(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function If(e, t, n) {
  var r = t.pendingProps,
    s = ee.current,
    a = !1,
    l = (t.flags & 128) !== 0,
    i;
  if (
    ((i = l) || (i = e !== null && e.memoizedState === null ? !1 : (s & 2) !== 0),
    i ? ((a = !0), (t.flags &= -129)) : (e === null || e.memoizedState !== null) && (s |= 1),
    q(ee, s & 1),
    e === null)
  )
    return (
      il(t),
      (e = t.memoizedState),
      e !== null && ((e = e.dehydrated), e !== null)
        ? (t.mode & 1 ? (e.data === '$!' ? (t.lanes = 8) : (t.lanes = 1073741824)) : (t.lanes = 1),
          null)
        : ((l = r.children),
          (e = r.fallback),
          a
            ? ((r = t.mode),
              (a = t.child),
              (l = { mode: 'hidden', children: l }),
              !(r & 1) && a !== null
                ? ((a.childLanes = 0), (a.pendingProps = l))
                : (a = Da(l, r, 0, null)),
              (e = gn(e, r, n, null)),
              (a.return = t),
              (e.return = t),
              (a.sibling = e),
              (t.child = a),
              (t.child.memoizedState = gl(n)),
              (t.memoizedState = hl),
              e)
            : Ci(t, l))
    );
  if (((s = e.memoizedState), s !== null && ((i = s.dehydrated), i !== null)))
    return dh(e, t, l, r, i, s, n);
  if (a) {
    ((a = r.fallback), (l = t.mode), (s = e.child), (i = s.sibling));
    var u = { mode: 'hidden', children: r.children };
    return (
      !(l & 1) && t.child !== s
        ? ((r = t.child), (r.childLanes = 0), (r.pendingProps = u), (t.deletions = null))
        : ((r = Gt(s, u)), (r.subtreeFlags = s.subtreeFlags & 14680064)),
      i !== null ? (a = Gt(i, a)) : ((a = gn(a, l, n, null)), (a.flags |= 2)),
      (a.return = t),
      (r.return = t),
      (r.sibling = a),
      (t.child = r),
      (r = a),
      (a = t.child),
      (l = e.child.memoizedState),
      (l =
        l === null
          ? gl(n)
          : { baseLanes: l.baseLanes | n, cachePool: null, transitions: l.transitions }),
      (a.memoizedState = l),
      (a.childLanes = e.childLanes & ~n),
      (t.memoizedState = hl),
      r
    );
  }
  return (
    (a = e.child),
    (e = a.sibling),
    (r = Gt(a, { mode: 'visible', children: r.children })),
    !(t.mode & 1) && (r.lanes = n),
    (r.return = t),
    (r.sibling = null),
    e !== null &&
      ((n = t.deletions), n === null ? ((t.deletions = [e]), (t.flags |= 16)) : n.push(e)),
    (t.child = r),
    (t.memoizedState = null),
    r
  );
}
function Ci(e, t) {
  return (
    (t = Da({ mode: 'visible', children: t }, e.mode, 0, null)),
    (t.return = e),
    (e.child = t)
  );
}
function Cs(e, t, n, r) {
  return (
    r !== null && pi(r),
    Zn(t, e.child, null, n),
    (e = Ci(t, t.pendingProps.children)),
    (e.flags |= 2),
    (t.memoizedState = null),
    e
  );
}
function dh(e, t, n, r, s, a, l) {
  if (n)
    return t.flags & 256
      ? ((t.flags &= -257), (r = bo(Error(E(422)))), Cs(e, t, l, r))
      : t.memoizedState !== null
        ? ((t.child = e.child), (t.flags |= 128), null)
        : ((a = r.fallback),
          (s = t.mode),
          (r = Da({ mode: 'visible', children: r.children }, s, 0, null)),
          (a = gn(a, s, l, null)),
          (a.flags |= 2),
          (r.return = t),
          (a.return = t),
          (r.sibling = a),
          (t.child = r),
          t.mode & 1 && Zn(t, e.child, null, l),
          (t.child.memoizedState = gl(l)),
          (t.memoizedState = hl),
          a);
  if (!(t.mode & 1)) return Cs(e, t, l, null);
  if (s.data === '$!') {
    if (((r = s.nextSibling && s.nextSibling.dataset), r)) var i = r.dgst;
    return ((r = i), (a = Error(E(419))), (r = bo(a, r, void 0)), Cs(e, t, l, r));
  }
  if (((i = (l & e.childLanes) !== 0), Oe || i)) {
    if (((r = ge), r !== null)) {
      switch (l & -l) {
        case 4:
          s = 2;
          break;
        case 16:
          s = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          s = 32;
          break;
        case 536870912:
          s = 268435456;
          break;
        default:
          s = 0;
      }
      ((s = s & (r.suspendedLanes | l) ? 0 : s),
        s !== 0 && s !== a.retryLane && ((a.retryLane = s), kt(e, s), ot(r, e, s, -1)));
    }
    return (Ri(), (r = bo(Error(E(421)))), Cs(e, t, l, r));
  }
  return s.data === '$?'
    ? ((t.flags |= 128), (t.child = e.child), (t = Sh.bind(null, e)), (s._reactRetry = t), null)
    : ((e = a.treeContext),
      (He = Ut(s.nextSibling)),
      (We = t),
      (X = !0),
      (st = null),
      e !== null &&
        ((qe[Ye++] = wt),
        (qe[Ye++] = bt),
        (qe[Ye++] = vn),
        (wt = e.id),
        (bt = e.overflow),
        (vn = t)),
      (t = Ci(t, r.children)),
      (t.flags |= 4096),
      t);
}
function qu(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  (r !== null && (r.lanes |= t), ul(e.return, t, n));
}
function jo(e, t, n, r, s) {
  var a = e.memoizedState;
  a === null
    ? (e.memoizedState = {
        isBackwards: t,
        rendering: null,
        renderingStartTime: 0,
        last: r,
        tail: n,
        tailMode: s,
      })
    : ((a.isBackwards = t),
      (a.rendering = null),
      (a.renderingStartTime = 0),
      (a.last = r),
      (a.tail = n),
      (a.tailMode = s));
}
function Of(e, t, n) {
  var r = t.pendingProps,
    s = r.revealOrder,
    a = r.tail;
  if ((_e(e, t, r.children, n), (r = ee.current), r & 2)) ((r = (r & 1) | 2), (t.flags |= 128));
  else {
    if (e !== null && e.flags & 128)
      e: for (e = t.child; e !== null; ) {
        if (e.tag === 13) e.memoizedState !== null && qu(e, n, t);
        else if (e.tag === 19) qu(e, n, t);
        else if (e.child !== null) {
          ((e.child.return = e), (e = e.child));
          continue;
        }
        if (e === t) break e;
        for (; e.sibling === null; ) {
          if (e.return === null || e.return === t) break e;
          e = e.return;
        }
        ((e.sibling.return = e.return), (e = e.sibling));
      }
    r &= 1;
  }
  if ((q(ee, r), !(t.mode & 1))) t.memoizedState = null;
  else
    switch (s) {
      case 'forwards':
        for (n = t.child, s = null; n !== null; )
          ((e = n.alternate), e !== null && ma(e) === null && (s = n), (n = n.sibling));
        ((n = s),
          n === null ? ((s = t.child), (t.child = null)) : ((s = n.sibling), (n.sibling = null)),
          jo(t, !1, s, n, a));
        break;
      case 'backwards':
        for (n = null, s = t.child, t.child = null; s !== null; ) {
          if (((e = s.alternate), e !== null && ma(e) === null)) {
            t.child = s;
            break;
          }
          ((e = s.sibling), (s.sibling = n), (n = s), (s = e));
        }
        jo(t, !0, n, null, a);
        break;
      case 'together':
        jo(t, !1, null, null, void 0);
        break;
      default:
        t.memoizedState = null;
    }
  return t.child;
}
function Hs(e, t) {
  !(t.mode & 1) && e !== null && ((e.alternate = null), (t.alternate = null), (t.flags |= 2));
}
function Et(e, t, n) {
  if ((e !== null && (t.dependencies = e.dependencies), (bn |= t.lanes), !(n & t.childLanes)))
    return null;
  if (e !== null && t.child !== e.child) throw Error(E(153));
  if (t.child !== null) {
    for (e = t.child, n = Gt(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; )
      ((e = e.sibling), (n = n.sibling = Gt(e, e.pendingProps)), (n.return = t));
    n.sibling = null;
  }
  return t.child;
}
function fh(e, t, n) {
  switch (t.tag) {
    case 3:
      (Rf(t), Xn());
      break;
    case 5:
      of(t);
      break;
    case 1:
      De(t.type) && ia(t);
      break;
    case 4:
      vi(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context,
        s = t.memoizedProps.value;
      (q(da, r._currentValue), (r._currentValue = s));
      break;
    case 13:
      if (((r = t.memoizedState), r !== null))
        return r.dehydrated !== null
          ? (q(ee, ee.current & 1), (t.flags |= 128), null)
          : n & t.child.childLanes
            ? If(e, t, n)
            : (q(ee, ee.current & 1), (e = Et(e, t, n)), e !== null ? e.sibling : null);
      q(ee, ee.current & 1);
      break;
    case 19:
      if (((r = (n & t.childLanes) !== 0), e.flags & 128)) {
        if (r) return Of(e, t, n);
        t.flags |= 128;
      }
      if (
        ((s = t.memoizedState),
        s !== null && ((s.rendering = null), (s.tail = null), (s.lastEffect = null)),
        q(ee, ee.current),
        r)
      )
        break;
      return null;
    case 22:
    case 23:
      return ((t.lanes = 0), Lf(e, t, n));
  }
  return Et(e, t, n);
}
var Mf, xl, Df, zf;
Mf = function (e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      ((n.child.return = n), (n = n.child));
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    ((n.sibling.return = n.return), (n = n.sibling));
  }
};
xl = function () {};
Df = function (e, t, n, r) {
  var s = e.memoizedProps;
  if (s !== r) {
    ((e = t.stateNode), fn(gt.current));
    var a = null;
    switch (n) {
      case 'input':
        ((s = $o(e, s)), (r = $o(e, r)), (a = []));
        break;
      case 'select':
        ((s = re({}, s, { value: void 0 })), (r = re({}, r, { value: void 0 })), (a = []));
        break;
      case 'textarea':
        ((s = Uo(e, s)), (r = Uo(e, r)), (a = []));
        break;
      default:
        typeof s.onClick != 'function' && typeof r.onClick == 'function' && (e.onclick = oa);
    }
    Wo(n, r);
    var l;
    n = null;
    for (c in s)
      if (!r.hasOwnProperty(c) && s.hasOwnProperty(c) && s[c] != null)
        if (c === 'style') {
          var i = s[c];
          for (l in i) i.hasOwnProperty(l) && (n || (n = {}), (n[l] = ''));
        } else
          c !== 'dangerouslySetInnerHTML' &&
            c !== 'children' &&
            c !== 'suppressContentEditableWarning' &&
            c !== 'suppressHydrationWarning' &&
            c !== 'autoFocus' &&
            (Or.hasOwnProperty(c) ? a || (a = []) : (a = a || []).push(c, null));
    for (c in r) {
      var u = r[c];
      if (
        ((i = s != null ? s[c] : void 0),
        r.hasOwnProperty(c) && u !== i && (u != null || i != null))
      )
        if (c === 'style')
          if (i) {
            for (l in i)
              !i.hasOwnProperty(l) || (u && u.hasOwnProperty(l)) || (n || (n = {}), (n[l] = ''));
            for (l in u) u.hasOwnProperty(l) && i[l] !== u[l] && (n || (n = {}), (n[l] = u[l]));
          } else (n || (a || (a = []), a.push(c, n)), (n = u));
        else
          c === 'dangerouslySetInnerHTML'
            ? ((u = u ? u.__html : void 0),
              (i = i ? i.__html : void 0),
              u != null && i !== u && (a = a || []).push(c, u))
            : c === 'children'
              ? (typeof u != 'string' && typeof u != 'number') || (a = a || []).push(c, '' + u)
              : c !== 'suppressContentEditableWarning' &&
                c !== 'suppressHydrationWarning' &&
                (Or.hasOwnProperty(c)
                  ? (u != null && c === 'onScroll' && Y('scroll', e), a || i === u || (a = []))
                  : (a = a || []).push(c, u));
    }
    n && (a = a || []).push('style', n);
    var c = a;
    (t.updateQueue = c) && (t.flags |= 4);
  }
};
zf = function (e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function yr(e, t) {
  if (!X)
    switch (e.tailMode) {
      case 'hidden':
        t = e.tail;
        for (var n = null; t !== null; ) (t.alternate !== null && (n = t), (t = t.sibling));
        n === null ? (e.tail = null) : (n.sibling = null);
        break;
      case 'collapsed':
        n = e.tail;
        for (var r = null; n !== null; ) (n.alternate !== null && (r = n), (n = n.sibling));
        r === null
          ? t || e.tail === null
            ? (e.tail = null)
            : (e.tail.sibling = null)
          : (r.sibling = null);
    }
}
function je(e) {
  var t = e.alternate !== null && e.alternate.child === e.child,
    n = 0,
    r = 0;
  if (t)
    for (var s = e.child; s !== null; )
      ((n |= s.lanes | s.childLanes),
        (r |= s.subtreeFlags & 14680064),
        (r |= s.flags & 14680064),
        (s.return = e),
        (s = s.sibling));
  else
    for (s = e.child; s !== null; )
      ((n |= s.lanes | s.childLanes),
        (r |= s.subtreeFlags),
        (r |= s.flags),
        (s.return = e),
        (s = s.sibling));
  return ((e.subtreeFlags |= r), (e.childLanes = n), t);
}
function ph(e, t, n) {
  var r = t.pendingProps;
  switch ((fi(t), t.tag)) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return (je(t), null);
    case 1:
      return (De(t.type) && la(), je(t), null);
    case 3:
      return (
        (r = t.stateNode),
        er(),
        J(Me),
        J(Te),
        bi(),
        r.pendingContext && ((r.context = r.pendingContext), (r.pendingContext = null)),
        (e === null || e.child === null) &&
          (ks(t)
            ? (t.flags |= 4)
            : e === null ||
              (e.memoizedState.isDehydrated && !(t.flags & 256)) ||
              ((t.flags |= 1024), st !== null && (kl(st), (st = null)))),
        xl(e, t),
        je(t),
        null
      );
    case 5:
      wi(t);
      var s = fn(Kr.current);
      if (((n = t.type), e !== null && t.stateNode != null))
        (Df(e, t, n, r, s), e.ref !== t.ref && ((t.flags |= 512), (t.flags |= 2097152)));
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(E(166));
          return (je(t), null);
        }
        if (((e = fn(gt.current)), ks(t))) {
          ((r = t.stateNode), (n = t.type));
          var a = t.memoizedProps;
          switch (((r[pt] = t), (r[Vr] = a), (e = (t.mode & 1) !== 0), n)) {
            case 'dialog':
              (Y('cancel', r), Y('close', r));
              break;
            case 'iframe':
            case 'object':
            case 'embed':
              Y('load', r);
              break;
            case 'video':
            case 'audio':
              for (s = 0; s < kr.length; s++) Y(kr[s], r);
              break;
            case 'source':
              Y('error', r);
              break;
            case 'img':
            case 'image':
            case 'link':
              (Y('error', r), Y('load', r));
              break;
            case 'details':
              Y('toggle', r);
              break;
            case 'input':
              (su(r, a), Y('invalid', r));
              break;
            case 'select':
              ((r._wrapperState = { wasMultiple: !!a.multiple }), Y('invalid', r));
              break;
            case 'textarea':
              (ou(r, a), Y('invalid', r));
          }
          (Wo(n, a), (s = null));
          for (var l in a)
            if (a.hasOwnProperty(l)) {
              var i = a[l];
              l === 'children'
                ? typeof i == 'string'
                  ? r.textContent !== i &&
                    (a.suppressHydrationWarning !== !0 && Ss(r.textContent, i, e),
                    (s = ['children', i]))
                  : typeof i == 'number' &&
                    r.textContent !== '' + i &&
                    (a.suppressHydrationWarning !== !0 && Ss(r.textContent, i, e),
                    (s = ['children', '' + i]))
                : Or.hasOwnProperty(l) && i != null && l === 'onScroll' && Y('scroll', r);
            }
          switch (n) {
            case 'input':
              (gs(r), au(r, a, !0));
              break;
            case 'textarea':
              (gs(r), lu(r));
              break;
            case 'select':
            case 'option':
              break;
            default:
              typeof a.onClick == 'function' && (r.onclick = oa);
          }
          ((r = s), (t.updateQueue = r), r !== null && (t.flags |= 4));
        } else {
          ((l = s.nodeType === 9 ? s : s.ownerDocument),
            e === 'http://www.w3.org/1999/xhtml' && (e = dd(n)),
            e === 'http://www.w3.org/1999/xhtml'
              ? n === 'script'
                ? ((e = l.createElement('div')),
                  (e.innerHTML = '<script><\/script>'),
                  (e = e.removeChild(e.firstChild)))
                : typeof r.is == 'string'
                  ? (e = l.createElement(n, { is: r.is }))
                  : ((e = l.createElement(n)),
                    n === 'select' &&
                      ((l = e), r.multiple ? (l.multiple = !0) : r.size && (l.size = r.size)))
              : (e = l.createElementNS(e, n)),
            (e[pt] = t),
            (e[Vr] = r),
            Mf(e, t, !1, !1),
            (t.stateNode = e));
          e: {
            switch (((l = Vo(n, r)), n)) {
              case 'dialog':
                (Y('cancel', e), Y('close', e), (s = r));
                break;
              case 'iframe':
              case 'object':
              case 'embed':
                (Y('load', e), (s = r));
                break;
              case 'video':
              case 'audio':
                for (s = 0; s < kr.length; s++) Y(kr[s], e);
                s = r;
                break;
              case 'source':
                (Y('error', e), (s = r));
                break;
              case 'img':
              case 'image':
              case 'link':
                (Y('error', e), Y('load', e), (s = r));
                break;
              case 'details':
                (Y('toggle', e), (s = r));
                break;
              case 'input':
                (su(e, r), (s = $o(e, r)), Y('invalid', e));
                break;
              case 'option':
                s = r;
                break;
              case 'select':
                ((e._wrapperState = { wasMultiple: !!r.multiple }),
                  (s = re({}, r, { value: void 0 })),
                  Y('invalid', e));
                break;
              case 'textarea':
                (ou(e, r), (s = Uo(e, r)), Y('invalid', e));
                break;
              default:
                s = r;
            }
            (Wo(n, s), (i = s));
            for (a in i)
              if (i.hasOwnProperty(a)) {
                var u = i[a];
                a === 'style'
                  ? md(e, u)
                  : a === 'dangerouslySetInnerHTML'
                    ? ((u = u ? u.__html : void 0), u != null && fd(e, u))
                    : a === 'children'
                      ? typeof u == 'string'
                        ? (n !== 'textarea' || u !== '') && Mr(e, u)
                        : typeof u == 'number' && Mr(e, '' + u)
                      : a !== 'suppressContentEditableWarning' &&
                        a !== 'suppressHydrationWarning' &&
                        a !== 'autoFocus' &&
                        (Or.hasOwnProperty(a)
                          ? u != null && a === 'onScroll' && Y('scroll', e)
                          : u != null && Jl(e, a, u, l));
              }
            switch (n) {
              case 'input':
                (gs(e), au(e, r, !1));
                break;
              case 'textarea':
                (gs(e), lu(e));
                break;
              case 'option':
                r.value != null && e.setAttribute('value', '' + Qt(r.value));
                break;
              case 'select':
                ((e.multiple = !!r.multiple),
                  (a = r.value),
                  a != null
                    ? Wn(e, !!r.multiple, a, !1)
                    : r.defaultValue != null && Wn(e, !!r.multiple, r.defaultValue, !0));
                break;
              default:
                typeof s.onClick == 'function' && (e.onclick = oa);
            }
            switch (n) {
              case 'button':
              case 'input':
              case 'select':
              case 'textarea':
                r = !!r.autoFocus;
                break e;
              case 'img':
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && ((t.flags |= 512), (t.flags |= 2097152));
      }
      return (je(t), null);
    case 6:
      if (e && t.stateNode != null) zf(e, t, e.memoizedProps, r);
      else {
        if (typeof r != 'string' && t.stateNode === null) throw Error(E(166));
        if (((n = fn(Kr.current)), fn(gt.current), ks(t))) {
          if (
            ((r = t.stateNode),
            (n = t.memoizedProps),
            (r[pt] = t),
            (a = r.nodeValue !== n) && ((e = We), e !== null))
          )
            switch (e.tag) {
              case 3:
                Ss(r.nodeValue, n, (e.mode & 1) !== 0);
                break;
              case 5:
                e.memoizedProps.suppressHydrationWarning !== !0 &&
                  Ss(r.nodeValue, n, (e.mode & 1) !== 0);
            }
          a && (t.flags |= 4);
        } else
          ((r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r)),
            (r[pt] = t),
            (t.stateNode = r));
      }
      return (je(t), null);
    case 13:
      if (
        (J(ee),
        (r = t.memoizedState),
        e === null || (e.memoizedState !== null && e.memoizedState.dehydrated !== null))
      ) {
        if (X && He !== null && t.mode & 1 && !(t.flags & 128))
          (tf(), Xn(), (t.flags |= 98560), (a = !1));
        else if (((a = ks(t)), r !== null && r.dehydrated !== null)) {
          if (e === null) {
            if (!a) throw Error(E(318));
            if (((a = t.memoizedState), (a = a !== null ? a.dehydrated : null), !a))
              throw Error(E(317));
            a[pt] = t;
          } else (Xn(), !(t.flags & 128) && (t.memoizedState = null), (t.flags |= 4));
          (je(t), (a = !1));
        } else (st !== null && (kl(st), (st = null)), (a = !0));
        if (!a) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128
        ? ((t.lanes = n), t)
        : ((r = r !== null),
          r !== (e !== null && e.memoizedState !== null) &&
            r &&
            ((t.child.flags |= 8192),
            t.mode & 1 && (e === null || ee.current & 1 ? fe === 0 && (fe = 3) : Ri())),
          t.updateQueue !== null && (t.flags |= 4),
          je(t),
          null);
    case 4:
      return (er(), xl(e, t), e === null && Hr(t.stateNode.containerInfo), je(t), null);
    case 10:
      return (gi(t.type._context), je(t), null);
    case 17:
      return (De(t.type) && la(), je(t), null);
    case 19:
      if ((J(ee), (a = t.memoizedState), a === null)) return (je(t), null);
      if (((r = (t.flags & 128) !== 0), (l = a.rendering), l === null))
        if (r) yr(a, !1);
        else {
          if (fe !== 0 || (e !== null && e.flags & 128))
            for (e = t.child; e !== null; ) {
              if (((l = ma(e)), l !== null)) {
                for (
                  t.flags |= 128,
                    yr(a, !1),
                    r = l.updateQueue,
                    r !== null && ((t.updateQueue = r), (t.flags |= 4)),
                    t.subtreeFlags = 0,
                    r = n,
                    n = t.child;
                  n !== null;
                )
                  ((a = n),
                    (e = r),
                    (a.flags &= 14680066),
                    (l = a.alternate),
                    l === null
                      ? ((a.childLanes = 0),
                        (a.lanes = e),
                        (a.child = null),
                        (a.subtreeFlags = 0),
                        (a.memoizedProps = null),
                        (a.memoizedState = null),
                        (a.updateQueue = null),
                        (a.dependencies = null),
                        (a.stateNode = null))
                      : ((a.childLanes = l.childLanes),
                        (a.lanes = l.lanes),
                        (a.child = l.child),
                        (a.subtreeFlags = 0),
                        (a.deletions = null),
                        (a.memoizedProps = l.memoizedProps),
                        (a.memoizedState = l.memoizedState),
                        (a.updateQueue = l.updateQueue),
                        (a.type = l.type),
                        (e = l.dependencies),
                        (a.dependencies =
                          e === null ? null : { lanes: e.lanes, firstContext: e.firstContext })),
                    (n = n.sibling));
                return (q(ee, (ee.current & 1) | 2), t.child);
              }
              e = e.sibling;
            }
          a.tail !== null &&
            ae() > nr &&
            ((t.flags |= 128), (r = !0), yr(a, !1), (t.lanes = 4194304));
        }
      else {
        if (!r)
          if (((e = ma(l)), e !== null)) {
            if (
              ((t.flags |= 128),
              (r = !0),
              (n = e.updateQueue),
              n !== null && ((t.updateQueue = n), (t.flags |= 4)),
              yr(a, !0),
              a.tail === null && a.tailMode === 'hidden' && !l.alternate && !X)
            )
              return (je(t), null);
          } else
            2 * ae() - a.renderingStartTime > nr &&
              n !== 1073741824 &&
              ((t.flags |= 128), (r = !0), yr(a, !1), (t.lanes = 4194304));
        a.isBackwards
          ? ((l.sibling = t.child), (t.child = l))
          : ((n = a.last), n !== null ? (n.sibling = l) : (t.child = l), (a.last = l));
      }
      return a.tail !== null
        ? ((t = a.tail),
          (a.rendering = t),
          (a.tail = t.sibling),
          (a.renderingStartTime = ae()),
          (t.sibling = null),
          (n = ee.current),
          q(ee, r ? (n & 1) | 2 : n & 1),
          t)
        : (je(t), null);
    case 22:
    case 23:
      return (
        Pi(),
        (r = t.memoizedState !== null),
        e !== null && (e.memoizedState !== null) !== r && (t.flags |= 8192),
        r && t.mode & 1
          ? Ue & 1073741824 && (je(t), t.subtreeFlags & 6 && (t.flags |= 8192))
          : je(t),
        null
      );
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(E(156, t.tag));
}
function mh(e, t) {
  switch ((fi(t), t.tag)) {
    case 1:
      return (
        De(t.type) && la(),
        (e = t.flags),
        e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 3:
      return (
        er(),
        J(Me),
        J(Te),
        bi(),
        (e = t.flags),
        e & 65536 && !(e & 128) ? ((t.flags = (e & -65537) | 128), t) : null
      );
    case 5:
      return (wi(t), null);
    case 13:
      if ((J(ee), (e = t.memoizedState), e !== null && e.dehydrated !== null)) {
        if (t.alternate === null) throw Error(E(340));
        Xn();
      }
      return ((e = t.flags), e & 65536 ? ((t.flags = (e & -65537) | 128), t) : null);
    case 19:
      return (J(ee), null);
    case 4:
      return (er(), null);
    case 10:
      return (gi(t.type._context), null);
    case 22:
    case 23:
      return (Pi(), null);
    case 24:
      return null;
    default:
      return null;
  }
}
var Ts = !1,
  Se = !1,
  hh = typeof WeakSet == 'function' ? WeakSet : Set,
  L = null;
function Bn(e, t) {
  var n = e.ref;
  if (n !== null)
    if (typeof n == 'function')
      try {
        n(null);
      } catch (r) {
        se(e, t, r);
      }
    else n.current = null;
}
function yl(e, t, n) {
  try {
    n();
  } catch (r) {
    se(e, t, r);
  }
}
var Yu = !1;
function gh(e, t) {
  if (((tl = ra), (e = Ud()), ci(e))) {
    if ('selectionStart' in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else
      e: {
        n = ((n = e.ownerDocument) && n.defaultView) || window;
        var r = n.getSelection && n.getSelection();
        if (r && r.rangeCount !== 0) {
          n = r.anchorNode;
          var s = r.anchorOffset,
            a = r.focusNode;
          r = r.focusOffset;
          try {
            (n.nodeType, a.nodeType);
          } catch {
            n = null;
            break e;
          }
          var l = 0,
            i = -1,
            u = -1,
            c = 0,
            d = 0,
            f = e,
            m = null;
          t: for (;;) {
            for (
              var b;
              f !== n || (s !== 0 && f.nodeType !== 3) || (i = l + s),
                f !== a || (r !== 0 && f.nodeType !== 3) || (u = l + r),
                f.nodeType === 3 && (l += f.nodeValue.length),
                (b = f.firstChild) !== null;
            )
              ((m = f), (f = b));
            for (;;) {
              if (f === e) break t;
              if (
                (m === n && ++c === s && (i = l),
                m === a && ++d === r && (u = l),
                (b = f.nextSibling) !== null)
              )
                break;
              ((f = m), (m = f.parentNode));
            }
            f = b;
          }
          n = i === -1 || u === -1 ? null : { start: i, end: u };
        } else n = null;
      }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (nl = { focusedElem: e, selectionRange: n }, ra = !1, L = t; L !== null; )
    if (((t = L), (e = t.child), (t.subtreeFlags & 1028) !== 0 && e !== null))
      ((e.return = t), (L = e));
    else
      for (; L !== null; ) {
        t = L;
        try {
          var x = t.alternate;
          if (t.flags & 1024)
            switch (t.tag) {
              case 0:
              case 11:
              case 15:
                break;
              case 1:
                if (x !== null) {
                  var w = x.memoizedProps,
                    v = x.memoizedState,
                    h = t.stateNode,
                    p = h.getSnapshotBeforeUpdate(t.elementType === t.type ? w : nt(t.type, w), v);
                  h.__reactInternalSnapshotBeforeUpdate = p;
                }
                break;
              case 3:
                var g = t.stateNode.containerInfo;
                g.nodeType === 1
                  ? (g.textContent = '')
                  : g.nodeType === 9 && g.documentElement && g.removeChild(g.documentElement);
                break;
              case 5:
              case 6:
              case 4:
              case 17:
                break;
              default:
                throw Error(E(163));
            }
        } catch (j) {
          se(t, t.return, j);
        }
        if (((e = t.sibling), e !== null)) {
          ((e.return = t.return), (L = e));
          break;
        }
        L = t.return;
      }
  return ((x = Yu), (Yu = !1), x);
}
function Pr(e, t, n) {
  var r = t.updateQueue;
  if (((r = r !== null ? r.lastEffect : null), r !== null)) {
    var s = (r = r.next);
    do {
      if ((s.tag & e) === e) {
        var a = s.destroy;
        ((s.destroy = void 0), a !== void 0 && yl(t, n, a));
      }
      s = s.next;
    } while (s !== r);
  }
}
function Oa(e, t) {
  if (((t = t.updateQueue), (t = t !== null ? t.lastEffect : null), t !== null)) {
    var n = (t = t.next);
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function vl(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == 'function' ? t(e) : (t.current = e);
  }
}
function $f(e) {
  var t = e.alternate;
  (t !== null && ((e.alternate = null), $f(t)),
    (e.child = null),
    (e.deletions = null),
    (e.sibling = null),
    e.tag === 5 &&
      ((t = e.stateNode),
      t !== null && (delete t[pt], delete t[Vr], delete t[al], delete t[Xm], delete t[Zm])),
    (e.stateNode = null),
    (e.return = null),
    (e.dependencies = null),
    (e.memoizedProps = null),
    (e.memoizedState = null),
    (e.pendingProps = null),
    (e.stateNode = null),
    (e.updateQueue = null));
}
function Bf(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Ju(e) {
  e: for (;;) {
    for (; e.sibling === null; ) {
      if (e.return === null || Bf(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      ((e.child.return = e), (e = e.child));
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function wl(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6)
    ((e = e.stateNode),
      t
        ? n.nodeType === 8
          ? n.parentNode.insertBefore(e, t)
          : n.insertBefore(e, t)
        : (n.nodeType === 8
            ? ((t = n.parentNode), t.insertBefore(e, n))
            : ((t = n), t.appendChild(e)),
          (n = n._reactRootContainer),
          n != null || t.onclick !== null || (t.onclick = oa)));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (wl(e, t, n), e = e.sibling; e !== null; ) (wl(e, t, n), (e = e.sibling));
}
function bl(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) ((e = e.stateNode), t ? n.insertBefore(e, t) : n.appendChild(e));
  else if (r !== 4 && ((e = e.child), e !== null))
    for (bl(e, t, n), e = e.sibling; e !== null; ) (bl(e, t, n), (e = e.sibling));
}
var ye = null,
  rt = !1;
function _t(e, t, n) {
  for (n = n.child; n !== null; ) (Ff(e, t, n), (n = n.sibling));
}
function Ff(e, t, n) {
  if (ht && typeof ht.onCommitFiberUnmount == 'function')
    try {
      ht.onCommitFiberUnmount(Ca, n);
    } catch {}
  switch (n.tag) {
    case 5:
      Se || Bn(n, t);
    case 6:
      var r = ye,
        s = rt;
      ((ye = null),
        _t(e, t, n),
        (ye = r),
        (rt = s),
        ye !== null &&
          (rt
            ? ((e = ye),
              (n = n.stateNode),
              e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n))
            : ye.removeChild(n.stateNode)));
      break;
    case 18:
      ye !== null &&
        (rt
          ? ((e = ye),
            (n = n.stateNode),
            e.nodeType === 8 ? ho(e.parentNode, n) : e.nodeType === 1 && ho(e, n),
            Br(e))
          : ho(ye, n.stateNode));
      break;
    case 4:
      ((r = ye),
        (s = rt),
        (ye = n.stateNode.containerInfo),
        (rt = !0),
        _t(e, t, n),
        (ye = r),
        (rt = s));
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!Se && ((r = n.updateQueue), r !== null && ((r = r.lastEffect), r !== null))) {
        s = r = r.next;
        do {
          var a = s,
            l = a.destroy;
          ((a = a.tag), l !== void 0 && (a & 2 || a & 4) && yl(n, t, l), (s = s.next));
        } while (s !== r);
      }
      _t(e, t, n);
      break;
    case 1:
      if (!Se && (Bn(n, t), (r = n.stateNode), typeof r.componentWillUnmount == 'function'))
        try {
          ((r.props = n.memoizedProps), (r.state = n.memoizedState), r.componentWillUnmount());
        } catch (i) {
          se(n, t, i);
        }
      _t(e, t, n);
      break;
    case 21:
      _t(e, t, n);
      break;
    case 22:
      n.mode & 1
        ? ((Se = (r = Se) || n.memoizedState !== null), _t(e, t, n), (Se = r))
        : _t(e, t, n);
      break;
    default:
      _t(e, t, n);
  }
}
function Xu(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    (n === null && (n = e.stateNode = new hh()),
      t.forEach(function (r) {
        var s = kh.bind(null, e, r);
        n.has(r) || (n.add(r), r.then(s, s));
      }));
  }
}
function tt(e, t) {
  var n = t.deletions;
  if (n !== null)
    for (var r = 0; r < n.length; r++) {
      var s = n[r];
      try {
        var a = e,
          l = t,
          i = l;
        e: for (; i !== null; ) {
          switch (i.tag) {
            case 5:
              ((ye = i.stateNode), (rt = !1));
              break e;
            case 3:
              ((ye = i.stateNode.containerInfo), (rt = !0));
              break e;
            case 4:
              ((ye = i.stateNode.containerInfo), (rt = !0));
              break e;
          }
          i = i.return;
        }
        if (ye === null) throw Error(E(160));
        (Ff(a, l, s), (ye = null), (rt = !1));
        var u = s.alternate;
        (u !== null && (u.return = null), (s.return = null));
      } catch (c) {
        se(s, t, c);
      }
    }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) (Uf(t, e), (t = t.sibling));
}
function Uf(e, t) {
  var n = e.alternate,
    r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if ((tt(t, e), ut(e), r & 4)) {
        try {
          (Pr(3, e, e.return), Oa(3, e));
        } catch (w) {
          se(e, e.return, w);
        }
        try {
          Pr(5, e, e.return);
        } catch (w) {
          se(e, e.return, w);
        }
      }
      break;
    case 1:
      (tt(t, e), ut(e), r & 512 && n !== null && Bn(n, n.return));
      break;
    case 5:
      if ((tt(t, e), ut(e), r & 512 && n !== null && Bn(n, n.return), e.flags & 32)) {
        var s = e.stateNode;
        try {
          Mr(s, '');
        } catch (w) {
          se(e, e.return, w);
        }
      }
      if (r & 4 && ((s = e.stateNode), s != null)) {
        var a = e.memoizedProps,
          l = n !== null ? n.memoizedProps : a,
          i = e.type,
          u = e.updateQueue;
        if (((e.updateQueue = null), u !== null))
          try {
            (i === 'input' && a.type === 'radio' && a.name != null && ud(s, a), Vo(i, l));
            var c = Vo(i, a);
            for (l = 0; l < u.length; l += 2) {
              var d = u[l],
                f = u[l + 1];
              d === 'style'
                ? md(s, f)
                : d === 'dangerouslySetInnerHTML'
                  ? fd(s, f)
                  : d === 'children'
                    ? Mr(s, f)
                    : Jl(s, d, f, c);
            }
            switch (i) {
              case 'input':
                Bo(s, a);
                break;
              case 'textarea':
                cd(s, a);
                break;
              case 'select':
                var m = s._wrapperState.wasMultiple;
                s._wrapperState.wasMultiple = !!a.multiple;
                var b = a.value;
                b != null
                  ? Wn(s, !!a.multiple, b, !1)
                  : m !== !!a.multiple &&
                    (a.defaultValue != null
                      ? Wn(s, !!a.multiple, a.defaultValue, !0)
                      : Wn(s, !!a.multiple, a.multiple ? [] : '', !1));
            }
            s[Vr] = a;
          } catch (w) {
            se(e, e.return, w);
          }
      }
      break;
    case 6:
      if ((tt(t, e), ut(e), r & 4)) {
        if (e.stateNode === null) throw Error(E(162));
        ((s = e.stateNode), (a = e.memoizedProps));
        try {
          s.nodeValue = a;
        } catch (w) {
          se(e, e.return, w);
        }
      }
      break;
    case 3:
      if ((tt(t, e), ut(e), r & 4 && n !== null && n.memoizedState.isDehydrated))
        try {
          Br(t.containerInfo);
        } catch (w) {
          se(e, e.return, w);
        }
      break;
    case 4:
      (tt(t, e), ut(e));
      break;
    case 13:
      (tt(t, e),
        ut(e),
        (s = e.child),
        s.flags & 8192 &&
          ((a = s.memoizedState !== null),
          (s.stateNode.isHidden = a),
          !a || (s.alternate !== null && s.alternate.memoizedState !== null) || (Ai = ae())),
        r & 4 && Xu(e));
      break;
    case 22:
      if (
        ((d = n !== null && n.memoizedState !== null),
        e.mode & 1 ? ((Se = (c = Se) || d), tt(t, e), (Se = c)) : tt(t, e),
        ut(e),
        r & 8192)
      ) {
        if (((c = e.memoizedState !== null), (e.stateNode.isHidden = c) && !d && e.mode & 1))
          for (L = e, d = e.child; d !== null; ) {
            for (f = L = d; L !== null; ) {
              switch (((m = L), (b = m.child), m.tag)) {
                case 0:
                case 11:
                case 14:
                case 15:
                  Pr(4, m, m.return);
                  break;
                case 1:
                  Bn(m, m.return);
                  var x = m.stateNode;
                  if (typeof x.componentWillUnmount == 'function') {
                    ((r = m), (n = m.return));
                    try {
                      ((t = r),
                        (x.props = t.memoizedProps),
                        (x.state = t.memoizedState),
                        x.componentWillUnmount());
                    } catch (w) {
                      se(r, n, w);
                    }
                  }
                  break;
                case 5:
                  Bn(m, m.return);
                  break;
                case 22:
                  if (m.memoizedState !== null) {
                    ec(f);
                    continue;
                  }
              }
              b !== null ? ((b.return = m), (L = b)) : ec(f);
            }
            d = d.sibling;
          }
        e: for (d = null, f = e; ; ) {
          if (f.tag === 5) {
            if (d === null) {
              d = f;
              try {
                ((s = f.stateNode),
                  c
                    ? ((a = s.style),
                      typeof a.setProperty == 'function'
                        ? a.setProperty('display', 'none', 'important')
                        : (a.display = 'none'))
                    : ((i = f.stateNode),
                      (u = f.memoizedProps.style),
                      (l = u != null && u.hasOwnProperty('display') ? u.display : null),
                      (i.style.display = pd('display', l))));
              } catch (w) {
                se(e, e.return, w);
              }
            }
          } else if (f.tag === 6) {
            if (d === null)
              try {
                f.stateNode.nodeValue = c ? '' : f.memoizedProps;
              } catch (w) {
                se(e, e.return, w);
              }
          } else if (
            ((f.tag !== 22 && f.tag !== 23) || f.memoizedState === null || f === e) &&
            f.child !== null
          ) {
            ((f.child.return = f), (f = f.child));
            continue;
          }
          if (f === e) break e;
          for (; f.sibling === null; ) {
            if (f.return === null || f.return === e) break e;
            (d === f && (d = null), (f = f.return));
          }
          (d === f && (d = null), (f.sibling.return = f.return), (f = f.sibling));
        }
      }
      break;
    case 19:
      (tt(t, e), ut(e), r & 4 && Xu(e));
      break;
    case 21:
      break;
    default:
      (tt(t, e), ut(e));
  }
}
function ut(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (Bf(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(E(160));
      }
      switch (r.tag) {
        case 5:
          var s = r.stateNode;
          r.flags & 32 && (Mr(s, ''), (r.flags &= -33));
          var a = Ju(e);
          bl(e, a, s);
          break;
        case 3:
        case 4:
          var l = r.stateNode.containerInfo,
            i = Ju(e);
          wl(e, i, l);
          break;
        default:
          throw Error(E(161));
      }
    } catch (u) {
      se(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function xh(e, t, n) {
  ((L = e), Hf(e));
}
function Hf(e, t, n) {
  for (var r = (e.mode & 1) !== 0; L !== null; ) {
    var s = L,
      a = s.child;
    if (s.tag === 22 && r) {
      var l = s.memoizedState !== null || Ts;
      if (!l) {
        var i = s.alternate,
          u = (i !== null && i.memoizedState !== null) || Se;
        i = Ts;
        var c = Se;
        if (((Ts = l), (Se = u) && !c))
          for (L = s; L !== null; )
            ((l = L),
              (u = l.child),
              l.tag === 22 && l.memoizedState !== null
                ? tc(s)
                : u !== null
                  ? ((u.return = l), (L = u))
                  : tc(s));
        for (; a !== null; ) ((L = a), Hf(a), (a = a.sibling));
        ((L = s), (Ts = i), (Se = c));
      }
      Zu(e);
    } else s.subtreeFlags & 8772 && a !== null ? ((a.return = s), (L = a)) : Zu(e);
  }
}
function Zu(e) {
  for (; L !== null; ) {
    var t = L;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772)
          switch (t.tag) {
            case 0:
            case 11:
            case 15:
              Se || Oa(5, t);
              break;
            case 1:
              var r = t.stateNode;
              if (t.flags & 4 && !Se)
                if (n === null) r.componentDidMount();
                else {
                  var s = t.elementType === t.type ? n.memoizedProps : nt(t.type, n.memoizedProps);
                  r.componentDidUpdate(s, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
                }
              var a = t.updateQueue;
              a !== null && Du(t, a, r);
              break;
            case 3:
              var l = t.updateQueue;
              if (l !== null) {
                if (((n = null), t.child !== null))
                  switch (t.child.tag) {
                    case 5:
                      n = t.child.stateNode;
                      break;
                    case 1:
                      n = t.child.stateNode;
                  }
                Du(t, l, n);
              }
              break;
            case 5:
              var i = t.stateNode;
              if (n === null && t.flags & 4) {
                n = i;
                var u = t.memoizedProps;
                switch (t.type) {
                  case 'button':
                  case 'input':
                  case 'select':
                  case 'textarea':
                    u.autoFocus && n.focus();
                    break;
                  case 'img':
                    u.src && (n.src = u.src);
                }
              }
              break;
            case 6:
              break;
            case 4:
              break;
            case 12:
              break;
            case 13:
              if (t.memoizedState === null) {
                var c = t.alternate;
                if (c !== null) {
                  var d = c.memoizedState;
                  if (d !== null) {
                    var f = d.dehydrated;
                    f !== null && Br(f);
                  }
                }
              }
              break;
            case 19:
            case 17:
            case 21:
            case 22:
            case 23:
            case 25:
              break;
            default:
              throw Error(E(163));
          }
        Se || (t.flags & 512 && vl(t));
      } catch (m) {
        se(t, t.return, m);
      }
    }
    if (t === e) {
      L = null;
      break;
    }
    if (((n = t.sibling), n !== null)) {
      ((n.return = t.return), (L = n));
      break;
    }
    L = t.return;
  }
}
function ec(e) {
  for (; L !== null; ) {
    var t = L;
    if (t === e) {
      L = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      ((n.return = t.return), (L = n));
      break;
    }
    L = t.return;
  }
}
function tc(e) {
  for (; L !== null; ) {
    var t = L;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Oa(4, t);
          } catch (u) {
            se(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == 'function') {
            var s = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              se(t, s, u);
            }
          }
          var a = t.return;
          try {
            vl(t);
          } catch (u) {
            se(t, a, u);
          }
          break;
        case 5:
          var l = t.return;
          try {
            vl(t);
          } catch (u) {
            se(t, l, u);
          }
      }
    } catch (u) {
      se(t, t.return, u);
    }
    if (t === e) {
      L = null;
      break;
    }
    var i = t.sibling;
    if (i !== null) {
      ((i.return = t.return), (L = i));
      break;
    }
    L = t.return;
  }
}
var yh = Math.ceil,
  xa = Tt.ReactCurrentDispatcher,
  Ti = Tt.ReactCurrentOwner,
  Xe = Tt.ReactCurrentBatchConfig,
  V = 0,
  ge = null,
  le = null,
  ve = 0,
  Ue = 0,
  Fn = Jt(0),
  fe = 0,
  Jr = null,
  bn = 0,
  Ma = 0,
  _i = 0,
  Rr = null,
  Ie = null,
  Ai = 0,
  nr = 1 / 0,
  yt = null,
  ya = !1,
  jl = null,
  Wt = null,
  _s = !1,
  Dt = null,
  va = 0,
  Ir = 0,
  Nl = null,
  Ws = -1,
  Vs = 0;
function Ae() {
  return V & 6 ? ae() : Ws !== -1 ? Ws : (Ws = ae());
}
function Vt(e) {
  return e.mode & 1
    ? V & 2 && ve !== 0
      ? ve & -ve
      : th.transition !== null
        ? (Vs === 0 && (Vs = Ed()), Vs)
        : ((e = G), e !== 0 || ((e = window.event), (e = e === void 0 ? 16 : Rd(e.type))), e)
    : 1;
}
function ot(e, t, n, r) {
  if (50 < Ir) throw ((Ir = 0), (Nl = null), Error(E(185)));
  (ns(e, n, r),
    (!(V & 2) || e !== ge) &&
      (e === ge && (!(V & 2) && (Ma |= n), fe === 4 && It(e, ve)),
      ze(e, r),
      n === 1 && V === 0 && !(t.mode & 1) && ((nr = ae() + 500), Pa && Xt())));
}
function ze(e, t) {
  var n = e.callbackNode;
  tm(e, t);
  var r = na(e, e === ge ? ve : 0);
  if (r === 0) (n !== null && cu(n), (e.callbackNode = null), (e.callbackPriority = 0));
  else if (((t = r & -r), e.callbackPriority !== t)) {
    if ((n != null && cu(n), t === 1))
      (e.tag === 0 ? eh(nc.bind(null, e)) : Xd(nc.bind(null, e)),
        Ym(function () {
          !(V & 6) && Xt();
        }),
        (n = null));
    else {
      switch (Cd(r)) {
        case 1:
          n = ni;
          break;
        case 4:
          n = Sd;
          break;
        case 16:
          n = ta;
          break;
        case 536870912:
          n = kd;
          break;
        default:
          n = ta;
      }
      n = Jf(n, Wf.bind(null, e));
    }
    ((e.callbackPriority = t), (e.callbackNode = n));
  }
}
function Wf(e, t) {
  if (((Ws = -1), (Vs = 0), V & 6)) throw Error(E(327));
  var n = e.callbackNode;
  if (qn() && e.callbackNode !== n) return null;
  var r = na(e, e === ge ? ve : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = wa(e, r);
  else {
    t = r;
    var s = V;
    V |= 2;
    var a = Gf();
    (ge !== e || ve !== t) && ((yt = null), (nr = ae() + 500), hn(e, t));
    do
      try {
        bh();
        break;
      } catch (i) {
        Vf(e, i);
      }
    while (!0);
    (hi(), (xa.current = a), (V = s), le !== null ? (t = 0) : ((ge = null), (ve = 0), (t = fe)));
  }
  if (t !== 0) {
    if ((t === 2 && ((s = Yo(e)), s !== 0 && ((r = s), (t = Sl(e, s)))), t === 1))
      throw ((n = Jr), hn(e, 0), It(e, r), ze(e, ae()), n);
    if (t === 6) It(e, r);
    else {
      if (
        ((s = e.current.alternate),
        !(r & 30) &&
          !vh(s) &&
          ((t = wa(e, r)), t === 2 && ((a = Yo(e)), a !== 0 && ((r = a), (t = Sl(e, a)))), t === 1))
      )
        throw ((n = Jr), hn(e, 0), It(e, r), ze(e, ae()), n);
      switch (((e.finishedWork = s), (e.finishedLanes = r), t)) {
        case 0:
        case 1:
          throw Error(E(345));
        case 2:
          sn(e, Ie, yt);
          break;
        case 3:
          if ((It(e, r), (r & 130023424) === r && ((t = Ai + 500 - ae()), 10 < t))) {
            if (na(e, 0) !== 0) break;
            if (((s = e.suspendedLanes), (s & r) !== r)) {
              (Ae(), (e.pingedLanes |= e.suspendedLanes & s));
              break;
            }
            e.timeoutHandle = sl(sn.bind(null, e, Ie, yt), t);
            break;
          }
          sn(e, Ie, yt);
          break;
        case 4:
          if ((It(e, r), (r & 4194240) === r)) break;
          for (t = e.eventTimes, s = -1; 0 < r; ) {
            var l = 31 - at(r);
            ((a = 1 << l), (l = t[l]), l > s && (s = l), (r &= ~a));
          }
          if (
            ((r = s),
            (r = ae() - r),
            (r =
              (120 > r
                ? 120
                : 480 > r
                  ? 480
                  : 1080 > r
                    ? 1080
                    : 1920 > r
                      ? 1920
                      : 3e3 > r
                        ? 3e3
                        : 4320 > r
                          ? 4320
                          : 1960 * yh(r / 1960)) - r),
            10 < r)
          ) {
            e.timeoutHandle = sl(sn.bind(null, e, Ie, yt), r);
            break;
          }
          sn(e, Ie, yt);
          break;
        case 5:
          sn(e, Ie, yt);
          break;
        default:
          throw Error(E(329));
      }
    }
  }
  return (ze(e, ae()), e.callbackNode === n ? Wf.bind(null, e) : null);
}
function Sl(e, t) {
  var n = Rr;
  return (
    e.current.memoizedState.isDehydrated && (hn(e, t).flags |= 256),
    (e = wa(e, t)),
    e !== 2 && ((t = Ie), (Ie = n), t !== null && kl(t)),
    e
  );
}
function kl(e) {
  Ie === null ? (Ie = e) : Ie.push.apply(Ie, e);
}
function vh(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && ((n = n.stores), n !== null))
        for (var r = 0; r < n.length; r++) {
          var s = n[r],
            a = s.getSnapshot;
          s = s.value;
          try {
            if (!lt(a(), s)) return !1;
          } catch {
            return !1;
          }
        }
    }
    if (((n = t.child), t.subtreeFlags & 16384 && n !== null)) ((n.return = t), (t = n));
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      ((t.sibling.return = t.return), (t = t.sibling));
    }
  }
  return !0;
}
function It(e, t) {
  for (
    t &= ~_i, t &= ~Ma, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes;
    0 < t;
  ) {
    var n = 31 - at(t),
      r = 1 << n;
    ((e[n] = -1), (t &= ~r));
  }
}
function nc(e) {
  if (V & 6) throw Error(E(327));
  qn();
  var t = na(e, 0);
  if (!(t & 1)) return (ze(e, ae()), null);
  var n = wa(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Yo(e);
    r !== 0 && ((t = r), (n = Sl(e, r)));
  }
  if (n === 1) throw ((n = Jr), hn(e, 0), It(e, t), ze(e, ae()), n);
  if (n === 6) throw Error(E(345));
  return (
    (e.finishedWork = e.current.alternate),
    (e.finishedLanes = t),
    sn(e, Ie, yt),
    ze(e, ae()),
    null
  );
}
function Li(e, t) {
  var n = V;
  V |= 1;
  try {
    return e(t);
  } finally {
    ((V = n), V === 0 && ((nr = ae() + 500), Pa && Xt()));
  }
}
function jn(e) {
  Dt !== null && Dt.tag === 0 && !(V & 6) && qn();
  var t = V;
  V |= 1;
  var n = Xe.transition,
    r = G;
  try {
    if (((Xe.transition = null), (G = 1), e)) return e();
  } finally {
    ((G = r), (Xe.transition = n), (V = t), !(V & 6) && Xt());
  }
}
function Pi() {
  ((Ue = Fn.current), J(Fn));
}
function hn(e, t) {
  ((e.finishedWork = null), (e.finishedLanes = 0));
  var n = e.timeoutHandle;
  if ((n !== -1 && ((e.timeoutHandle = -1), qm(n)), le !== null))
    for (n = le.return; n !== null; ) {
      var r = n;
      switch ((fi(r), r.tag)) {
        case 1:
          ((r = r.type.childContextTypes), r != null && la());
          break;
        case 3:
          (er(), J(Me), J(Te), bi());
          break;
        case 5:
          wi(r);
          break;
        case 4:
          er();
          break;
        case 13:
          J(ee);
          break;
        case 19:
          J(ee);
          break;
        case 10:
          gi(r.type._context);
          break;
        case 22:
        case 23:
          Pi();
      }
      n = n.return;
    }
  if (
    ((ge = e),
    (le = e = Gt(e.current, null)),
    (ve = Ue = t),
    (fe = 0),
    (Jr = null),
    (_i = Ma = bn = 0),
    (Ie = Rr = null),
    dn !== null)
  ) {
    for (t = 0; t < dn.length; t++)
      if (((n = dn[t]), (r = n.interleaved), r !== null)) {
        n.interleaved = null;
        var s = r.next,
          a = n.pending;
        if (a !== null) {
          var l = a.next;
          ((a.next = s), (r.next = l));
        }
        n.pending = r;
      }
    dn = null;
  }
  return e;
}
function Vf(e, t) {
  do {
    var n = le;
    try {
      if ((hi(), (Fs.current = ga), ha)) {
        for (var r = ne.memoizedState; r !== null; ) {
          var s = r.queue;
          (s !== null && (s.pending = null), (r = r.next));
        }
        ha = !1;
      }
      if (
        ((wn = 0),
        (me = ce = ne = null),
        (Lr = !1),
        (Qr = 0),
        (Ti.current = null),
        n === null || n.return === null)
      ) {
        ((fe = 1), (Jr = t), (le = null));
        break;
      }
      e: {
        var a = e,
          l = n.return,
          i = n,
          u = t;
        if (
          ((t = ve),
          (i.flags |= 32768),
          u !== null && typeof u == 'object' && typeof u.then == 'function')
        ) {
          var c = u,
            d = i,
            f = d.tag;
          if (!(d.mode & 1) && (f === 0 || f === 11 || f === 15)) {
            var m = d.alternate;
            m
              ? ((d.updateQueue = m.updateQueue),
                (d.memoizedState = m.memoizedState),
                (d.lanes = m.lanes))
              : ((d.updateQueue = null), (d.memoizedState = null));
          }
          var b = Hu(l);
          if (b !== null) {
            ((b.flags &= -257), Wu(b, l, i, a, t), b.mode & 1 && Uu(a, c, t), (t = b), (u = c));
            var x = t.updateQueue;
            if (x === null) {
              var w = new Set();
              (w.add(u), (t.updateQueue = w));
            } else x.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              (Uu(a, c, t), Ri());
              break e;
            }
            u = Error(E(426));
          }
        } else if (X && i.mode & 1) {
          var v = Hu(l);
          if (v !== null) {
            (!(v.flags & 65536) && (v.flags |= 256), Wu(v, l, i, a, t), pi(tr(u, i)));
            break e;
          }
        }
        ((a = u = tr(u, i)), fe !== 4 && (fe = 2), Rr === null ? (Rr = [a]) : Rr.push(a), (a = l));
        do {
          switch (a.tag) {
            case 3:
              ((a.flags |= 65536), (t &= -t), (a.lanes |= t));
              var h = Tf(a, u, t);
              Mu(a, h);
              break e;
            case 1:
              i = u;
              var p = a.type,
                g = a.stateNode;
              if (
                !(a.flags & 128) &&
                (typeof p.getDerivedStateFromError == 'function' ||
                  (g !== null &&
                    typeof g.componentDidCatch == 'function' &&
                    (Wt === null || !Wt.has(g))))
              ) {
                ((a.flags |= 65536), (t &= -t), (a.lanes |= t));
                var j = _f(a, i, t);
                Mu(a, j);
                break e;
              }
          }
          a = a.return;
        } while (a !== null);
      }
      Qf(n);
    } catch (k) {
      ((t = k), le === n && n !== null && (le = n = n.return));
      continue;
    }
    break;
  } while (!0);
}
function Gf() {
  var e = xa.current;
  return ((xa.current = ga), e === null ? ga : e);
}
function Ri() {
  ((fe === 0 || fe === 3 || fe === 2) && (fe = 4),
    ge === null || (!(bn & 268435455) && !(Ma & 268435455)) || It(ge, ve));
}
function wa(e, t) {
  var n = V;
  V |= 2;
  var r = Gf();
  (ge !== e || ve !== t) && ((yt = null), hn(e, t));
  do
    try {
      wh();
      break;
    } catch (s) {
      Vf(e, s);
    }
  while (!0);
  if ((hi(), (V = n), (xa.current = r), le !== null)) throw Error(E(261));
  return ((ge = null), (ve = 0), fe);
}
function wh() {
  for (; le !== null; ) Kf(le);
}
function bh() {
  for (; le !== null && !Gp(); ) Kf(le);
}
function Kf(e) {
  var t = Yf(e.alternate, e, Ue);
  ((e.memoizedProps = e.pendingProps), t === null ? Qf(e) : (le = t), (Ti.current = null));
}
function Qf(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (((e = t.return), t.flags & 32768)) {
      if (((n = mh(n, t)), n !== null)) {
        ((n.flags &= 32767), (le = n));
        return;
      }
      if (e !== null) ((e.flags |= 32768), (e.subtreeFlags = 0), (e.deletions = null));
      else {
        ((fe = 6), (le = null));
        return;
      }
    } else if (((n = ph(n, t, Ue)), n !== null)) {
      le = n;
      return;
    }
    if (((t = t.sibling), t !== null)) {
      le = t;
      return;
    }
    le = t = e;
  } while (t !== null);
  fe === 0 && (fe = 5);
}
function sn(e, t, n) {
  var r = G,
    s = Xe.transition;
  try {
    ((Xe.transition = null), (G = 1), jh(e, t, n, r));
  } finally {
    ((Xe.transition = s), (G = r));
  }
  return null;
}
function jh(e, t, n, r) {
  do qn();
  while (Dt !== null);
  if (V & 6) throw Error(E(327));
  n = e.finishedWork;
  var s = e.finishedLanes;
  if (n === null) return null;
  if (((e.finishedWork = null), (e.finishedLanes = 0), n === e.current)) throw Error(E(177));
  ((e.callbackNode = null), (e.callbackPriority = 0));
  var a = n.lanes | n.childLanes;
  if (
    (nm(e, a),
    e === ge && ((le = ge = null), (ve = 0)),
    (!(n.subtreeFlags & 2064) && !(n.flags & 2064)) ||
      _s ||
      ((_s = !0),
      Jf(ta, function () {
        return (qn(), null);
      })),
    (a = (n.flags & 15990) !== 0),
    n.subtreeFlags & 15990 || a)
  ) {
    ((a = Xe.transition), (Xe.transition = null));
    var l = G;
    G = 1;
    var i = V;
    ((V |= 4),
      (Ti.current = null),
      gh(e, n),
      Uf(n, e),
      Um(nl),
      (ra = !!tl),
      (nl = tl = null),
      (e.current = n),
      xh(n),
      Kp(),
      (V = i),
      (G = l),
      (Xe.transition = a));
  } else e.current = n;
  if (
    (_s && ((_s = !1), (Dt = e), (va = s)),
    (a = e.pendingLanes),
    a === 0 && (Wt = null),
    Yp(n.stateNode),
    ze(e, ae()),
    t !== null)
  )
    for (r = e.onRecoverableError, n = 0; n < t.length; n++)
      ((s = t[n]), r(s.value, { componentStack: s.stack, digest: s.digest }));
  if (ya) throw ((ya = !1), (e = jl), (jl = null), e);
  return (
    va & 1 && e.tag !== 0 && qn(),
    (a = e.pendingLanes),
    a & 1 ? (e === Nl ? Ir++ : ((Ir = 0), (Nl = e))) : (Ir = 0),
    Xt(),
    null
  );
}
function qn() {
  if (Dt !== null) {
    var e = Cd(va),
      t = Xe.transition,
      n = G;
    try {
      if (((Xe.transition = null), (G = 16 > e ? 16 : e), Dt === null)) var r = !1;
      else {
        if (((e = Dt), (Dt = null), (va = 0), V & 6)) throw Error(E(331));
        var s = V;
        for (V |= 4, L = e.current; L !== null; ) {
          var a = L,
            l = a.child;
          if (L.flags & 16) {
            var i = a.deletions;
            if (i !== null) {
              for (var u = 0; u < i.length; u++) {
                var c = i[u];
                for (L = c; L !== null; ) {
                  var d = L;
                  switch (d.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Pr(8, d, a);
                  }
                  var f = d.child;
                  if (f !== null) ((f.return = d), (L = f));
                  else
                    for (; L !== null; ) {
                      d = L;
                      var m = d.sibling,
                        b = d.return;
                      if (($f(d), d === c)) {
                        L = null;
                        break;
                      }
                      if (m !== null) {
                        ((m.return = b), (L = m));
                        break;
                      }
                      L = b;
                    }
                }
              }
              var x = a.alternate;
              if (x !== null) {
                var w = x.child;
                if (w !== null) {
                  x.child = null;
                  do {
                    var v = w.sibling;
                    ((w.sibling = null), (w = v));
                  } while (w !== null);
                }
              }
              L = a;
            }
          }
          if (a.subtreeFlags & 2064 && l !== null) ((l.return = a), (L = l));
          else
            e: for (; L !== null; ) {
              if (((a = L), a.flags & 2048))
                switch (a.tag) {
                  case 0:
                  case 11:
                  case 15:
                    Pr(9, a, a.return);
                }
              var h = a.sibling;
              if (h !== null) {
                ((h.return = a.return), (L = h));
                break e;
              }
              L = a.return;
            }
        }
        var p = e.current;
        for (L = p; L !== null; ) {
          l = L;
          var g = l.child;
          if (l.subtreeFlags & 2064 && g !== null) ((g.return = l), (L = g));
          else
            e: for (l = p; L !== null; ) {
              if (((i = L), i.flags & 2048))
                try {
                  switch (i.tag) {
                    case 0:
                    case 11:
                    case 15:
                      Oa(9, i);
                  }
                } catch (k) {
                  se(i, i.return, k);
                }
              if (i === l) {
                L = null;
                break e;
              }
              var j = i.sibling;
              if (j !== null) {
                ((j.return = i.return), (L = j));
                break e;
              }
              L = i.return;
            }
        }
        if (((V = s), Xt(), ht && typeof ht.onPostCommitFiberRoot == 'function'))
          try {
            ht.onPostCommitFiberRoot(Ca, e);
          } catch {}
        r = !0;
      }
      return r;
    } finally {
      ((G = n), (Xe.transition = t));
    }
  }
  return !1;
}
function rc(e, t, n) {
  ((t = tr(n, t)),
    (t = Tf(e, t, 1)),
    (e = Ht(e, t, 1)),
    (t = Ae()),
    e !== null && (ns(e, 1, t), ze(e, t)));
}
function se(e, t, n) {
  if (e.tag === 3) rc(e, e, n);
  else
    for (; t !== null; ) {
      if (t.tag === 3) {
        rc(t, e, n);
        break;
      } else if (t.tag === 1) {
        var r = t.stateNode;
        if (
          typeof t.type.getDerivedStateFromError == 'function' ||
          (typeof r.componentDidCatch == 'function' && (Wt === null || !Wt.has(r)))
        ) {
          ((e = tr(n, e)),
            (e = _f(t, e, 1)),
            (t = Ht(t, e, 1)),
            (e = Ae()),
            t !== null && (ns(t, 1, e), ze(t, e)));
          break;
        }
      }
      t = t.return;
    }
}
function Nh(e, t, n) {
  var r = e.pingCache;
  (r !== null && r.delete(t),
    (t = Ae()),
    (e.pingedLanes |= e.suspendedLanes & n),
    ge === e &&
      (ve & n) === n &&
      (fe === 4 || (fe === 3 && (ve & 130023424) === ve && 500 > ae() - Ai) ? hn(e, 0) : (_i |= n)),
    ze(e, t));
}
function qf(e, t) {
  t === 0 && (e.mode & 1 ? ((t = vs), (vs <<= 1), !(vs & 130023424) && (vs = 4194304)) : (t = 1));
  var n = Ae();
  ((e = kt(e, t)), e !== null && (ns(e, t, n), ze(e, n)));
}
function Sh(e) {
  var t = e.memoizedState,
    n = 0;
  (t !== null && (n = t.retryLane), qf(e, n));
}
function kh(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode,
        s = e.memoizedState;
      s !== null && (n = s.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(E(314));
  }
  (r !== null && r.delete(t), qf(e, n));
}
var Yf;
Yf = function (e, t, n) {
  if (e !== null)
    if (e.memoizedProps !== t.pendingProps || Me.current) Oe = !0;
    else {
      if (!(e.lanes & n) && !(t.flags & 128)) return ((Oe = !1), fh(e, t, n));
      Oe = !!(e.flags & 131072);
    }
  else ((Oe = !1), X && t.flags & 1048576 && Zd(t, ca, t.index));
  switch (((t.lanes = 0), t.tag)) {
    case 2:
      var r = t.type;
      (Hs(e, t), (e = t.pendingProps));
      var s = Jn(t, Te.current);
      (Qn(t, n), (s = Ni(null, t, r, e, s, n)));
      var a = Si();
      return (
        (t.flags |= 1),
        typeof s == 'object' && s !== null && typeof s.render == 'function' && s.$$typeof === void 0
          ? ((t.tag = 1),
            (t.memoizedState = null),
            (t.updateQueue = null),
            De(r) ? ((a = !0), ia(t)) : (a = !1),
            (t.memoizedState = s.state !== null && s.state !== void 0 ? s.state : null),
            yi(t),
            (s.updater = Ia),
            (t.stateNode = s),
            (s._reactInternals = t),
            dl(t, r, e, n),
            (t = ml(null, t, r, !0, a, n)))
          : ((t.tag = 0), X && a && di(t), _e(null, t, s, n), (t = t.child)),
        t
      );
    case 16:
      r = t.elementType;
      e: {
        switch (
          (Hs(e, t),
          (e = t.pendingProps),
          (s = r._init),
          (r = s(r._payload)),
          (t.type = r),
          (s = t.tag = Ch(r)),
          (e = nt(r, e)),
          s)
        ) {
          case 0:
            t = pl(null, t, r, e, n);
            break e;
          case 1:
            t = Ku(null, t, r, e, n);
            break e;
          case 11:
            t = Vu(null, t, r, e, n);
            break e;
          case 14:
            t = Gu(null, t, r, nt(r.type, e), n);
            break e;
        }
        throw Error(E(306, r, ''));
      }
      return t;
    case 0:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : nt(r, s)),
        pl(e, t, r, s, n)
      );
    case 1:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : nt(r, s)),
        Ku(e, t, r, s, n)
      );
    case 3:
      e: {
        if ((Rf(t), e === null)) throw Error(E(387));
        ((r = t.pendingProps), (a = t.memoizedState), (s = a.element), af(e, t), pa(t, r, null, n));
        var l = t.memoizedState;
        if (((r = l.element), a.isDehydrated))
          if (
            ((a = {
              element: r,
              isDehydrated: !1,
              cache: l.cache,
              pendingSuspenseBoundaries: l.pendingSuspenseBoundaries,
              transitions: l.transitions,
            }),
            (t.updateQueue.baseState = a),
            (t.memoizedState = a),
            t.flags & 256)
          ) {
            ((s = tr(Error(E(423)), t)), (t = Qu(e, t, r, n, s)));
            break e;
          } else if (r !== s) {
            ((s = tr(Error(E(424)), t)), (t = Qu(e, t, r, n, s)));
            break e;
          } else
            for (
              He = Ut(t.stateNode.containerInfo.firstChild),
                We = t,
                X = !0,
                st = null,
                n = rf(t, null, r, n),
                t.child = n;
              n;
            )
              ((n.flags = (n.flags & -3) | 4096), (n = n.sibling));
        else {
          if ((Xn(), r === s)) {
            t = Et(e, t, n);
            break e;
          }
          _e(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return (
        of(t),
        e === null && il(t),
        (r = t.type),
        (s = t.pendingProps),
        (a = e !== null ? e.memoizedProps : null),
        (l = s.children),
        rl(r, s) ? (l = null) : a !== null && rl(r, a) && (t.flags |= 32),
        Pf(e, t),
        _e(e, t, l, n),
        t.child
      );
    case 6:
      return (e === null && il(t), null);
    case 13:
      return If(e, t, n);
    case 4:
      return (
        vi(t, t.stateNode.containerInfo),
        (r = t.pendingProps),
        e === null ? (t.child = Zn(t, null, r, n)) : _e(e, t, r, n),
        t.child
      );
    case 11:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : nt(r, s)),
        Vu(e, t, r, s, n)
      );
    case 7:
      return (_e(e, t, t.pendingProps, n), t.child);
    case 8:
      return (_e(e, t, t.pendingProps.children, n), t.child);
    case 12:
      return (_e(e, t, t.pendingProps.children, n), t.child);
    case 10:
      e: {
        if (
          ((r = t.type._context),
          (s = t.pendingProps),
          (a = t.memoizedProps),
          (l = s.value),
          q(da, r._currentValue),
          (r._currentValue = l),
          a !== null)
        )
          if (lt(a.value, l)) {
            if (a.children === s.children && !Me.current) {
              t = Et(e, t, n);
              break e;
            }
          } else
            for (a = t.child, a !== null && (a.return = t); a !== null; ) {
              var i = a.dependencies;
              if (i !== null) {
                l = a.child;
                for (var u = i.firstContext; u !== null; ) {
                  if (u.context === r) {
                    if (a.tag === 1) {
                      ((u = jt(-1, n & -n)), (u.tag = 2));
                      var c = a.updateQueue;
                      if (c !== null) {
                        c = c.shared;
                        var d = c.pending;
                        (d === null ? (u.next = u) : ((u.next = d.next), (d.next = u)),
                          (c.pending = u));
                      }
                    }
                    ((a.lanes |= n),
                      (u = a.alternate),
                      u !== null && (u.lanes |= n),
                      ul(a.return, n, t),
                      (i.lanes |= n));
                    break;
                  }
                  u = u.next;
                }
              } else if (a.tag === 10) l = a.type === t.type ? null : a.child;
              else if (a.tag === 18) {
                if (((l = a.return), l === null)) throw Error(E(341));
                ((l.lanes |= n),
                  (i = l.alternate),
                  i !== null && (i.lanes |= n),
                  ul(l, n, t),
                  (l = a.sibling));
              } else l = a.child;
              if (l !== null) l.return = a;
              else
                for (l = a; l !== null; ) {
                  if (l === t) {
                    l = null;
                    break;
                  }
                  if (((a = l.sibling), a !== null)) {
                    ((a.return = l.return), (l = a));
                    break;
                  }
                  l = l.return;
                }
              a = l;
            }
        (_e(e, t, s.children, n), (t = t.child));
      }
      return t;
    case 9:
      return (
        (s = t.type),
        (r = t.pendingProps.children),
        Qn(t, n),
        (s = Ze(s)),
        (r = r(s)),
        (t.flags |= 1),
        _e(e, t, r, n),
        t.child
      );
    case 14:
      return ((r = t.type), (s = nt(r, t.pendingProps)), (s = nt(r.type, s)), Gu(e, t, r, s, n));
    case 15:
      return Af(e, t, t.type, t.pendingProps, n);
    case 17:
      return (
        (r = t.type),
        (s = t.pendingProps),
        (s = t.elementType === r ? s : nt(r, s)),
        Hs(e, t),
        (t.tag = 1),
        De(r) ? ((e = !0), ia(t)) : (e = !1),
        Qn(t, n),
        Cf(t, r, s),
        dl(t, r, s, n),
        ml(null, t, r, !0, e, n)
      );
    case 19:
      return Of(e, t, n);
    case 22:
      return Lf(e, t, n);
  }
  throw Error(E(156, t.tag));
};
function Jf(e, t) {
  return Nd(e, t);
}
function Eh(e, t, n, r) {
  ((this.tag = e),
    (this.key = n),
    (this.sibling =
      this.child =
      this.return =
      this.stateNode =
      this.type =
      this.elementType =
        null),
    (this.index = 0),
    (this.ref = null),
    (this.pendingProps = t),
    (this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null),
    (this.mode = r),
    (this.subtreeFlags = this.flags = 0),
    (this.deletions = null),
    (this.childLanes = this.lanes = 0),
    (this.alternate = null));
}
function Je(e, t, n, r) {
  return new Eh(e, t, n, r);
}
function Ii(e) {
  return ((e = e.prototype), !(!e || !e.isReactComponent));
}
function Ch(e) {
  if (typeof e == 'function') return Ii(e) ? 1 : 0;
  if (e != null) {
    if (((e = e.$$typeof), e === Zl)) return 11;
    if (e === ei) return 14;
  }
  return 2;
}
function Gt(e, t) {
  var n = e.alternate;
  return (
    n === null
      ? ((n = Je(e.tag, t, e.key, e.mode)),
        (n.elementType = e.elementType),
        (n.type = e.type),
        (n.stateNode = e.stateNode),
        (n.alternate = e),
        (e.alternate = n))
      : ((n.pendingProps = t),
        (n.type = e.type),
        (n.flags = 0),
        (n.subtreeFlags = 0),
        (n.deletions = null)),
    (n.flags = e.flags & 14680064),
    (n.childLanes = e.childLanes),
    (n.lanes = e.lanes),
    (n.child = e.child),
    (n.memoizedProps = e.memoizedProps),
    (n.memoizedState = e.memoizedState),
    (n.updateQueue = e.updateQueue),
    (t = e.dependencies),
    (n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }),
    (n.sibling = e.sibling),
    (n.index = e.index),
    (n.ref = e.ref),
    n
  );
}
function Gs(e, t, n, r, s, a) {
  var l = 2;
  if (((r = e), typeof e == 'function')) Ii(e) && (l = 1);
  else if (typeof e == 'string') l = 5;
  else
    e: switch (e) {
      case Ln:
        return gn(n.children, s, a, t);
      case Xl:
        ((l = 8), (s |= 8));
        break;
      case Oo:
        return ((e = Je(12, n, t, s | 2)), (e.elementType = Oo), (e.lanes = a), e);
      case Mo:
        return ((e = Je(13, n, t, s)), (e.elementType = Mo), (e.lanes = a), e);
      case Do:
        return ((e = Je(19, n, t, s)), (e.elementType = Do), (e.lanes = a), e);
      case od:
        return Da(n, s, a, t);
      default:
        if (typeof e == 'object' && e !== null)
          switch (e.$$typeof) {
            case sd:
              l = 10;
              break e;
            case ad:
              l = 9;
              break e;
            case Zl:
              l = 11;
              break e;
            case ei:
              l = 14;
              break e;
            case Lt:
              ((l = 16), (r = null));
              break e;
          }
        throw Error(E(130, e == null ? e : typeof e, ''));
    }
  return ((t = Je(l, n, t, s)), (t.elementType = e), (t.type = r), (t.lanes = a), t);
}
function gn(e, t, n, r) {
  return ((e = Je(7, e, r, t)), (e.lanes = n), e);
}
function Da(e, t, n, r) {
  return (
    (e = Je(22, e, r, t)),
    (e.elementType = od),
    (e.lanes = n),
    (e.stateNode = { isHidden: !1 }),
    e
  );
}
function No(e, t, n) {
  return ((e = Je(6, e, null, t)), (e.lanes = n), e);
}
function So(e, t, n) {
  return (
    (t = Je(4, e.children !== null ? e.children : [], e.key, t)),
    (t.lanes = n),
    (t.stateNode = {
      containerInfo: e.containerInfo,
      pendingChildren: null,
      implementation: e.implementation,
    }),
    t
  );
}
function Th(e, t, n, r, s) {
  ((this.tag = t),
    (this.containerInfo = e),
    (this.finishedWork = this.pingCache = this.current = this.pendingChildren = null),
    (this.timeoutHandle = -1),
    (this.callbackNode = this.pendingContext = this.context = null),
    (this.callbackPriority = 0),
    (this.eventTimes = ro(0)),
    (this.expirationTimes = ro(-1)),
    (this.entangledLanes =
      this.finishedLanes =
      this.mutableReadLanes =
      this.expiredLanes =
      this.pingedLanes =
      this.suspendedLanes =
      this.pendingLanes =
        0),
    (this.entanglements = ro(0)),
    (this.identifierPrefix = r),
    (this.onRecoverableError = s),
    (this.mutableSourceEagerHydrationData = null));
}
function Oi(e, t, n, r, s, a, l, i, u) {
  return (
    (e = new Th(e, t, n, i, u)),
    t === 1 ? ((t = 1), a === !0 && (t |= 8)) : (t = 0),
    (a = Je(3, null, null, t)),
    (e.current = a),
    (a.stateNode = e),
    (a.memoizedState = {
      element: r,
      isDehydrated: n,
      cache: null,
      transitions: null,
      pendingSuspenseBoundaries: null,
    }),
    yi(a),
    e
  );
}
function _h(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return {
    $$typeof: An,
    key: r == null ? null : '' + r,
    children: e,
    containerInfo: t,
    implementation: n,
  };
}
function Xf(e) {
  if (!e) return qt;
  e = e._reactInternals;
  e: {
    if (kn(e) !== e || e.tag !== 1) throw Error(E(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (De(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(E(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (De(n)) return Jd(e, n, t);
  }
  return t;
}
function Zf(e, t, n, r, s, a, l, i, u) {
  return (
    (e = Oi(n, r, !0, e, s, a, l, i, u)),
    (e.context = Xf(null)),
    (n = e.current),
    (r = Ae()),
    (s = Vt(n)),
    (a = jt(r, s)),
    (a.callback = t ?? null),
    Ht(n, a, s),
    (e.current.lanes = s),
    ns(e, s, r),
    ze(e, r),
    e
  );
}
function za(e, t, n, r) {
  var s = t.current,
    a = Ae(),
    l = Vt(s);
  return (
    (n = Xf(n)),
    t.context === null ? (t.context = n) : (t.pendingContext = n),
    (t = jt(a, l)),
    (t.payload = { element: e }),
    (r = r === void 0 ? null : r),
    r !== null && (t.callback = r),
    (e = Ht(s, t, l)),
    e !== null && (ot(e, s, l, a), Bs(e, s, l)),
    l
  );
}
function ba(e) {
  if (((e = e.current), !e.child)) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function sc(e, t) {
  if (((e = e.memoizedState), e !== null && e.dehydrated !== null)) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function Mi(e, t) {
  (sc(e, t), (e = e.alternate) && sc(e, t));
}
function Ah() {
  return null;
}
var e0 =
  typeof reportError == 'function'
    ? reportError
    : function (e) {
        console.error(e);
      };
function Di(e) {
  this._internalRoot = e;
}
$a.prototype.render = Di.prototype.render = function (e) {
  var t = this._internalRoot;
  if (t === null) throw Error(E(409));
  za(e, t, null, null);
};
$a.prototype.unmount = Di.prototype.unmount = function () {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    (jn(function () {
      za(null, e, null, null);
    }),
      (t[St] = null));
  }
};
function $a(e) {
  this._internalRoot = e;
}
$a.prototype.unstable_scheduleHydration = function (e) {
  if (e) {
    var t = Ad();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < Rt.length && t !== 0 && t < Rt[n].priority; n++);
    (Rt.splice(n, 0, e), n === 0 && Pd(e));
  }
};
function zi(e) {
  return !(!e || (e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11));
}
function Ba(e) {
  return !(
    !e ||
    (e.nodeType !== 1 &&
      e.nodeType !== 9 &&
      e.nodeType !== 11 &&
      (e.nodeType !== 8 || e.nodeValue !== ' react-mount-point-unstable '))
  );
}
function ac() {}
function Lh(e, t, n, r, s) {
  if (s) {
    if (typeof r == 'function') {
      var a = r;
      r = function () {
        var c = ba(l);
        a.call(c);
      };
    }
    var l = Zf(t, r, e, 0, null, !1, !1, '', ac);
    return (
      (e._reactRootContainer = l),
      (e[St] = l.current),
      Hr(e.nodeType === 8 ? e.parentNode : e),
      jn(),
      l
    );
  }
  for (; (s = e.lastChild); ) e.removeChild(s);
  if (typeof r == 'function') {
    var i = r;
    r = function () {
      var c = ba(u);
      i.call(c);
    };
  }
  var u = Oi(e, 0, !1, null, null, !1, !1, '', ac);
  return (
    (e._reactRootContainer = u),
    (e[St] = u.current),
    Hr(e.nodeType === 8 ? e.parentNode : e),
    jn(function () {
      za(t, u, n, r);
    }),
    u
  );
}
function Fa(e, t, n, r, s) {
  var a = n._reactRootContainer;
  if (a) {
    var l = a;
    if (typeof s == 'function') {
      var i = s;
      s = function () {
        var u = ba(l);
        i.call(u);
      };
    }
    za(t, l, e, s);
  } else l = Lh(n, t, e, s, r);
  return ba(l);
}
Td = function (e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Sr(t.pendingLanes);
        n !== 0 && (ri(t, n | 1), ze(t, ae()), !(V & 6) && ((nr = ae() + 500), Xt()));
      }
      break;
    case 13:
      (jn(function () {
        var r = kt(e, 1);
        if (r !== null) {
          var s = Ae();
          ot(r, e, 1, s);
        }
      }),
        Mi(e, 1));
  }
};
si = function (e) {
  if (e.tag === 13) {
    var t = kt(e, 134217728);
    if (t !== null) {
      var n = Ae();
      ot(t, e, 134217728, n);
    }
    Mi(e, 134217728);
  }
};
_d = function (e) {
  if (e.tag === 13) {
    var t = Vt(e),
      n = kt(e, t);
    if (n !== null) {
      var r = Ae();
      ot(n, e, t, r);
    }
    Mi(e, t);
  }
};
Ad = function () {
  return G;
};
Ld = function (e, t) {
  var n = G;
  try {
    return ((G = e), t());
  } finally {
    G = n;
  }
};
Ko = function (e, t, n) {
  switch (t) {
    case 'input':
      if ((Bo(e, n), (t = n.name), n.type === 'radio' && t != null)) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (
          n = n.querySelectorAll('input[name=' + JSON.stringify('' + t) + '][type="radio"]'), t = 0;
          t < n.length;
          t++
        ) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var s = La(r);
            if (!s) throw Error(E(90));
            (id(r), Bo(r, s));
          }
        }
      }
      break;
    case 'textarea':
      cd(e, n);
      break;
    case 'select':
      ((t = n.value), t != null && Wn(e, !!n.multiple, t, !1));
  }
};
xd = Li;
yd = jn;
var Ph = { usingClientEntryPoint: !1, Events: [ss, On, La, hd, gd, Li] },
  vr = {
    findFiberByHostInstance: cn,
    bundleType: 0,
    version: '18.3.1',
    rendererPackageName: 'react-dom',
  },
  Rh = {
    bundleType: vr.bundleType,
    version: vr.version,
    rendererPackageName: vr.rendererPackageName,
    rendererConfig: vr.rendererConfig,
    overrideHookState: null,
    overrideHookStateDeletePath: null,
    overrideHookStateRenamePath: null,
    overrideProps: null,
    overridePropsDeletePath: null,
    overridePropsRenamePath: null,
    setErrorHandler: null,
    setSuspenseHandler: null,
    scheduleUpdate: null,
    currentDispatcherRef: Tt.ReactCurrentDispatcher,
    findHostInstanceByFiber: function (e) {
      return ((e = bd(e)), e === null ? null : e.stateNode);
    },
    findFiberByHostInstance: vr.findFiberByHostInstance || Ah,
    findHostInstancesForRefresh: null,
    scheduleRefresh: null,
    scheduleRoot: null,
    setRefreshHandler: null,
    getCurrentFiber: null,
    reconcilerVersion: '18.3.1-next-f1338f8080-20240426',
  };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < 'u') {
  var As = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!As.isDisabled && As.supportsFiber)
    try {
      ((Ca = As.inject(Rh)), (ht = As));
    } catch {}
}
Ge.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = Ph;
Ge.createPortal = function (e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!zi(t)) throw Error(E(200));
  return _h(e, t, null, n);
};
Ge.createRoot = function (e, t) {
  if (!zi(e)) throw Error(E(299));
  var n = !1,
    r = '',
    s = e0;
  return (
    t != null &&
      (t.unstable_strictMode === !0 && (n = !0),
      t.identifierPrefix !== void 0 && (r = t.identifierPrefix),
      t.onRecoverableError !== void 0 && (s = t.onRecoverableError)),
    (t = Oi(e, 1, !1, null, null, n, !1, r, s)),
    (e[St] = t.current),
    Hr(e.nodeType === 8 ? e.parentNode : e),
    new Di(t)
  );
};
Ge.findDOMNode = function (e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == 'function'
      ? Error(E(188))
      : ((e = Object.keys(e).join(',')), Error(E(268, e)));
  return ((e = bd(t)), (e = e === null ? null : e.stateNode), e);
};
Ge.flushSync = function (e) {
  return jn(e);
};
Ge.hydrate = function (e, t, n) {
  if (!Ba(t)) throw Error(E(200));
  return Fa(null, e, t, !0, n);
};
Ge.hydrateRoot = function (e, t, n) {
  if (!zi(e)) throw Error(E(405));
  var r = (n != null && n.hydratedSources) || null,
    s = !1,
    a = '',
    l = e0;
  if (
    (n != null &&
      (n.unstable_strictMode === !0 && (s = !0),
      n.identifierPrefix !== void 0 && (a = n.identifierPrefix),
      n.onRecoverableError !== void 0 && (l = n.onRecoverableError)),
    (t = Zf(t, null, e, 1, n ?? null, s, !1, a, l)),
    (e[St] = t.current),
    Hr(e),
    r)
  )
    for (e = 0; e < r.length; e++)
      ((n = r[e]),
        (s = n._getVersion),
        (s = s(n._source)),
        t.mutableSourceEagerHydrationData == null
          ? (t.mutableSourceEagerHydrationData = [n, s])
          : t.mutableSourceEagerHydrationData.push(n, s));
  return new $a(t);
};
Ge.render = function (e, t, n) {
  if (!Ba(t)) throw Error(E(200));
  return Fa(null, e, t, !1, n);
};
Ge.unmountComponentAtNode = function (e) {
  if (!Ba(e)) throw Error(E(40));
  return e._reactRootContainer
    ? (jn(function () {
        Fa(null, null, e, !1, function () {
          ((e._reactRootContainer = null), (e[St] = null));
        });
      }),
      !0)
    : !1;
};
Ge.unstable_batchedUpdates = Li;
Ge.unstable_renderSubtreeIntoContainer = function (e, t, n, r) {
  if (!Ba(n)) throw Error(E(200));
  if (e == null || e._reactInternals === void 0) throw Error(E(38));
  return Fa(e, t, n, !1, r);
};
Ge.version = '18.3.1-next-f1338f8080-20240426';
function t0() {
  if (
    !(
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > 'u' ||
      typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != 'function'
    )
  )
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(t0);
    } catch (e) {
      console.error(e);
    }
}
(t0(), (ed.exports = Ge));
var Ih = ed.exports,
  oc = Ih;
((Ro.createRoot = oc.createRoot), (Ro.hydrateRoot = oc.hydrateRoot));
/**
 * @remix-run/router v1.23.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Xr() {
  return (
    (Xr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Xr.apply(this, arguments)
  );
}
var zt;
(function (e) {
  ((e.Pop = 'POP'), (e.Push = 'PUSH'), (e.Replace = 'REPLACE'));
})(zt || (zt = {}));
const lc = 'popstate';
function Oh(e) {
  e === void 0 && (e = {});
  function t(r, s) {
    let { pathname: a, search: l, hash: i } = r.location;
    return El(
      '',
      { pathname: a, search: l, hash: i },
      (s.state && s.state.usr) || null,
      (s.state && s.state.key) || 'default'
    );
  }
  function n(r, s) {
    return typeof s == 'string' ? s : ja(s);
  }
  return Dh(t, n, null, e);
}
function ie(e, t) {
  if (e === !1 || e === null || typeof e > 'u') throw new Error(t);
}
function $i(e, t) {
  if (!e) {
    typeof console < 'u' && console.warn(t);
    try {
      throw new Error(t);
    } catch {}
  }
}
function Mh() {
  return Math.random().toString(36).substr(2, 8);
}
function ic(e, t) {
  return { usr: e.state, key: e.key, idx: t };
}
function El(e, t, n, r) {
  return (
    n === void 0 && (n = null),
    Xr(
      { pathname: typeof e == 'string' ? e : e.pathname, search: '', hash: '' },
      typeof t == 'string' ? ur(t) : t,
      { state: n, key: (t && t.key) || r || Mh() }
    )
  );
}
function ja(e) {
  let { pathname: t = '/', search: n = '', hash: r = '' } = e;
  return (
    n && n !== '?' && (t += n.charAt(0) === '?' ? n : '?' + n),
    r && r !== '#' && (t += r.charAt(0) === '#' ? r : '#' + r),
    t
  );
}
function ur(e) {
  let t = {};
  if (e) {
    let n = e.indexOf('#');
    n >= 0 && ((t.hash = e.substr(n)), (e = e.substr(0, n)));
    let r = e.indexOf('?');
    (r >= 0 && ((t.search = e.substr(r)), (e = e.substr(0, r))), e && (t.pathname = e));
  }
  return t;
}
function Dh(e, t, n, r) {
  r === void 0 && (r = {});
  let { window: s = document.defaultView, v5Compat: a = !1 } = r,
    l = s.history,
    i = zt.Pop,
    u = null,
    c = d();
  c == null && ((c = 0), l.replaceState(Xr({}, l.state, { idx: c }), ''));
  function d() {
    return (l.state || { idx: null }).idx;
  }
  function f() {
    i = zt.Pop;
    let v = d(),
      h = v == null ? null : v - c;
    ((c = v), u && u({ action: i, location: w.location, delta: h }));
  }
  function m(v, h) {
    i = zt.Push;
    let p = El(w.location, v, h);
    c = d() + 1;
    let g = ic(p, c),
      j = w.createHref(p);
    try {
      l.pushState(g, '', j);
    } catch (k) {
      if (k instanceof DOMException && k.name === 'DataCloneError') throw k;
      s.location.assign(j);
    }
    a && u && u({ action: i, location: w.location, delta: 1 });
  }
  function b(v, h) {
    i = zt.Replace;
    let p = El(w.location, v, h);
    c = d();
    let g = ic(p, c),
      j = w.createHref(p);
    (l.replaceState(g, '', j), a && u && u({ action: i, location: w.location, delta: 0 }));
  }
  function x(v) {
    let h = s.location.origin !== 'null' ? s.location.origin : s.location.href,
      p = typeof v == 'string' ? v : ja(v);
    return (
      (p = p.replace(/ $/, '%20')),
      ie(h, 'No window.location.(origin|href) available to create URL for href: ' + p),
      new URL(p, h)
    );
  }
  let w = {
    get action() {
      return i;
    },
    get location() {
      return e(s, l);
    },
    listen(v) {
      if (u) throw new Error('A history only accepts one active listener');
      return (
        s.addEventListener(lc, f),
        (u = v),
        () => {
          (s.removeEventListener(lc, f), (u = null));
        }
      );
    },
    createHref(v) {
      return t(s, v);
    },
    createURL: x,
    encodeLocation(v) {
      let h = x(v);
      return { pathname: h.pathname, search: h.search, hash: h.hash };
    },
    push: m,
    replace: b,
    go(v) {
      return l.go(v);
    },
  };
  return w;
}
var uc;
(function (e) {
  ((e.data = 'data'), (e.deferred = 'deferred'), (e.redirect = 'redirect'), (e.error = 'error'));
})(uc || (uc = {}));
function zh(e, t, n) {
  return (n === void 0 && (n = '/'), $h(e, t, n));
}
function $h(e, t, n, r) {
  let s = typeof t == 'string' ? ur(t) : t,
    a = Bi(s.pathname || '/', n);
  if (a == null) return null;
  let l = n0(e);
  Bh(l);
  let i = null;
  for (let u = 0; i == null && u < l.length; ++u) {
    let c = Xh(a);
    i = qh(l[u], c);
  }
  return i;
}
function n0(e, t, n, r) {
  (t === void 0 && (t = []), n === void 0 && (n = []), r === void 0 && (r = ''));
  let s = (a, l, i) => {
    let u = {
      relativePath: i === void 0 ? a.path || '' : i,
      caseSensitive: a.caseSensitive === !0,
      childrenIndex: l,
      route: a,
    };
    u.relativePath.startsWith('/') &&
      (ie(
        u.relativePath.startsWith(r),
        'Absolute route path "' +
          u.relativePath +
          '" nested under path ' +
          ('"' + r + '" is not valid. An absolute child route path ') +
          'must start with the combined path of all its parent routes.'
      ),
      (u.relativePath = u.relativePath.slice(r.length)));
    let c = Kt([r, u.relativePath]),
      d = n.concat(u);
    (a.children &&
      a.children.length > 0 &&
      (ie(
        a.index !== !0,
        'Index routes must not have child routes. Please remove ' +
          ('all child routes from route path "' + c + '".')
      ),
      n0(a.children, t, d, c)),
      !(a.path == null && !a.index) && t.push({ path: c, score: Kh(c, a.index), routesMeta: d }));
  };
  return (
    e.forEach((a, l) => {
      var i;
      if (a.path === '' || !((i = a.path) != null && i.includes('?'))) s(a, l);
      else for (let u of r0(a.path)) s(a, l, u);
    }),
    t
  );
}
function r0(e) {
  let t = e.split('/');
  if (t.length === 0) return [];
  let [n, ...r] = t,
    s = n.endsWith('?'),
    a = n.replace(/\?$/, '');
  if (r.length === 0) return s ? [a, ''] : [a];
  let l = r0(r.join('/')),
    i = [];
  return (
    i.push(...l.map(u => (u === '' ? a : [a, u].join('/')))),
    s && i.push(...l),
    i.map(u => (e.startsWith('/') && u === '' ? '/' : u))
  );
}
function Bh(e) {
  e.sort((t, n) =>
    t.score !== n.score
      ? n.score - t.score
      : Qh(
          t.routesMeta.map(r => r.childrenIndex),
          n.routesMeta.map(r => r.childrenIndex)
        )
  );
}
const Fh = /^:[\w-]+$/,
  Uh = 3,
  Hh = 2,
  Wh = 1,
  Vh = 10,
  Gh = -2,
  cc = e => e === '*';
function Kh(e, t) {
  let n = e.split('/'),
    r = n.length;
  return (
    n.some(cc) && (r += Gh),
    t && (r += Hh),
    n.filter(s => !cc(s)).reduce((s, a) => s + (Fh.test(a) ? Uh : a === '' ? Wh : Vh), r)
  );
}
function Qh(e, t) {
  return e.length === t.length && e.slice(0, -1).every((r, s) => r === t[s])
    ? e[e.length - 1] - t[t.length - 1]
    : 0;
}
function qh(e, t, n) {
  let { routesMeta: r } = e,
    s = {},
    a = '/',
    l = [];
  for (let i = 0; i < r.length; ++i) {
    let u = r[i],
      c = i === r.length - 1,
      d = a === '/' ? t : t.slice(a.length) || '/',
      f = Yh({ path: u.relativePath, caseSensitive: u.caseSensitive, end: c }, d),
      m = u.route;
    if (!f) return null;
    (Object.assign(s, f.params),
      l.push({
        params: s,
        pathname: Kt([a, f.pathname]),
        pathnameBase: rg(Kt([a, f.pathnameBase])),
        route: m,
      }),
      f.pathnameBase !== '/' && (a = Kt([a, f.pathnameBase])));
  }
  return l;
}
function Yh(e, t) {
  typeof e == 'string' && (e = { path: e, caseSensitive: !1, end: !0 });
  let [n, r] = Jh(e.path, e.caseSensitive, e.end),
    s = t.match(n);
  if (!s) return null;
  let a = s[0],
    l = a.replace(/(.)\/+$/, '$1'),
    i = s.slice(1);
  return {
    params: r.reduce((c, d, f) => {
      let { paramName: m, isOptional: b } = d;
      if (m === '*') {
        let w = i[f] || '';
        l = a.slice(0, a.length - w.length).replace(/(.)\/+$/, '$1');
      }
      const x = i[f];
      return (b && !x ? (c[m] = void 0) : (c[m] = (x || '').replace(/%2F/g, '/')), c);
    }, {}),
    pathname: a,
    pathnameBase: l,
    pattern: e,
  };
}
function Jh(e, t, n) {
  (t === void 0 && (t = !1),
    n === void 0 && (n = !0),
    $i(
      e === '*' || !e.endsWith('*') || e.endsWith('/*'),
      'Route path "' +
        e +
        '" will be treated as if it were ' +
        ('"' + e.replace(/\*$/, '/*') + '" because the `*` character must ') +
        'always follow a `/` in the pattern. To get rid of this warning, ' +
        ('please change the route path to "' + e.replace(/\*$/, '/*') + '".')
    ));
  let r = [],
    s =
      '^' +
      e
        .replace(/\/*\*?$/, '')
        .replace(/^\/*/, '/')
        .replace(/[\\.*+^${}|()[\]]/g, '\\$&')
        .replace(
          /\/:([\w-]+)(\?)?/g,
          (l, i, u) => (
            r.push({ paramName: i, isOptional: u != null }),
            u ? '/?([^\\/]+)?' : '/([^\\/]+)'
          )
        );
  return (
    e.endsWith('*')
      ? (r.push({ paramName: '*' }), (s += e === '*' || e === '/*' ? '(.*)$' : '(?:\\/(.+)|\\/*)$'))
      : n
        ? (s += '\\/*$')
        : e !== '' && e !== '/' && (s += '(?:(?=\\/|$))'),
    [new RegExp(s, t ? void 0 : 'i'), r]
  );
}
function Xh(e) {
  try {
    return e
      .split('/')
      .map(t => decodeURIComponent(t).replace(/\//g, '%2F'))
      .join('/');
  } catch (t) {
    return (
      $i(
        !1,
        'The URL path "' +
          e +
          '" could not be decoded because it is is a malformed URL segment. This is probably due to a bad percent ' +
          ('encoding (' + t + ').')
      ),
      e
    );
  }
}
function Bi(e, t) {
  if (t === '/') return e;
  if (!e.toLowerCase().startsWith(t.toLowerCase())) return null;
  let n = t.endsWith('/') ? t.length - 1 : t.length,
    r = e.charAt(n);
  return r && r !== '/' ? null : e.slice(n) || '/';
}
const Zh = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  eg = e => Zh.test(e);
function tg(e, t) {
  t === void 0 && (t = '/');
  let { pathname: n, search: r = '', hash: s = '' } = typeof e == 'string' ? ur(e) : e,
    a;
  if (n)
    if (eg(n)) a = n;
    else {
      if (n.includes('//')) {
        let l = n;
        ((n = n.replace(/\/\/+/g, '/')),
          $i(
            !1,
            'Pathnames cannot have embedded double slashes - normalizing ' + (l + ' -> ' + n)
          ));
      }
      n.startsWith('/') ? (a = dc(n.substring(1), '/')) : (a = dc(n, t));
    }
  else a = t;
  return { pathname: a, search: sg(r), hash: ag(s) };
}
function dc(e, t) {
  let n = t.replace(/\/+$/, '').split('/');
  return (
    e.split('/').forEach(s => {
      s === '..' ? n.length > 1 && n.pop() : s !== '.' && n.push(s);
    }),
    n.length > 1 ? n.join('/') : '/'
  );
}
function ko(e, t, n, r) {
  return (
    "Cannot include a '" +
    e +
    "' character in a manually specified " +
    ('`to.' + t + '` field [' + JSON.stringify(r) + '].  Please separate it out to the ') +
    ('`to.' + n + '` field. Alternatively you may provide the full path as ') +
    'a string in <Link to="..."> and the router will parse it for you.'
  );
}
function ng(e) {
  return e.filter((t, n) => n === 0 || (t.route.path && t.route.path.length > 0));
}
function s0(e, t) {
  let n = ng(e);
  return t
    ? n.map((r, s) => (s === n.length - 1 ? r.pathname : r.pathnameBase))
    : n.map(r => r.pathnameBase);
}
function a0(e, t, n, r) {
  r === void 0 && (r = !1);
  let s;
  typeof e == 'string'
    ? (s = ur(e))
    : ((s = Xr({}, e)),
      ie(!s.pathname || !s.pathname.includes('?'), ko('?', 'pathname', 'search', s)),
      ie(!s.pathname || !s.pathname.includes('#'), ko('#', 'pathname', 'hash', s)),
      ie(!s.search || !s.search.includes('#'), ko('#', 'search', 'hash', s)));
  let a = e === '' || s.pathname === '',
    l = a ? '/' : s.pathname,
    i;
  if (l == null) i = n;
  else {
    let f = t.length - 1;
    if (!r && l.startsWith('..')) {
      let m = l.split('/');
      for (; m[0] === '..'; ) (m.shift(), (f -= 1));
      s.pathname = m.join('/');
    }
    i = f >= 0 ? t[f] : '/';
  }
  let u = tg(s, i),
    c = l && l !== '/' && l.endsWith('/'),
    d = (a || l === '.') && n.endsWith('/');
  return (!u.pathname.endsWith('/') && (c || d) && (u.pathname += '/'), u);
}
const Kt = e => e.join('/').replace(/\/\/+/g, '/'),
  rg = e => e.replace(/\/+$/, '').replace(/^\/*/, '/'),
  sg = e => (!e || e === '?' ? '' : e.startsWith('?') ? e : '?' + e),
  ag = e => (!e || e === '#' ? '' : e.startsWith('#') ? e : '#' + e);
function og(e) {
  return (
    e != null &&
    typeof e.status == 'number' &&
    typeof e.statusText == 'string' &&
    typeof e.internal == 'boolean' &&
    'data' in e
  );
}
const o0 = ['post', 'put', 'patch', 'delete'];
new Set(o0);
const lg = ['get', ...o0];
new Set(lg);
/**
 * React Router v6.30.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Zr() {
  return (
    (Zr = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Zr.apply(this, arguments)
  );
}
const Fi = y.createContext(null),
  ig = y.createContext(null),
  En = y.createContext(null),
  Ua = y.createContext(null),
  Zt = y.createContext({ outlet: null, matches: [], isDataRoute: !1 }),
  l0 = y.createContext(null);
function ug(e, t) {
  let { relative: n } = t === void 0 ? {} : t;
  os() || ie(!1);
  let { basename: r, navigator: s } = y.useContext(En),
    { hash: a, pathname: l, search: i } = c0(e, { relative: n }),
    u = l;
  return (
    r !== '/' && (u = l === '/' ? r : Kt([r, l])),
    s.createHref({ pathname: u, search: i, hash: a })
  );
}
function os() {
  return y.useContext(Ua) != null;
}
function en() {
  return (os() || ie(!1), y.useContext(Ua).location);
}
function i0(e) {
  y.useContext(En).static || y.useLayoutEffect(e);
}
function Qe() {
  let { isDataRoute: e } = y.useContext(Zt);
  return e ? jg() : cg();
}
function cg() {
  os() || ie(!1);
  let e = y.useContext(Fi),
    { basename: t, future: n, navigator: r } = y.useContext(En),
    { matches: s } = y.useContext(Zt),
    { pathname: a } = en(),
    l = JSON.stringify(s0(s, n.v7_relativeSplatPath)),
    i = y.useRef(!1);
  return (
    i0(() => {
      i.current = !0;
    }),
    y.useCallback(
      function (c, d) {
        if ((d === void 0 && (d = {}), !i.current)) return;
        if (typeof c == 'number') {
          r.go(c);
          return;
        }
        let f = a0(c, JSON.parse(l), a, d.relative === 'path');
        (e == null && t !== '/' && (f.pathname = f.pathname === '/' ? t : Kt([t, f.pathname])),
          (d.replace ? r.replace : r.push)(f, d.state, d));
      },
      [t, r, l, a, e]
    )
  );
}
function u0() {
  let { matches: e } = y.useContext(Zt),
    t = e[e.length - 1];
  return t ? t.params : {};
}
function c0(e, t) {
  let { relative: n } = t === void 0 ? {} : t,
    { future: r } = y.useContext(En),
    { matches: s } = y.useContext(Zt),
    { pathname: a } = en(),
    l = JSON.stringify(s0(s, r.v7_relativeSplatPath));
  return y.useMemo(() => a0(e, JSON.parse(l), a, n === 'path'), [e, l, a, n]);
}
function dg(e, t) {
  return fg(e, t);
}
function fg(e, t, n, r) {
  os() || ie(!1);
  let { navigator: s } = y.useContext(En),
    { matches: a } = y.useContext(Zt),
    l = a[a.length - 1],
    i = l ? l.params : {};
  l && l.pathname;
  let u = l ? l.pathnameBase : '/';
  l && l.route;
  let c = en(),
    d;
  if (t) {
    var f;
    let v = typeof t == 'string' ? ur(t) : t;
    (u === '/' || ((f = v.pathname) != null && f.startsWith(u)) || ie(!1), (d = v));
  } else d = c;
  let m = d.pathname || '/',
    b = m;
  if (u !== '/') {
    let v = u.replace(/^\//, '').split('/');
    b = '/' + m.replace(/^\//, '').split('/').slice(v.length).join('/');
  }
  let x = zh(e, { pathname: b }),
    w = xg(
      x &&
        x.map(v =>
          Object.assign({}, v, {
            params: Object.assign({}, i, v.params),
            pathname: Kt([
              u,
              s.encodeLocation ? s.encodeLocation(v.pathname).pathname : v.pathname,
            ]),
            pathnameBase:
              v.pathnameBase === '/'
                ? u
                : Kt([
                    u,
                    s.encodeLocation ? s.encodeLocation(v.pathnameBase).pathname : v.pathnameBase,
                  ]),
          })
        ),
      a,
      n,
      r
    );
  return t && w
    ? y.createElement(
        Ua.Provider,
        {
          value: {
            location: Zr({ pathname: '/', search: '', hash: '', state: null, key: 'default' }, d),
            navigationType: zt.Pop,
          },
        },
        w
      )
    : w;
}
function pg() {
  let e = bg(),
    t = og(e) ? e.status + ' ' + e.statusText : e instanceof Error ? e.message : JSON.stringify(e),
    n = e instanceof Error ? e.stack : null,
    s = { padding: '0.5rem', backgroundColor: 'rgba(200,200,200, 0.5)' };
  return y.createElement(
    y.Fragment,
    null,
    y.createElement('h2', null, 'Unexpected Application Error!'),
    y.createElement('h3', { style: { fontStyle: 'italic' } }, t),
    n ? y.createElement('pre', { style: s }, n) : null,
    null
  );
}
const mg = y.createElement(pg, null);
class hg extends y.Component {
  constructor(t) {
    (super(t),
      (this.state = { location: t.location, revalidation: t.revalidation, error: t.error }));
  }
  static getDerivedStateFromError(t) {
    return { error: t };
  }
  static getDerivedStateFromProps(t, n) {
    return n.location !== t.location || (n.revalidation !== 'idle' && t.revalidation === 'idle')
      ? { error: t.error, location: t.location, revalidation: t.revalidation }
      : {
          error: t.error !== void 0 ? t.error : n.error,
          location: n.location,
          revalidation: t.revalidation || n.revalidation,
        };
  }
  componentDidCatch(t, n) {
    console.error('React Router caught the following error during render', t, n);
  }
  render() {
    return this.state.error !== void 0
      ? y.createElement(
          Zt.Provider,
          { value: this.props.routeContext },
          y.createElement(l0.Provider, { value: this.state.error, children: this.props.component })
        )
      : this.props.children;
  }
}
function gg(e) {
  let { routeContext: t, match: n, children: r } = e,
    s = y.useContext(Fi);
  return (
    s &&
      s.static &&
      s.staticContext &&
      (n.route.errorElement || n.route.ErrorBoundary) &&
      (s.staticContext._deepestRenderedBoundaryId = n.route.id),
    y.createElement(Zt.Provider, { value: t }, r)
  );
}
function xg(e, t, n, r) {
  var s;
  if (
    (t === void 0 && (t = []), n === void 0 && (n = null), r === void 0 && (r = null), e == null)
  ) {
    var a;
    if (!n) return null;
    if (n.errors) e = n.matches;
    else if (
      (a = r) != null &&
      a.v7_partialHydration &&
      t.length === 0 &&
      !n.initialized &&
      n.matches.length > 0
    )
      e = n.matches;
    else return null;
  }
  let l = e,
    i = (s = n) == null ? void 0 : s.errors;
  if (i != null) {
    let d = l.findIndex(f => f.route.id && (i == null ? void 0 : i[f.route.id]) !== void 0);
    (d >= 0 || ie(!1), (l = l.slice(0, Math.min(l.length, d + 1))));
  }
  let u = !1,
    c = -1;
  if (n && r && r.v7_partialHydration)
    for (let d = 0; d < l.length; d++) {
      let f = l[d];
      if (((f.route.HydrateFallback || f.route.hydrateFallbackElement) && (c = d), f.route.id)) {
        let { loaderData: m, errors: b } = n,
          x = f.route.loader && m[f.route.id] === void 0 && (!b || b[f.route.id] === void 0);
        if (f.route.lazy || x) {
          ((u = !0), c >= 0 ? (l = l.slice(0, c + 1)) : (l = [l[0]]));
          break;
        }
      }
    }
  return l.reduceRight((d, f, m) => {
    let b,
      x = !1,
      w = null,
      v = null;
    n &&
      ((b = i && f.route.id ? i[f.route.id] : void 0),
      (w = f.route.errorElement || mg),
      u &&
        (c < 0 && m === 0
          ? (Ng('route-fallback'), (x = !0), (v = null))
          : c === m && ((x = !0), (v = f.route.hydrateFallbackElement || null))));
    let h = t.concat(l.slice(0, m + 1)),
      p = () => {
        let g;
        return (
          b
            ? (g = w)
            : x
              ? (g = v)
              : f.route.Component
                ? (g = y.createElement(f.route.Component, null))
                : f.route.element
                  ? (g = f.route.element)
                  : (g = d),
          y.createElement(gg, {
            match: f,
            routeContext: { outlet: d, matches: h, isDataRoute: n != null },
            children: g,
          })
        );
      };
    return n && (f.route.ErrorBoundary || f.route.errorElement || m === 0)
      ? y.createElement(hg, {
          location: n.location,
          revalidation: n.revalidation,
          component: w,
          error: b,
          children: p(),
          routeContext: { outlet: null, matches: h, isDataRoute: !0 },
        })
      : p();
  }, null);
}
var d0 = (function (e) {
    return (
      (e.UseBlocker = 'useBlocker'),
      (e.UseRevalidator = 'useRevalidator'),
      (e.UseNavigateStable = 'useNavigate'),
      e
    );
  })(d0 || {}),
  f0 = (function (e) {
    return (
      (e.UseBlocker = 'useBlocker'),
      (e.UseLoaderData = 'useLoaderData'),
      (e.UseActionData = 'useActionData'),
      (e.UseRouteError = 'useRouteError'),
      (e.UseNavigation = 'useNavigation'),
      (e.UseRouteLoaderData = 'useRouteLoaderData'),
      (e.UseMatches = 'useMatches'),
      (e.UseRevalidator = 'useRevalidator'),
      (e.UseNavigateStable = 'useNavigate'),
      (e.UseRouteId = 'useRouteId'),
      e
    );
  })(f0 || {});
function yg(e) {
  let t = y.useContext(Fi);
  return (t || ie(!1), t);
}
function vg(e) {
  let t = y.useContext(ig);
  return (t || ie(!1), t);
}
function wg(e) {
  let t = y.useContext(Zt);
  return (t || ie(!1), t);
}
function p0(e) {
  let t = wg(),
    n = t.matches[t.matches.length - 1];
  return (n.route.id || ie(!1), n.route.id);
}
function bg() {
  var e;
  let t = y.useContext(l0),
    n = vg(),
    r = p0();
  return t !== void 0 ? t : (e = n.errors) == null ? void 0 : e[r];
}
function jg() {
  let { router: e } = yg(d0.UseNavigateStable),
    t = p0(f0.UseNavigateStable),
    n = y.useRef(!1);
  return (
    i0(() => {
      n.current = !0;
    }),
    y.useCallback(
      function (s, a) {
        (a === void 0 && (a = {}),
          n.current &&
            (typeof s == 'number' ? e.navigate(s) : e.navigate(s, Zr({ fromRouteId: t }, a))));
      },
      [e, t]
    )
  );
}
const fc = {};
function Ng(e, t, n) {
  fc[e] || (fc[e] = !0);
}
function Sg(e, t) {
  (e == null || e.v7_startTransition, e == null || e.v7_relativeSplatPath);
}
function Ne(e) {
  ie(!1);
}
function kg(e) {
  let {
    basename: t = '/',
    children: n = null,
    location: r,
    navigationType: s = zt.Pop,
    navigator: a,
    static: l = !1,
    future: i,
  } = e;
  os() && ie(!1);
  let u = t.replace(/^\/*/, '/'),
    c = y.useMemo(
      () => ({ basename: u, navigator: a, static: l, future: Zr({ v7_relativeSplatPath: !1 }, i) }),
      [u, i, a, l]
    );
  typeof r == 'string' && (r = ur(r));
  let { pathname: d = '/', search: f = '', hash: m = '', state: b = null, key: x = 'default' } = r,
    w = y.useMemo(() => {
      let v = Bi(d, u);
      return v == null
        ? null
        : { location: { pathname: v, search: f, hash: m, state: b, key: x }, navigationType: s };
    }, [u, d, f, m, b, x, s]);
  return w == null
    ? null
    : y.createElement(
        En.Provider,
        { value: c },
        y.createElement(Ua.Provider, { children: n, value: w })
      );
}
function Eg(e) {
  let { children: t, location: n } = e;
  return dg(Cl(t), n);
}
new Promise(() => {});
function Cl(e, t) {
  t === void 0 && (t = []);
  let n = [];
  return (
    y.Children.forEach(e, (r, s) => {
      if (!y.isValidElement(r)) return;
      let a = [...t, s];
      if (r.type === y.Fragment) {
        n.push.apply(n, Cl(r.props.children, a));
        return;
      }
      (r.type !== Ne && ie(!1), !r.props.index || !r.props.children || ie(!1));
      let l = {
        id: r.props.id || a.join('-'),
        caseSensitive: r.props.caseSensitive,
        element: r.props.element,
        Component: r.props.Component,
        index: r.props.index,
        path: r.props.path,
        loader: r.props.loader,
        action: r.props.action,
        errorElement: r.props.errorElement,
        ErrorBoundary: r.props.ErrorBoundary,
        hasErrorBoundary: r.props.ErrorBoundary != null || r.props.errorElement != null,
        shouldRevalidate: r.props.shouldRevalidate,
        handle: r.props.handle,
        lazy: r.props.lazy,
      };
      (r.props.children && (l.children = Cl(r.props.children, a)), n.push(l));
    }),
    n
  );
}
/**
 * React Router DOM v6.30.2
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */ function Tl() {
  return (
    (Tl = Object.assign
      ? Object.assign.bind()
      : function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = arguments[t];
            for (var r in n) Object.prototype.hasOwnProperty.call(n, r) && (e[r] = n[r]);
          }
          return e;
        }),
    Tl.apply(this, arguments)
  );
}
function Cg(e, t) {
  if (e == null) return {};
  var n = {},
    r = Object.keys(e),
    s,
    a;
  for (a = 0; a < r.length; a++) ((s = r[a]), !(t.indexOf(s) >= 0) && (n[s] = e[s]));
  return n;
}
function Tg(e) {
  return !!(e.metaKey || e.altKey || e.ctrlKey || e.shiftKey);
}
function _g(e, t) {
  return e.button === 0 && (!t || t === '_self') && !Tg(e);
}
const Ag = [
    'onClick',
    'relative',
    'reloadDocument',
    'replace',
    'state',
    'target',
    'to',
    'preventScrollReset',
    'viewTransition',
  ],
  Lg = '6';
try {
  window.__reactRouterVersion = Lg;
} catch {}
const Pg = 'startTransition',
  pc = Np[Pg];
function Rg(e) {
  let { basename: t, children: n, future: r, window: s } = e,
    a = y.useRef();
  a.current == null && (a.current = Oh({ window: s, v5Compat: !0 }));
  let l = a.current,
    [i, u] = y.useState({ action: l.action, location: l.location }),
    { v7_startTransition: c } = r || {},
    d = y.useCallback(
      f => {
        c && pc ? pc(() => u(f)) : u(f);
      },
      [u, c]
    );
  return (
    y.useLayoutEffect(() => l.listen(d), [l, d]),
    y.useEffect(() => Sg(r), [r]),
    y.createElement(kg, {
      basename: t,
      children: n,
      location: i.location,
      navigationType: i.action,
      navigator: l,
      future: r,
    })
  );
}
const Ig =
    typeof window < 'u' &&
    typeof window.document < 'u' &&
    typeof window.document.createElement < 'u',
  Og = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i,
  Ce = y.forwardRef(function (t, n) {
    let {
        onClick: r,
        relative: s,
        reloadDocument: a,
        replace: l,
        state: i,
        target: u,
        to: c,
        preventScrollReset: d,
        viewTransition: f,
      } = t,
      m = Cg(t, Ag),
      { basename: b } = y.useContext(En),
      x,
      w = !1;
    if (typeof c == 'string' && Og.test(c) && ((x = c), Ig))
      try {
        let g = new URL(window.location.href),
          j = c.startsWith('//') ? new URL(g.protocol + c) : new URL(c),
          k = Bi(j.pathname, b);
        j.origin === g.origin && k != null ? (c = k + j.search + j.hash) : (w = !0);
      } catch {}
    let v = ug(c, { relative: s }),
      h = Mg(c, {
        replace: l,
        state: i,
        target: u,
        preventScrollReset: d,
        relative: s,
        viewTransition: f,
      });
    function p(g) {
      (r && r(g), g.defaultPrevented || h(g));
    }
    return y.createElement(
      'a',
      Tl({}, m, { href: x || v, onClick: w || a ? r : p, ref: n, target: u })
    );
  });
var mc;
(function (e) {
  ((e.UseScrollRestoration = 'useScrollRestoration'),
    (e.UseSubmit = 'useSubmit'),
    (e.UseSubmitFetcher = 'useSubmitFetcher'),
    (e.UseFetcher = 'useFetcher'),
    (e.useViewTransitionState = 'useViewTransitionState'));
})(mc || (mc = {}));
var hc;
(function (e) {
  ((e.UseFetcher = 'useFetcher'),
    (e.UseFetchers = 'useFetchers'),
    (e.UseScrollRestoration = 'useScrollRestoration'));
})(hc || (hc = {}));
function Mg(e, t) {
  let {
      target: n,
      replace: r,
      state: s,
      preventScrollReset: a,
      relative: l,
      viewTransition: i,
    } = t === void 0 ? {} : t,
    u = Qe(),
    c = en(),
    d = c0(e, { relative: l });
  return y.useCallback(
    f => {
      if (_g(f, n)) {
        f.preventDefault();
        let m = r !== void 0 ? r : ja(c) === ja(d);
        u(e, { replace: m, state: s, preventScrollReset: a, relative: l, viewTransition: i });
      }
    },
    [c, u, d, r, s, n, e, a, l, i]
  );
}
let Dg = { data: '' },
  zg = e => {
    if (typeof window == 'object') {
      let t =
        (e ? e.querySelector('#_goober') : window._goober) ||
        Object.assign(document.createElement('style'), { innerHTML: ' ', id: '_goober' });
      return (
        (t.nonce = window.__nonce__),
        t.parentNode || (e || document.head).appendChild(t),
        t.firstChild
      );
    }
    return e || Dg;
  },
  $g = /(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,
  Bg = /\/\*[^]*?\*\/|  +/g,
  gc = /\n+/g,
  Ot = (e, t) => {
    let n = '',
      r = '',
      s = '';
    for (let a in e) {
      let l = e[a];
      a[0] == '@'
        ? a[1] == 'i'
          ? (n = a + ' ' + l + ';')
          : (r += a[1] == 'f' ? Ot(l, a) : a + '{' + Ot(l, a[1] == 'k' ? '' : t) + '}')
        : typeof l == 'object'
          ? (r += Ot(
              l,
              t
                ? t.replace(/([^,])+/g, i =>
                    a.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g, u =>
                      /&/.test(u) ? u.replace(/&/g, i) : i ? i + ' ' + u : u
                    )
                  )
                : a
            ))
          : l != null &&
            ((a = /^--/.test(a) ? a : a.replace(/[A-Z]/g, '-$&').toLowerCase()),
            (s += Ot.p ? Ot.p(a, l) : a + ':' + l + ';'));
    }
    return n + (t && s ? t + '{' + s + '}' : s) + r;
  },
  xt = {},
  m0 = e => {
    if (typeof e == 'object') {
      let t = '';
      for (let n in e) t += n + m0(e[n]);
      return t;
    }
    return e;
  },
  Fg = (e, t, n, r, s) => {
    let a = m0(e),
      l =
        xt[a] ||
        (xt[a] = (u => {
          let c = 0,
            d = 11;
          for (; c < u.length; ) d = (101 * d + u.charCodeAt(c++)) >>> 0;
          return 'go' + d;
        })(a));
    if (!xt[l]) {
      let u =
        a !== e
          ? e
          : (c => {
              let d,
                f,
                m = [{}];
              for (; (d = $g.exec(c.replace(Bg, ''))); )
                d[4]
                  ? m.shift()
                  : d[3]
                    ? ((f = d[3].replace(gc, ' ').trim()), m.unshift((m[0][f] = m[0][f] || {})))
                    : (m[0][d[1]] = d[2].replace(gc, ' ').trim());
              return m[0];
            })(e);
      xt[l] = Ot(s ? { ['@keyframes ' + l]: u } : u, n ? '' : '.' + l);
    }
    let i = n && xt.g ? xt.g : null;
    return (
      n && (xt.g = xt[l]),
      ((u, c, d, f) => {
        f
          ? (c.data = c.data.replace(f, u))
          : c.data.indexOf(u) === -1 && (c.data = d ? u + c.data : c.data + u);
      })(xt[l], t, r, i),
      l
    );
  },
  Ug = (e, t, n) =>
    e.reduce((r, s, a) => {
      let l = t[a];
      if (l && l.call) {
        let i = l(n),
          u = (i && i.props && i.props.className) || (/^go/.test(i) && i);
        l = u
          ? '.' + u
          : i && typeof i == 'object'
            ? i.props
              ? ''
              : Ot(i, '')
            : i === !1
              ? ''
              : i;
      }
      return r + s + (l ?? '');
    }, '');
function Ha(e) {
  let t = this || {},
    n = e.call ? e(t.p) : e;
  return Fg(
    n.unshift
      ? n.raw
        ? Ug(n, [].slice.call(arguments, 1), t.p)
        : n.reduce((r, s) => Object.assign(r, s && s.call ? s(t.p) : s), {})
      : n,
    zg(t.target),
    t.g,
    t.o,
    t.k
  );
}
let h0, _l, Al;
Ha.bind({ g: 1 });
let Ct = Ha.bind({ k: 1 });
function Hg(e, t, n, r) {
  ((Ot.p = t), (h0 = e), (_l = n), (Al = r));
}
function tn(e, t) {
  let n = this || {};
  return function () {
    let r = arguments;
    function s(a, l) {
      let i = Object.assign({}, a),
        u = i.className || s.className;
      ((n.p = Object.assign({ theme: _l && _l() }, i)),
        (n.o = / *go\d+/.test(u)),
        (i.className = Ha.apply(n, r) + (u ? ' ' + u : '')));
      let c = e;
      return (e[0] && ((c = i.as || e), delete i.as), Al && c[0] && Al(i), h0(c, i));
    }
    return s;
  };
}
var Wg = e => typeof e == 'function',
  Na = (e, t) => (Wg(e) ? e(t) : e),
  Vg = (() => {
    let e = 0;
    return () => (++e).toString();
  })(),
  g0 = (() => {
    let e;
    return () => {
      if (e === void 0 && typeof window < 'u') {
        let t = matchMedia('(prefers-reduced-motion: reduce)');
        e = !t || t.matches;
      }
      return e;
    };
  })(),
  Gg = 20,
  Ui = 'default',
  x0 = (e, t) => {
    let { toastLimit: n } = e.settings;
    switch (t.type) {
      case 0:
        return { ...e, toasts: [t.toast, ...e.toasts].slice(0, n) };
      case 1:
        return {
          ...e,
          toasts: e.toasts.map(l => (l.id === t.toast.id ? { ...l, ...t.toast } : l)),
        };
      case 2:
        let { toast: r } = t;
        return x0(e, { type: e.toasts.find(l => l.id === r.id) ? 1 : 0, toast: r });
      case 3:
        let { toastId: s } = t;
        return {
          ...e,
          toasts: e.toasts.map(l =>
            l.id === s || s === void 0 ? { ...l, dismissed: !0, visible: !1 } : l
          ),
        };
      case 4:
        return t.toastId === void 0
          ? { ...e, toasts: [] }
          : { ...e, toasts: e.toasts.filter(l => l.id !== t.toastId) };
      case 5:
        return { ...e, pausedAt: t.time };
      case 6:
        let a = t.time - (e.pausedAt || 0);
        return {
          ...e,
          pausedAt: void 0,
          toasts: e.toasts.map(l => ({ ...l, pauseDuration: l.pauseDuration + a })),
        };
    }
  },
  Ks = [],
  y0 = { toasts: [], pausedAt: void 0, settings: { toastLimit: Gg } },
  mt = {},
  v0 = (e, t = Ui) => {
    ((mt[t] = x0(mt[t] || y0, e)),
      Ks.forEach(([n, r]) => {
        n === t && r(mt[t]);
      }));
  },
  w0 = e => Object.keys(mt).forEach(t => v0(e, t)),
  Kg = e => Object.keys(mt).find(t => mt[t].toasts.some(n => n.id === e)),
  Wa =
    (e = Ui) =>
    t => {
      v0(t, e);
    },
  Qg = { blank: 4e3, error: 4e3, success: 2e3, loading: 1 / 0, custom: 4e3 },
  qg = (e = {}, t = Ui) => {
    let [n, r] = y.useState(mt[t] || y0),
      s = y.useRef(mt[t]);
    y.useEffect(
      () => (
        s.current !== mt[t] && r(mt[t]),
        Ks.push([t, r]),
        () => {
          let l = Ks.findIndex(([i]) => i === t);
          l > -1 && Ks.splice(l, 1);
        }
      ),
      [t]
    );
    let a = n.toasts.map(l => {
      var i, u, c;
      return {
        ...e,
        ...e[l.type],
        ...l,
        removeDelay:
          l.removeDelay ||
          ((i = e[l.type]) == null ? void 0 : i.removeDelay) ||
          (e == null ? void 0 : e.removeDelay),
        duration:
          l.duration ||
          ((u = e[l.type]) == null ? void 0 : u.duration) ||
          (e == null ? void 0 : e.duration) ||
          Qg[l.type],
        style: { ...e.style, ...((c = e[l.type]) == null ? void 0 : c.style), ...l.style },
      };
    });
    return { ...n, toasts: a };
  },
  Yg = (e, t = 'blank', n) => ({
    createdAt: Date.now(),
    visible: !0,
    dismissed: !1,
    type: t,
    ariaProps: { role: 'status', 'aria-live': 'polite' },
    message: e,
    pauseDuration: 0,
    ...n,
    id: (n == null ? void 0 : n.id) || Vg(),
  }),
  ls = e => (t, n) => {
    let r = Yg(t, e, n);
    return (Wa(r.toasterId || Kg(r.id))({ type: 2, toast: r }), r.id);
  },
  de = (e, t) => ls('blank')(e, t);
de.error = ls('error');
de.success = ls('success');
de.loading = ls('loading');
de.custom = ls('custom');
de.dismiss = (e, t) => {
  let n = { type: 3, toastId: e };
  t ? Wa(t)(n) : w0(n);
};
de.dismissAll = e => de.dismiss(void 0, e);
de.remove = (e, t) => {
  let n = { type: 4, toastId: e };
  t ? Wa(t)(n) : w0(n);
};
de.removeAll = e => de.remove(void 0, e);
de.promise = (e, t, n) => {
  let r = de.loading(t.loading, { ...n, ...(n == null ? void 0 : n.loading) });
  return (
    typeof e == 'function' && (e = e()),
    e
      .then(s => {
        let a = t.success ? Na(t.success, s) : void 0;
        return (
          a ? de.success(a, { id: r, ...n, ...(n == null ? void 0 : n.success) }) : de.dismiss(r),
          s
        );
      })
      .catch(s => {
        let a = t.error ? Na(t.error, s) : void 0;
        a ? de.error(a, { id: r, ...n, ...(n == null ? void 0 : n.error) }) : de.dismiss(r);
      }),
    e
  );
};
var Jg = 1e3,
  Xg = (e, t = 'default') => {
    let { toasts: n, pausedAt: r } = qg(e, t),
      s = y.useRef(new Map()).current,
      a = y.useCallback((f, m = Jg) => {
        if (s.has(f)) return;
        let b = setTimeout(() => {
          (s.delete(f), l({ type: 4, toastId: f }));
        }, m);
        s.set(f, b);
      }, []);
    y.useEffect(() => {
      if (r) return;
      let f = Date.now(),
        m = n.map(b => {
          if (b.duration === 1 / 0) return;
          let x = (b.duration || 0) + b.pauseDuration - (f - b.createdAt);
          if (x < 0) {
            b.visible && de.dismiss(b.id);
            return;
          }
          return setTimeout(() => de.dismiss(b.id, t), x);
        });
      return () => {
        m.forEach(b => b && clearTimeout(b));
      };
    }, [n, r, t]);
    let l = y.useCallback(Wa(t), [t]),
      i = y.useCallback(() => {
        l({ type: 5, time: Date.now() });
      }, [l]),
      u = y.useCallback(
        (f, m) => {
          l({ type: 1, toast: { id: f, height: m } });
        },
        [l]
      ),
      c = y.useCallback(() => {
        r && l({ type: 6, time: Date.now() });
      }, [r, l]),
      d = y.useCallback(
        (f, m) => {
          let { reverseOrder: b = !1, gutter: x = 8, defaultPosition: w } = m || {},
            v = n.filter(g => (g.position || w) === (f.position || w) && g.height),
            h = v.findIndex(g => g.id === f.id),
            p = v.filter((g, j) => j < h && g.visible).length;
          return v
            .filter(g => g.visible)
            .slice(...(b ? [p + 1] : [0, p]))
            .reduce((g, j) => g + (j.height || 0) + x, 0);
        },
        [n]
      );
    return (
      y.useEffect(() => {
        n.forEach(f => {
          if (f.dismissed) a(f.id, f.removeDelay);
          else {
            let m = s.get(f.id);
            m && (clearTimeout(m), s.delete(f.id));
          }
        });
      }, [n, a]),
      { toasts: n, handlers: { updateHeight: u, startPause: i, endPause: c, calculateOffset: d } }
    );
  },
  Zg = Ct`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,
  ex = Ct`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,
  tx = Ct`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,
  nx = tn('div')`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e => e.primary || '#ff4b4b'};
  position: relative;
  transform: rotate(45deg);

  animation: ${Zg} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${ex} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e => e.secondary || '#fff'};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${tx} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,
  rx = Ct`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,
  sx = tn('div')`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e => e.secondary || '#e0e0e0'};
  border-right-color: ${e => e.primary || '#616161'};
  animation: ${rx} 1s linear infinite;
`,
  ax = Ct`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,
  ox = Ct`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,
  lx = tn('div')`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e => e.primary || '#61d345'};
  position: relative;
  transform: rotate(45deg);

  animation: ${ax} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${ox} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e => e.secondary || '#fff'};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,
  ix = tn('div')`
  position: absolute;
`,
  ux = tn('div')`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,
  cx = Ct`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,
  dx = tn('div')`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${cx} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,
  fx = ({ toast: e }) => {
    let { icon: t, type: n, iconTheme: r } = e;
    return t !== void 0
      ? typeof t == 'string'
        ? y.createElement(dx, null, t)
        : t
      : n === 'blank'
        ? null
        : y.createElement(
            ux,
            null,
            y.createElement(sx, { ...r }),
            n !== 'loading' &&
              y.createElement(
                ix,
                null,
                n === 'error' ? y.createElement(nx, { ...r }) : y.createElement(lx, { ...r })
              )
          );
  },
  px = e => `
0% {transform: translate3d(0,${e * -200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,
  mx = e => `
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e * -150}%,-1px) scale(.6); opacity:0;}
`,
  hx = '0%{opacity:0;} 100%{opacity:1;}',
  gx = '0%{opacity:1;} 100%{opacity:0;}',
  xx = tn('div')`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,
  yx = tn('div')`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,
  vx = (e, t) => {
    let n = e.includes('top') ? 1 : -1,
      [r, s] = g0() ? [hx, gx] : [px(n), mx(n)];
    return {
      animation: t
        ? `${Ct(r)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`
        : `${Ct(s)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`,
    };
  },
  wx = y.memo(({ toast: e, position: t, style: n, children: r }) => {
    let s = e.height ? vx(e.position || t || 'top-center', e.visible) : { opacity: 0 },
      a = y.createElement(fx, { toast: e }),
      l = y.createElement(yx, { ...e.ariaProps }, Na(e.message, e));
    return y.createElement(
      xx,
      { className: e.className, style: { ...s, ...n, ...e.style } },
      typeof r == 'function' ? r({ icon: a, message: l }) : y.createElement(y.Fragment, null, a, l)
    );
  });
Hg(y.createElement);
var bx = ({ id: e, className: t, style: n, onHeightUpdate: r, children: s }) => {
    let a = y.useCallback(
      l => {
        if (l) {
          let i = () => {
            let u = l.getBoundingClientRect().height;
            r(e, u);
          };
          (i(),
            new MutationObserver(i).observe(l, { subtree: !0, childList: !0, characterData: !0 }));
        }
      },
      [e, r]
    );
    return y.createElement('div', { ref: a, className: t, style: n }, s);
  },
  jx = (e, t) => {
    let n = e.includes('top'),
      r = n ? { top: 0 } : { bottom: 0 },
      s = e.includes('center')
        ? { justifyContent: 'center' }
        : e.includes('right')
          ? { justifyContent: 'flex-end' }
          : {};
    return {
      left: 0,
      right: 0,
      display: 'flex',
      position: 'absolute',
      transition: g0() ? void 0 : 'all 230ms cubic-bezier(.21,1.02,.73,1)',
      transform: `translateY(${t * (n ? 1 : -1)}px)`,
      ...r,
      ...s,
    };
  },
  Nx = Ha`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`,
  Ls = 16,
  Sx = ({
    reverseOrder: e,
    position: t = 'top-center',
    toastOptions: n,
    gutter: r,
    children: s,
    toasterId: a,
    containerStyle: l,
    containerClassName: i,
  }) => {
    let { toasts: u, handlers: c } = Xg(n, a);
    return y.createElement(
      'div',
      {
        'data-rht-toaster': a || '',
        style: {
          position: 'fixed',
          zIndex: 9999,
          top: Ls,
          left: Ls,
          right: Ls,
          bottom: Ls,
          pointerEvents: 'none',
          ...l,
        },
        className: i,
        onMouseEnter: c.startPause,
        onMouseLeave: c.endPause,
      },
      u.map(d => {
        let f = d.position || t,
          m = c.calculateOffset(d, { reverseOrder: e, gutter: r, defaultPosition: t }),
          b = jx(f, m);
        return y.createElement(
          bx,
          {
            id: d.id,
            key: d.id,
            onHeightUpdate: c.updateHeight,
            className: d.visible ? Nx : '',
            style: b,
          },
          d.type === 'custom'
            ? Na(d.message, d)
            : s
              ? s(d)
              : y.createElement(wx, { toast: d, position: f })
        );
      })
    );
  },
  H = de,
  Ll = (e => ((e.STUDENT = 'STUDENT'), (e.APPLICANT = 'APPLICANT'), e))(Ll || {}),
  b0 = (e => ((e.EMAIL = 'EMAIL'), e))(b0 || {}),
  ke = (e => (
    (e.PROGRAMMING = 'PROGRAMMING'),
    (e.ROBOTICS = 'ROBOTICS'),
    (e.MEDICINE = 'MEDICINE'),
    (e.BIOTECHNOLOGY = 'BIOTECHNOLOGY'),
    (e.CULTURE = 'CULTURE'),
    e
  ))(ke || {}),
  he = (e => (
    (e.RUSSIAN = 'RUSSIAN'),
    (e.MATHEMATICS = 'MATHEMATICS'),
    (e.PHYSICS = 'PHYSICS'),
    (e.INFORMATICS = 'INFORMATICS'),
    (e.BIOLOGY = 'BIOLOGY'),
    (e.HISTORY = 'HISTORY'),
    (e.ENGLISH = 'ENGLISH'),
    e
  ))(he || {}),
  Pl = (e => ((e.GRADE_8 = 'GRADE_8'), (e.GRADE_10 = 'GRADE_10'), e))(Pl || {});
const Hi = {
    [ke.PROGRAMMING]: 'Программирование',
    [ke.ROBOTICS]: 'Робототехника',
    [ke.MEDICINE]: 'Медицина будущего',
    [ke.BIOTECHNOLOGY]: 'Биотехнологии',
    [ke.CULTURE]: 'Культура',
  },
  Wi = {
    [he.RUSSIAN]: 'Русский язык',
    [he.MATHEMATICS]: 'Математика',
    [he.PHYSICS]: 'Физика',
    [he.INFORMATICS]: 'Информатика',
    [he.BIOLOGY]: 'Биология',
    [he.HISTORY]: 'История',
    [he.ENGLISH]: 'Английский язык',
  };
(he.RUSSIAN, he.MATHEMATICS);
(ke.PROGRAMMING + '',
  he.PHYSICS,
  he.INFORMATICS,
  ke.ROBOTICS + '',
  he.PHYSICS,
  he.INFORMATICS,
  ke.MEDICINE + '',
  he.BIOLOGY,
  ke.BIOTECHNOLOGY + '',
  he.BIOLOGY,
  ke.CULTURE + '',
  he.HISTORY,
  he.ENGLISH);
(Pl.GRADE_8 + '', Pl.GRADE_10 + '');
const Tn = {
    name: 'Лицей-интернат №64',
    website: 'https://lic-int64-saratov-r64.gosweb.gosuslugi.ru',
    phone: '+7 (8452) 79-64-64',
    email: 'sarli64@mail.ru',
    admissionPeriod: { documentSubmission: 'до 14 июля', exams: '15-22 июля' },
  },
  j0 = { 8: '8 класс', 9: '9 класс', 10: '10 класс', 11: '11 класс' },
  N0 = [8, 9, 10, 11],
  Rl = { [Ll.STUDENT]: 'Уже учусь в лицее', [Ll.APPLICANT]: 'Хочу поступить' },
  kx = { [b0.EMAIL]: 'Email и пароль' },
  Ex = {},
  xc = e => {
    let t;
    const n = new Set(),
      r = (d, f) => {
        const m = typeof d == 'function' ? d(t) : d;
        if (!Object.is(m, t)) {
          const b = t;
          ((t = (f ?? (typeof m != 'object' || m === null)) ? m : Object.assign({}, t, m)),
            n.forEach(x => x(t, b)));
        }
      },
      s = () => t,
      u = {
        setState: r,
        getState: s,
        getInitialState: () => c,
        subscribe: d => (n.add(d), () => n.delete(d)),
        destroy: () => {
          ((Ex ? 'production' : void 0) !== 'production' &&
            console.warn(
              '[DEPRECATED] The `destroy` method will be unsupported in a future version. Instead use unsubscribe function returned by subscribe. Everything will be garbage-collected if store is garbage-collected.'
            ),
            n.clear());
        },
      },
      c = (t = e(r, s, u));
    return u;
  },
  Cx = e => (e ? xc(e) : xc);
var S0 = { exports: {} },
  k0 = {},
  E0 = { exports: {} },
  C0 = {};
/**
 * @license React
 * use-sync-external-store-shim.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var rr = y;
function Tx(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var _x = typeof Object.is == 'function' ? Object.is : Tx,
  Ax = rr.useState,
  Lx = rr.useEffect,
  Px = rr.useLayoutEffect,
  Rx = rr.useDebugValue;
function Ix(e, t) {
  var n = t(),
    r = Ax({ inst: { value: n, getSnapshot: t } }),
    s = r[0].inst,
    a = r[1];
  return (
    Px(
      function () {
        ((s.value = n), (s.getSnapshot = t), Eo(s) && a({ inst: s }));
      },
      [e, n, t]
    ),
    Lx(
      function () {
        return (
          Eo(s) && a({ inst: s }),
          e(function () {
            Eo(s) && a({ inst: s });
          })
        );
      },
      [e]
    ),
    Rx(n),
    n
  );
}
function Eo(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !_x(e, n);
  } catch {
    return !0;
  }
}
function Ox(e, t) {
  return t();
}
var Mx =
  typeof window > 'u' || typeof window.document > 'u' || typeof window.document.createElement > 'u'
    ? Ox
    : Ix;
C0.useSyncExternalStore = rr.useSyncExternalStore !== void 0 ? rr.useSyncExternalStore : Mx;
E0.exports = C0;
var Dx = E0.exports;
/**
 * @license React
 * use-sync-external-store-shim/with-selector.production.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var Va = y,
  zx = Dx;
function $x(e, t) {
  return (e === t && (e !== 0 || 1 / e === 1 / t)) || (e !== e && t !== t);
}
var Bx = typeof Object.is == 'function' ? Object.is : $x,
  Fx = zx.useSyncExternalStore,
  Ux = Va.useRef,
  Hx = Va.useEffect,
  Wx = Va.useMemo,
  Vx = Va.useDebugValue;
k0.useSyncExternalStoreWithSelector = function (e, t, n, r, s) {
  var a = Ux(null);
  if (a.current === null) {
    var l = { hasValue: !1, value: null };
    a.current = l;
  } else l = a.current;
  a = Wx(
    function () {
      function u(b) {
        if (!c) {
          if (((c = !0), (d = b), (b = r(b)), s !== void 0 && l.hasValue)) {
            var x = l.value;
            if (s(x, b)) return (f = x);
          }
          return (f = b);
        }
        if (((x = f), Bx(d, b))) return x;
        var w = r(b);
        return s !== void 0 && s(x, w) ? ((d = b), x) : ((d = b), (f = w));
      }
      var c = !1,
        d,
        f,
        m = n === void 0 ? null : n;
      return [
        function () {
          return u(t());
        },
        m === null
          ? void 0
          : function () {
              return u(m());
            },
      ];
    },
    [t, n, r, s]
  );
  var i = Fx(e, a[0], a[1]);
  return (
    Hx(
      function () {
        ((l.hasValue = !0), (l.value = i));
      },
      [i]
    ),
    Vx(i),
    i
  );
};
S0.exports = k0;
var Gx = S0.exports;
const Kx = Uc(Gx),
  T0 = {},
  { useDebugValue: Qx } = Ql,
  { useSyncExternalStoreWithSelector: qx } = Kx;
let yc = !1;
const Yx = e => e;
function Jx(e, t = Yx, n) {
  (T0 ? 'production' : void 0) !== 'production' &&
    n &&
    !yc &&
    (console.warn(
      "[DEPRECATED] Use `createWithEqualityFn` instead of `create` or use `useStoreWithEqualityFn` instead of `useStore`. They can be imported from 'zustand/traditional'. https://github.com/pmndrs/zustand/discussions/1937"
    ),
    (yc = !0));
  const r = qx(e.subscribe, e.getState, e.getServerState || e.getInitialState, t, n);
  return (Qx(r), r);
}
const Xx = e => {
    (T0 ? 'production' : void 0) !== 'production' &&
      typeof e != 'function' &&
      console.warn(
        "[DEPRECATED] Passing a vanilla store will be unsupported in a future version. Instead use `import { useStore } from 'zustand'`."
      );
    const t = typeof e == 'function' ? Cx(e) : e,
      n = (r, s) => Jx(t, r, s);
    return (Object.assign(n, t), n);
  },
  Zx = e => Xx,
  ey = {};
function ty(e, t) {
  let n;
  try {
    n = e();
  } catch {
    return;
  }
  return {
    getItem: s => {
      var a;
      const l = u => (u === null ? null : JSON.parse(u, void 0)),
        i = (a = n.getItem(s)) != null ? a : null;
      return i instanceof Promise ? i.then(l) : l(i);
    },
    setItem: (s, a) => n.setItem(s, JSON.stringify(a, void 0)),
    removeItem: s => n.removeItem(s),
  };
}
const es = e => t => {
    try {
      const n = e(t);
      return n instanceof Promise
        ? n
        : {
            then(r) {
              return es(r)(n);
            },
            catch(r) {
              return this;
            },
          };
    } catch (n) {
      return {
        then(r) {
          return this;
        },
        catch(r) {
          return es(r)(n);
        },
      };
    }
  },
  ny = (e, t) => (n, r, s) => {
    let a = {
        getStorage: () => localStorage,
        serialize: JSON.stringify,
        deserialize: JSON.parse,
        partialize: v => v,
        version: 0,
        merge: (v, h) => ({ ...h, ...v }),
        ...t,
      },
      l = !1;
    const i = new Set(),
      u = new Set();
    let c;
    try {
      c = a.getStorage();
    } catch {}
    if (!c)
      return e(
        (...v) => {
          (console.warn(
            `[zustand persist middleware] Unable to update item '${a.name}', the given storage is currently unavailable.`
          ),
            n(...v));
        },
        r,
        s
      );
    const d = es(a.serialize),
      f = () => {
        const v = a.partialize({ ...r() });
        let h;
        const p = d({ state: v, version: a.version })
          .then(g => c.setItem(a.name, g))
          .catch(g => {
            h = g;
          });
        if (h) throw h;
        return p;
      },
      m = s.setState;
    s.setState = (v, h) => {
      (m(v, h), f());
    };
    const b = e(
      (...v) => {
        (n(...v), f());
      },
      r,
      s
    );
    let x;
    const w = () => {
      var v;
      if (!c) return;
      ((l = !1), i.forEach(p => p(r())));
      const h = ((v = a.onRehydrateStorage) == null ? void 0 : v.call(a, r())) || void 0;
      return es(c.getItem.bind(c))(a.name)
        .then(p => {
          if (p) return a.deserialize(p);
        })
        .then(p => {
          if (p)
            if (typeof p.version == 'number' && p.version !== a.version) {
              if (a.migrate) return a.migrate(p.state, p.version);
              console.error(
                "State loaded from storage couldn't be migrated since no migrate function was provided"
              );
            } else return p.state;
        })
        .then(p => {
          var g;
          return ((x = a.merge(p, (g = r()) != null ? g : b)), n(x, !0), f());
        })
        .then(() => {
          (h == null || h(x, void 0), (l = !0), u.forEach(p => p(x)));
        })
        .catch(p => {
          h == null || h(void 0, p);
        });
    };
    return (
      (s.persist = {
        setOptions: v => {
          ((a = { ...a, ...v }), v.getStorage && (c = v.getStorage()));
        },
        clearStorage: () => {
          c == null || c.removeItem(a.name);
        },
        getOptions: () => a,
        rehydrate: () => w(),
        hasHydrated: () => l,
        onHydrate: v => (
          i.add(v),
          () => {
            i.delete(v);
          }
        ),
        onFinishHydration: v => (
          u.add(v),
          () => {
            u.delete(v);
          }
        ),
      }),
      w(),
      x || b
    );
  },
  ry = (e, t) => (n, r, s) => {
    let a = {
        storage: ty(() => localStorage),
        partialize: w => w,
        version: 0,
        merge: (w, v) => ({ ...v, ...w }),
        ...t,
      },
      l = !1;
    const i = new Set(),
      u = new Set();
    let c = a.storage;
    if (!c)
      return e(
        (...w) => {
          (console.warn(
            `[zustand persist middleware] Unable to update item '${a.name}', the given storage is currently unavailable.`
          ),
            n(...w));
        },
        r,
        s
      );
    const d = () => {
        const w = a.partialize({ ...r() });
        return c.setItem(a.name, { state: w, version: a.version });
      },
      f = s.setState;
    s.setState = (w, v) => {
      (f(w, v), d());
    };
    const m = e(
      (...w) => {
        (n(...w), d());
      },
      r,
      s
    );
    s.getInitialState = () => m;
    let b;
    const x = () => {
      var w, v;
      if (!c) return;
      ((l = !1),
        i.forEach(p => {
          var g;
          return p((g = r()) != null ? g : m);
        }));
      const h =
        ((v = a.onRehydrateStorage) == null ? void 0 : v.call(a, (w = r()) != null ? w : m)) ||
        void 0;
      return es(c.getItem.bind(c))(a.name)
        .then(p => {
          if (p)
            if (typeof p.version == 'number' && p.version !== a.version) {
              if (a.migrate) return [!0, a.migrate(p.state, p.version)];
              console.error(
                "State loaded from storage couldn't be migrated since no migrate function was provided"
              );
            } else return [!1, p.state];
          return [!1, void 0];
        })
        .then(p => {
          var g;
          const [j, k] = p;
          if (((b = a.merge(k, (g = r()) != null ? g : m)), n(b, !0), j)) return d();
        })
        .then(() => {
          (h == null || h(b, void 0), (b = r()), (l = !0), u.forEach(p => p(b)));
        })
        .catch(p => {
          h == null || h(void 0, p);
        });
    };
    return (
      (s.persist = {
        setOptions: w => {
          ((a = { ...a, ...w }), w.storage && (c = w.storage));
        },
        clearStorage: () => {
          c == null || c.removeItem(a.name);
        },
        getOptions: () => a,
        rehydrate: () => x(),
        hasHydrated: () => l,
        onHydrate: w => (
          i.add(w),
          () => {
            i.delete(w);
          }
        ),
        onFinishHydration: w => (
          u.add(w),
          () => {
            u.delete(w);
          }
        ),
      }),
      a.skipHydration || x(),
      b || m
    );
  },
  sy = (e, t) =>
    'getStorage' in t || 'serialize' in t || 'deserialize' in t
      ? ((ey ? 'production' : void 0) !== 'production' &&
          console.warn(
            '[DEPRECATED] `getStorage`, `serialize` and `deserialize` options are deprecated. Use `storage` option instead.'
          ),
        ny(e, t))
      : ry(e, t),
  ay = sy,
  pe = Zx()(
    ay(
      e => ({
        user: null,
        token: null,
        isAuthenticated: !1,
        isLoading: !1,
        setUser: t => e({ user: t, isAuthenticated: !0 }),
        setToken: t => e({ token: t }),
        login: (t, n) => e({ user: t, token: n, isAuthenticated: !0, isLoading: !1 }),
        logout: () => e({ user: null, token: null, isAuthenticated: !1, isLoading: !1 }),
        setLoading: t => e({ isLoading: t }),
      }),
      {
        name: 'auth-storage',
        partialize: e => ({ user: e.user, token: e.token, isAuthenticated: e.isAuthenticated }),
      }
    )
  );
function oy() {
  const e = pe(s => s.isAuthenticated),
    t = pe(s => s.user),
    [n, r] = y.useState({ x: 0, y: 0 });
  return (
    y.useEffect(() => {
      const s = a => {
        r({ x: a.clientX, y: a.clientY });
      };
      return (
        window.addEventListener('mousemove', s),
        () => window.removeEventListener('mousemove', s)
      );
    }, []),
    o.jsxs('div', {
      className: 'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden',
      children: [
        o.jsx('div', {
          className: 'absolute inset-0 opacity-30',
          style: {
            background: `radial-gradient(circle at ${n.x}px ${n.y}px, rgba(59, 130, 246, 0.15), transparent 50%)`,
          },
        }),
        o.jsx('div', {
          className:
            'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
        }),
        o.jsx('div', {
          className:
            'absolute top-20 left-10 w-72 h-72 bg-cyan-500/30 rounded-full blur-[120px] animate-pulse',
        }),
        o.jsx('div', {
          className:
            'absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-[120px] animate-pulse',
          style: { animationDelay: '1s' },
        }),
        o.jsxs('main', {
          className: 'relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20',
          children: [
            o.jsxs('div', {
              className: 'text-center mb-20 animate-fade-in',
              children: [
                o.jsx('div', {
                  className: 'inline-block mb-6',
                  children: o.jsx('span', {
                    className:
                      'px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-full text-cyan-400 text-sm font-mono font-medium backdrop-blur-sm',
                    children: Tn.name,
                  }),
                }),
                o.jsx('h1', {
                  className:
                    'text-6xl md:text-7xl lg:text-8xl font-display font-bold mb-6 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent leading-tight',
                  children: e
                    ? `Привет, ${t == null ? void 0 : t.name}`
                    : 'Будущее начинается здесь',
                }),
                o.jsx('p', {
                  className:
                    'mt-6 max-w-3xl mx-auto text-xl md:text-2xl text-gray-400 font-sans leading-relaxed',
                  children: e
                    ? 'Продолжай свой путь к вершинам знаний'
                    : 'Интерактивная платформа нового поколения для подготовки к поступлению',
                }),
                !e &&
                  o.jsxs('div', {
                    className: 'mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6',
                    children: [
                      o.jsxs(Ce, {
                        to: '/register',
                        className:
                          'group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-display font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]',
                        children: [
                          o.jsx('span', {
                            className: 'relative z-10',
                            children: 'Начать подготовку',
                          }),
                          o.jsx('div', {
                            className:
                              'absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                          }),
                        ],
                      }),
                      o.jsx(Ce, {
                        to: '/login',
                        className:
                          'px-8 py-4 border-2 border-cyan-500/50 text-cyan-400 rounded-xl font-display font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-sm',
                        children: 'Войти в систему',
                      }),
                    ],
                  }),
                e &&
                  o.jsxs('div', {
                    className: 'mt-12 flex flex-col sm:flex-row justify-center gap-4 sm:gap-6',
                    children: [
                      o.jsxs(Ce, {
                        to: '/dashboard',
                        className:
                          'group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-display font-semibold overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]',
                        children: [
                          o.jsx('span', {
                            className: 'relative z-10',
                            children: 'Панель управления',
                          }),
                          o.jsx('div', {
                            className:
                              'absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                          }),
                        ],
                      }),
                      o.jsx(Ce, {
                        to: '/profile',
                        className:
                          'px-8 py-4 border-2 border-cyan-500/50 text-cyan-400 rounded-xl font-display font-semibold hover:bg-cyan-500/10 hover:border-cyan-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-sm',
                        children: 'Личный кабинет',
                      }),
                    ],
                  }),
              ],
            }),
            o.jsxs('div', {
              className: 'mt-24',
              children: [
                o.jsx('h2', {
                  className:
                    'text-4xl md:text-5xl font-display font-bold text-center mb-4 text-white',
                  children: 'Направления обучения',
                }),
                o.jsx('p', {
                  className: 'text-center text-gray-400 text-lg mb-12 font-sans',
                  children: 'Выбери свой путь к успеху',
                }),
                o.jsx('div', {
                  className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
                  children: Object.entries(Hi).map(([s, a], l) =>
                    o.jsx(ly, { direction: s, label: a, description: iy(s), index: l }, s)
                  ),
                }),
              ],
            }),
            o.jsxs('div', {
              className: 'mt-32 grid grid-cols-1 lg:grid-cols-2 gap-8',
              children: [
                o.jsxs('div', {
                  className:
                    'group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 hover:border-cyan-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(6,182,212,0.15)]',
                  children: [
                    o.jsx('div', {
                      className:
                        'absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                    }),
                    o.jsxs('div', {
                      className: 'relative z-10',
                      children: [
                        o.jsxs('h3', {
                          className:
                            'text-2xl font-display font-bold text-white mb-6 flex items-center',
                          children: [
                            o.jsx('span', {
                              className: 'w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse',
                            }),
                            'Контакты',
                          ],
                        }),
                        o.jsxs('div', {
                          className: 'space-y-3 text-gray-300',
                          children: [
                            o.jsxs('p', {
                              className: 'flex items-center',
                              children: [
                                o.jsx('span', {
                                  className: 'text-cyan-400 font-mono mr-3',
                                  children: '📞',
                                }),
                                o.jsx('span', { className: 'font-sans', children: Tn.phone }),
                              ],
                            }),
                            o.jsxs('p', {
                              className: 'flex items-center',
                              children: [
                                o.jsx('span', {
                                  className: 'text-cyan-400 font-mono mr-3',
                                  children: '✉️',
                                }),
                                o.jsx('span', { className: 'font-sans', children: Tn.email }),
                              ],
                            }),
                            o.jsxs('a', {
                              href: Tn.website,
                              target: '_blank',
                              rel: 'noopener noreferrer',
                              className:
                                'flex items-center text-cyan-400 hover:text-cyan-300 transition-colors group/link',
                              children: [
                                o.jsx('span', { className: 'mr-3', children: '🌐' }),
                                o.jsx('span', {
                                  className:
                                    'font-sans border-b border-cyan-400/0 group-hover/link:border-cyan-400/100 transition-all',
                                  children: 'Официальный сайт',
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
                o.jsxs('div', {
                  className:
                    'group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-500 hover:shadow-[0_0_50px_rgba(168,85,247,0.15)]',
                  children: [
                    o.jsx('div', {
                      className:
                        'absolute inset-0 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
                    }),
                    o.jsxs('div', {
                      className: 'relative z-10',
                      children: [
                        o.jsxs('h3', {
                          className:
                            'text-2xl font-display font-bold text-white mb-6 flex items-center',
                          children: [
                            o.jsx('span', {
                              className: 'w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse',
                              style: { animationDelay: '0.5s' },
                            }),
                            'Сроки приема',
                          ],
                        }),
                        o.jsxs('div', {
                          className: 'space-y-3 text-gray-300',
                          children: [
                            o.jsxs('p', {
                              className: 'flex items-start',
                              children: [
                                o.jsx('span', {
                                  className: 'text-purple-400 font-mono mr-3 mt-1',
                                  children: '📄',
                                }),
                                o.jsxs('span', {
                                  className: 'font-sans',
                                  children: [
                                    o.jsx('span', {
                                      className: 'text-gray-400 text-sm block',
                                      children: 'Прием документов',
                                    }),
                                    Tn.admissionPeriod.documentSubmission,
                                  ],
                                }),
                              ],
                            }),
                            o.jsxs('p', {
                              className: 'flex items-start',
                              children: [
                                o.jsx('span', {
                                  className: 'text-purple-400 font-mono mr-3 mt-1',
                                  children: '📝',
                                }),
                                o.jsxs('span', {
                                  className: 'font-sans',
                                  children: [
                                    o.jsx('span', {
                                      className: 'text-gray-400 text-sm block',
                                      children: 'Экзамены',
                                    }),
                                    Tn.admissionPeriod.exams,
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        }),
      ],
    })
  );
}
function ly({ label: e, description: t, index: n }) {
  const [r, s] = y.useState(!1),
    a = ['💻', '🤖', '🏥', '🧬', '🎨'],
    l = [
      'from-cyan-500/20 to-blue-500/20',
      'from-blue-500/20 to-purple-500/20',
      'from-purple-500/20 to-pink-500/20',
      'from-pink-500/20 to-red-500/20',
      'from-red-500/20 to-orange-500/20',
    ],
    i = [
      'from-cyan-500/50 to-blue-500/50',
      'from-blue-500/50 to-purple-500/50',
      'from-purple-500/50 to-pink-500/50',
      'from-pink-500/50 to-red-500/50',
      'from-red-500/50 to-orange-500/50',
    ];
  return o.jsxs('div', {
    className: 'group relative',
    onMouseEnter: () => s(!0),
    onMouseLeave: () => s(!1),
    style: { animationDelay: `${n * 100}ms` },
    children: [
      o.jsx('div', {
        className: `absolute -inset-0.5 bg-gradient-to-r ${i[n]} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`,
      }),
      o.jsxs('div', {
        className: `relative bg-gradient-to-br ${l[n]} backdrop-blur-xl border border-gray-700/50 rounded-2xl p-8 transition-all duration-500 group-hover:border-transparent`,
        children: [
          o.jsx('div', {
            className:
              'absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          }),
          o.jsxs('div', {
            className: 'relative z-10',
            children: [
              o.jsx('div', {
                className:
                  'text-5xl mb-4 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12',
                children: a[n],
              }),
              o.jsx('h3', {
                className:
                  'text-2xl font-display font-bold text-white mb-3 transition-colors duration-300',
                children: e,
              }),
              o.jsx('p', { className: 'text-gray-400 font-sans leading-relaxed', children: t }),
              o.jsxs('div', {
                className: `mt-6 flex items-center text-cyan-400 font-sans font-medium transition-all duration-300 ${r ? 'translate-x-2' : ''}`,
                children: [
                  o.jsx('span', { children: 'Узнать больше' }),
                  o.jsx('svg', {
                    className: 'w-5 h-5 ml-2',
                    fill: 'none',
                    stroke: 'currentColor',
                    viewBox: '0 0 24 24',
                    children: o.jsx('path', {
                      strokeLinecap: 'round',
                      strokeLinejoin: 'round',
                      strokeWidth: 2,
                      d: 'M17 8l4 4m0 0l-4 4m4-4H3',
                    }),
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function iy(e) {
  return {
    [ke.PROGRAMMING]: 'Углубленное изучение программирования и информатики',
    [ke.ROBOTICS]: 'Робототехника и автоматизация',
    [ke.MEDICINE]: 'Медицинские технологии будущего',
    [ke.BIOTECHNOLOGY]: 'Биотехнологии и генетика',
    [ke.CULTURE]: 'Культура и искусство',
  }[e];
}
function Un({ label: e, error: t, className: n = '', ...r }) {
  return o.jsxs('div', {
    className: 'w-full',
    children: [
      e &&
        o.jsx('label', {
          className: 'block text-sm font-medium text-gray-400 dark:text-gray-400 mb-2 font-sans',
          children: e,
        }),
      o.jsx('input', {
        className: `
          w-full px-4 py-3
          bg-gray-800/50 dark:bg-gray-800/50
          border ${t ? 'border-red-500/50' : 'border-gray-700'}
          rounded-xl text-white dark:text-white
          placeholder-gray-500 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
          transition-all duration-300
          font-sans
          ${n}
        `,
        ...r,
      }),
      t && o.jsx('p', { className: 'mt-2 text-sm text-red-400 font-sans', children: t }),
    ],
  });
}
function te({
  children: e,
  variant: t = 'primary',
  isLoading: n = !1,
  disabled: r,
  className: s = '',
  ...a
}) {
  const l =
      'px-6 py-3 rounded-xl font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95',
    i = {
      primary:
        'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 dark:from-blue-500 dark:to-indigo-500 dark:hover:from-blue-600 dark:hover:to-indigo-600 focus:ring-blue-500 shadow-md hover:shadow-lg disabled:hover:scale-100',
      secondary:
        'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 focus:ring-gray-500 shadow-sm hover:shadow-md disabled:hover:scale-100',
      outline:
        'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/20 focus:ring-blue-500 hover:shadow-md disabled:hover:scale-100',
    };
  return o.jsx('button', {
    className: `${l} ${i[t]} ${s}`,
    disabled: r || n,
    ...a,
    children: n
      ? o.jsxs('span', {
          className: 'flex items-center justify-center',
          children: [
            o.jsxs('svg', {
              className: 'animate-spin -ml-1 mr-2 h-4 w-4 text-white',
              xmlns: 'http://www.w3.org/2000/svg',
              fill: 'none',
              viewBox: '0 0 24 24',
              children: [
                o.jsx('circle', {
                  className: 'opacity-25',
                  cx: '12',
                  cy: '12',
                  r: '10',
                  stroke: 'currentColor',
                  strokeWidth: '4',
                }),
                o.jsx('path', {
                  className: 'opacity-75',
                  fill: 'currentColor',
                  d: 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z',
                }),
              ],
            }),
            'Загрузка...',
          ],
        })
      : e,
  });
}
function _0(e, t) {
  return function () {
    return e.apply(t, arguments);
  };
}
const { toString: uy } = Object.prototype,
  { getPrototypeOf: Vi } = Object,
  { iterator: Ga, toStringTag: A0 } = Symbol,
  Ka = (e => t => {
    const n = uy.call(t);
    return e[n] || (e[n] = n.slice(8, -1).toLowerCase());
  })(Object.create(null)),
  it = e => ((e = e.toLowerCase()), t => Ka(t) === e),
  Qa = e => t => typeof t === e,
  { isArray: cr } = Array,
  sr = Qa('undefined');
function is(e) {
  return (
    e !== null &&
    !sr(e) &&
    e.constructor !== null &&
    !sr(e.constructor) &&
    $e(e.constructor.isBuffer) &&
    e.constructor.isBuffer(e)
  );
}
const L0 = it('ArrayBuffer');
function cy(e) {
  let t;
  return (
    typeof ArrayBuffer < 'u' && ArrayBuffer.isView
      ? (t = ArrayBuffer.isView(e))
      : (t = e && e.buffer && L0(e.buffer)),
    t
  );
}
const dy = Qa('string'),
  $e = Qa('function'),
  P0 = Qa('number'),
  us = e => e !== null && typeof e == 'object',
  fy = e => e === !0 || e === !1,
  Qs = e => {
    if (Ka(e) !== 'object') return !1;
    const t = Vi(e);
    return (
      (t === null || t === Object.prototype || Object.getPrototypeOf(t) === null) &&
      !(A0 in e) &&
      !(Ga in e)
    );
  },
  py = e => {
    if (!us(e) || is(e)) return !1;
    try {
      return Object.keys(e).length === 0 && Object.getPrototypeOf(e) === Object.prototype;
    } catch {
      return !1;
    }
  },
  my = it('Date'),
  hy = it('File'),
  gy = it('Blob'),
  xy = it('FileList'),
  yy = e => us(e) && $e(e.pipe),
  vy = e => {
    let t;
    return (
      e &&
      ((typeof FormData == 'function' && e instanceof FormData) ||
        ($e(e.append) &&
          ((t = Ka(e)) === 'formdata' ||
            (t === 'object' && $e(e.toString) && e.toString() === '[object FormData]'))))
    );
  },
  wy = it('URLSearchParams'),
  [by, jy, Ny, Sy] = ['ReadableStream', 'Request', 'Response', 'Headers'].map(it),
  ky = e => (e.trim ? e.trim() : e.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, ''));
function cs(e, t, { allOwnKeys: n = !1 } = {}) {
  if (e === null || typeof e > 'u') return;
  let r, s;
  if ((typeof e != 'object' && (e = [e]), cr(e)))
    for (r = 0, s = e.length; r < s; r++) t.call(null, e[r], r, e);
  else {
    if (is(e)) return;
    const a = n ? Object.getOwnPropertyNames(e) : Object.keys(e),
      l = a.length;
    let i;
    for (r = 0; r < l; r++) ((i = a[r]), t.call(null, e[i], i, e));
  }
}
function R0(e, t) {
  if (is(e)) return null;
  t = t.toLowerCase();
  const n = Object.keys(e);
  let r = n.length,
    s;
  for (; r-- > 0; ) if (((s = n[r]), t === s.toLowerCase())) return s;
  return null;
}
const pn =
    typeof globalThis < 'u'
      ? globalThis
      : typeof self < 'u'
        ? self
        : typeof window < 'u'
          ? window
          : global,
  I0 = e => !sr(e) && e !== pn;
function Il() {
  const { caseless: e, skipUndefined: t } = (I0(this) && this) || {},
    n = {},
    r = (s, a) => {
      const l = (e && R0(n, a)) || a;
      Qs(n[l]) && Qs(s)
        ? (n[l] = Il(n[l], s))
        : Qs(s)
          ? (n[l] = Il({}, s))
          : cr(s)
            ? (n[l] = s.slice())
            : (!t || !sr(s)) && (n[l] = s);
    };
  for (let s = 0, a = arguments.length; s < a; s++) arguments[s] && cs(arguments[s], r);
  return n;
}
const Ey = (e, t, n, { allOwnKeys: r } = {}) => (
    cs(
      t,
      (s, a) => {
        n && $e(s) ? (e[a] = _0(s, n)) : (e[a] = s);
      },
      { allOwnKeys: r }
    ),
    e
  ),
  Cy = e => (e.charCodeAt(0) === 65279 && (e = e.slice(1)), e),
  Ty = (e, t, n, r) => {
    ((e.prototype = Object.create(t.prototype, r)),
      (e.prototype.constructor = e),
      Object.defineProperty(e, 'super', { value: t.prototype }),
      n && Object.assign(e.prototype, n));
  },
  _y = (e, t, n, r) => {
    let s, a, l;
    const i = {};
    if (((t = t || {}), e == null)) return t;
    do {
      for (s = Object.getOwnPropertyNames(e), a = s.length; a-- > 0; )
        ((l = s[a]), (!r || r(l, e, t)) && !i[l] && ((t[l] = e[l]), (i[l] = !0)));
      e = n !== !1 && Vi(e);
    } while (e && (!n || n(e, t)) && e !== Object.prototype);
    return t;
  },
  Ay = (e, t, n) => {
    ((e = String(e)), (n === void 0 || n > e.length) && (n = e.length), (n -= t.length));
    const r = e.indexOf(t, n);
    return r !== -1 && r === n;
  },
  Ly = e => {
    if (!e) return null;
    if (cr(e)) return e;
    let t = e.length;
    if (!P0(t)) return null;
    const n = new Array(t);
    for (; t-- > 0; ) n[t] = e[t];
    return n;
  },
  Py = (
    e => t =>
      e && t instanceof e
  )(typeof Uint8Array < 'u' && Vi(Uint8Array)),
  Ry = (e, t) => {
    const r = (e && e[Ga]).call(e);
    let s;
    for (; (s = r.next()) && !s.done; ) {
      const a = s.value;
      t.call(e, a[0], a[1]);
    }
  },
  Iy = (e, t) => {
    let n;
    const r = [];
    for (; (n = e.exec(t)) !== null; ) r.push(n);
    return r;
  },
  Oy = it('HTMLFormElement'),
  My = e =>
    e.toLowerCase().replace(/[-_\s]([a-z\d])(\w*)/g, function (n, r, s) {
      return r.toUpperCase() + s;
    }),
  vc = (
    ({ hasOwnProperty: e }) =>
    (t, n) =>
      e.call(t, n)
  )(Object.prototype),
  Dy = it('RegExp'),
  O0 = (e, t) => {
    const n = Object.getOwnPropertyDescriptors(e),
      r = {};
    (cs(n, (s, a) => {
      let l;
      (l = t(s, a, e)) !== !1 && (r[a] = l || s);
    }),
      Object.defineProperties(e, r));
  },
  zy = e => {
    O0(e, (t, n) => {
      if ($e(e) && ['arguments', 'caller', 'callee'].indexOf(n) !== -1) return !1;
      const r = e[n];
      if ($e(r)) {
        if (((t.enumerable = !1), 'writable' in t)) {
          t.writable = !1;
          return;
        }
        t.set ||
          (t.set = () => {
            throw Error("Can not rewrite read-only method '" + n + "'");
          });
      }
    });
  },
  $y = (e, t) => {
    const n = {},
      r = s => {
        s.forEach(a => {
          n[a] = !0;
        });
      };
    return (cr(e) ? r(e) : r(String(e).split(t)), n);
  },
  By = () => {},
  Fy = (e, t) => (e != null && Number.isFinite((e = +e)) ? e : t);
function Uy(e) {
  return !!(e && $e(e.append) && e[A0] === 'FormData' && e[Ga]);
}
const Hy = e => {
    const t = new Array(10),
      n = (r, s) => {
        if (us(r)) {
          if (t.indexOf(r) >= 0) return;
          if (is(r)) return r;
          if (!('toJSON' in r)) {
            t[s] = r;
            const a = cr(r) ? [] : {};
            return (
              cs(r, (l, i) => {
                const u = n(l, s + 1);
                !sr(u) && (a[i] = u);
              }),
              (t[s] = void 0),
              a
            );
          }
        }
        return r;
      };
    return n(e, 0);
  },
  Wy = it('AsyncFunction'),
  Vy = e => e && (us(e) || $e(e)) && $e(e.then) && $e(e.catch),
  M0 = ((e, t) =>
    e
      ? setImmediate
      : t
        ? ((n, r) => (
            pn.addEventListener(
              'message',
              ({ source: s, data: a }) => {
                s === pn && a === n && r.length && r.shift()();
              },
              !1
            ),
            s => {
              (r.push(s), pn.postMessage(n, '*'));
            }
          ))(`axios@${Math.random()}`, [])
        : n => setTimeout(n))(typeof setImmediate == 'function', $e(pn.postMessage)),
  Gy =
    typeof queueMicrotask < 'u'
      ? queueMicrotask.bind(pn)
      : (typeof process < 'u' && process.nextTick) || M0,
  Ky = e => e != null && $e(e[Ga]),
  N = {
    isArray: cr,
    isArrayBuffer: L0,
    isBuffer: is,
    isFormData: vy,
    isArrayBufferView: cy,
    isString: dy,
    isNumber: P0,
    isBoolean: fy,
    isObject: us,
    isPlainObject: Qs,
    isEmptyObject: py,
    isReadableStream: by,
    isRequest: jy,
    isResponse: Ny,
    isHeaders: Sy,
    isUndefined: sr,
    isDate: my,
    isFile: hy,
    isBlob: gy,
    isRegExp: Dy,
    isFunction: $e,
    isStream: yy,
    isURLSearchParams: wy,
    isTypedArray: Py,
    isFileList: xy,
    forEach: cs,
    merge: Il,
    extend: Ey,
    trim: ky,
    stripBOM: Cy,
    inherits: Ty,
    toFlatObject: _y,
    kindOf: Ka,
    kindOfTest: it,
    endsWith: Ay,
    toArray: Ly,
    forEachEntry: Ry,
    matchAll: Iy,
    isHTMLForm: Oy,
    hasOwnProperty: vc,
    hasOwnProp: vc,
    reduceDescriptors: O0,
    freezeMethods: zy,
    toObjectSet: $y,
    toCamelCase: My,
    noop: By,
    toFiniteNumber: Fy,
    findKey: R0,
    global: pn,
    isContextDefined: I0,
    isSpecCompliantForm: Uy,
    toJSONObject: Hy,
    isAsyncFn: Wy,
    isThenable: Vy,
    setImmediate: M0,
    asap: Gy,
    isIterable: Ky,
  };
function B(e, t, n, r, s) {
  (Error.call(this),
    Error.captureStackTrace
      ? Error.captureStackTrace(this, this.constructor)
      : (this.stack = new Error().stack),
    (this.message = e),
    (this.name = 'AxiosError'),
    t && (this.code = t),
    n && (this.config = n),
    r && (this.request = r),
    s && ((this.response = s), (this.status = s.status ? s.status : null)));
}
N.inherits(B, Error, {
  toJSON: function () {
    return {
      message: this.message,
      name: this.name,
      description: this.description,
      number: this.number,
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      config: N.toJSONObject(this.config),
      code: this.code,
      status: this.status,
    };
  },
});
const D0 = B.prototype,
  z0 = {};
[
  'ERR_BAD_OPTION_VALUE',
  'ERR_BAD_OPTION',
  'ECONNABORTED',
  'ETIMEDOUT',
  'ERR_NETWORK',
  'ERR_FR_TOO_MANY_REDIRECTS',
  'ERR_DEPRECATED',
  'ERR_BAD_RESPONSE',
  'ERR_BAD_REQUEST',
  'ERR_CANCELED',
  'ERR_NOT_SUPPORT',
  'ERR_INVALID_URL',
].forEach(e => {
  z0[e] = { value: e };
});
Object.defineProperties(B, z0);
Object.defineProperty(D0, 'isAxiosError', { value: !0 });
B.from = (e, t, n, r, s, a) => {
  const l = Object.create(D0);
  N.toFlatObject(
    e,
    l,
    function (d) {
      return d !== Error.prototype;
    },
    c => c !== 'isAxiosError'
  );
  const i = e && e.message ? e.message : 'Error',
    u = t == null && e ? e.code : t;
  return (
    B.call(l, i, u, n, r, s),
    e && l.cause == null && Object.defineProperty(l, 'cause', { value: e, configurable: !0 }),
    (l.name = (e && e.name) || 'Error'),
    a && Object.assign(l, a),
    l
  );
};
const Qy = null;
function Ol(e) {
  return N.isPlainObject(e) || N.isArray(e);
}
function $0(e) {
  return N.endsWith(e, '[]') ? e.slice(0, -2) : e;
}
function wc(e, t, n) {
  return e
    ? e
        .concat(t)
        .map(function (s, a) {
          return ((s = $0(s)), !n && a ? '[' + s + ']' : s);
        })
        .join(n ? '.' : '')
    : t;
}
function qy(e) {
  return N.isArray(e) && !e.some(Ol);
}
const Yy = N.toFlatObject(N, {}, null, function (t) {
  return /^is[A-Z]/.test(t);
});
function qa(e, t, n) {
  if (!N.isObject(e)) throw new TypeError('target must be an object');
  ((t = t || new FormData()),
    (n = N.toFlatObject(n, { metaTokens: !0, dots: !1, indexes: !1 }, !1, function (w, v) {
      return !N.isUndefined(v[w]);
    })));
  const r = n.metaTokens,
    s = n.visitor || d,
    a = n.dots,
    l = n.indexes,
    u = (n.Blob || (typeof Blob < 'u' && Blob)) && N.isSpecCompliantForm(t);
  if (!N.isFunction(s)) throw new TypeError('visitor must be a function');
  function c(x) {
    if (x === null) return '';
    if (N.isDate(x)) return x.toISOString();
    if (N.isBoolean(x)) return x.toString();
    if (!u && N.isBlob(x)) throw new B('Blob is not supported. Use a Buffer instead.');
    return N.isArrayBuffer(x) || N.isTypedArray(x)
      ? u && typeof Blob == 'function'
        ? new Blob([x])
        : Buffer.from(x)
      : x;
  }
  function d(x, w, v) {
    let h = x;
    if (x && !v && typeof x == 'object') {
      if (N.endsWith(w, '{}')) ((w = r ? w : w.slice(0, -2)), (x = JSON.stringify(x)));
      else if (
        (N.isArray(x) && qy(x)) ||
        ((N.isFileList(x) || N.endsWith(w, '[]')) && (h = N.toArray(x)))
      )
        return (
          (w = $0(w)),
          h.forEach(function (g, j) {
            !(N.isUndefined(g) || g === null) &&
              t.append(l === !0 ? wc([w], j, a) : l === null ? w : w + '[]', c(g));
          }),
          !1
        );
    }
    return Ol(x) ? !0 : (t.append(wc(v, w, a), c(x)), !1);
  }
  const f = [],
    m = Object.assign(Yy, { defaultVisitor: d, convertValue: c, isVisitable: Ol });
  function b(x, w) {
    if (!N.isUndefined(x)) {
      if (f.indexOf(x) !== -1) throw Error('Circular reference detected in ' + w.join('.'));
      (f.push(x),
        N.forEach(x, function (h, p) {
          (!(N.isUndefined(h) || h === null) &&
            s.call(t, h, N.isString(p) ? p.trim() : p, w, m)) === !0 && b(h, w ? w.concat(p) : [p]);
        }),
        f.pop());
    }
  }
  if (!N.isObject(e)) throw new TypeError('data must be an object');
  return (b(e), t);
}
function bc(e) {
  const t = { '!': '%21', "'": '%27', '(': '%28', ')': '%29', '~': '%7E', '%20': '+', '%00': '\0' };
  return encodeURIComponent(e).replace(/[!'()~]|%20|%00/g, function (r) {
    return t[r];
  });
}
function Gi(e, t) {
  ((this._pairs = []), e && qa(e, this, t));
}
const B0 = Gi.prototype;
B0.append = function (t, n) {
  this._pairs.push([t, n]);
};
B0.toString = function (t) {
  const n = t
    ? function (r) {
        return t.call(this, r, bc);
      }
    : bc;
  return this._pairs
    .map(function (s) {
      return n(s[0]) + '=' + n(s[1]);
    }, '')
    .join('&');
};
function Jy(e) {
  return encodeURIComponent(e)
    .replace(/%3A/gi, ':')
    .replace(/%24/g, '$')
    .replace(/%2C/gi, ',')
    .replace(/%20/g, '+');
}
function F0(e, t, n) {
  if (!t) return e;
  const r = (n && n.encode) || Jy;
  N.isFunction(n) && (n = { serialize: n });
  const s = n && n.serialize;
  let a;
  if (
    (s ? (a = s(t, n)) : (a = N.isURLSearchParams(t) ? t.toString() : new Gi(t, n).toString(r)), a)
  ) {
    const l = e.indexOf('#');
    (l !== -1 && (e = e.slice(0, l)), (e += (e.indexOf('?') === -1 ? '?' : '&') + a));
  }
  return e;
}
class jc {
  constructor() {
    this.handlers = [];
  }
  use(t, n, r) {
    return (
      this.handlers.push({
        fulfilled: t,
        rejected: n,
        synchronous: r ? r.synchronous : !1,
        runWhen: r ? r.runWhen : null,
      }),
      this.handlers.length - 1
    );
  }
  eject(t) {
    this.handlers[t] && (this.handlers[t] = null);
  }
  clear() {
    this.handlers && (this.handlers = []);
  }
  forEach(t) {
    N.forEach(this.handlers, function (r) {
      r !== null && t(r);
    });
  }
}
const U0 = { silentJSONParsing: !0, forcedJSONParsing: !0, clarifyTimeoutError: !1 },
  Xy = typeof URLSearchParams < 'u' ? URLSearchParams : Gi,
  Zy = typeof FormData < 'u' ? FormData : null,
  ev = typeof Blob < 'u' ? Blob : null,
  tv = {
    isBrowser: !0,
    classes: { URLSearchParams: Xy, FormData: Zy, Blob: ev },
    protocols: ['http', 'https', 'file', 'blob', 'url', 'data'],
  },
  Ki = typeof window < 'u' && typeof document < 'u',
  Ml = (typeof navigator == 'object' && navigator) || void 0,
  nv = Ki && (!Ml || ['ReactNative', 'NativeScript', 'NS'].indexOf(Ml.product) < 0),
  rv =
    typeof WorkerGlobalScope < 'u' &&
    self instanceof WorkerGlobalScope &&
    typeof self.importScripts == 'function',
  sv = (Ki && window.location.href) || 'http://localhost',
  av = Object.freeze(
    Object.defineProperty(
      {
        __proto__: null,
        hasBrowserEnv: Ki,
        hasStandardBrowserEnv: nv,
        hasStandardBrowserWebWorkerEnv: rv,
        navigator: Ml,
        origin: sv,
      },
      Symbol.toStringTag,
      { value: 'Module' }
    )
  ),
  Ee = { ...av, ...tv };
function ov(e, t) {
  return qa(e, new Ee.classes.URLSearchParams(), {
    visitor: function (n, r, s, a) {
      return Ee.isNode && N.isBuffer(n)
        ? (this.append(r, n.toString('base64')), !1)
        : a.defaultVisitor.apply(this, arguments);
    },
    ...t,
  });
}
function lv(e) {
  return N.matchAll(/\w+|\[(\w*)]/g, e).map(t => (t[0] === '[]' ? '' : t[1] || t[0]));
}
function iv(e) {
  const t = {},
    n = Object.keys(e);
  let r;
  const s = n.length;
  let a;
  for (r = 0; r < s; r++) ((a = n[r]), (t[a] = e[a]));
  return t;
}
function H0(e) {
  function t(n, r, s, a) {
    let l = n[a++];
    if (l === '__proto__') return !0;
    const i = Number.isFinite(+l),
      u = a >= n.length;
    return (
      (l = !l && N.isArray(s) ? s.length : l),
      u
        ? (N.hasOwnProp(s, l) ? (s[l] = [s[l], r]) : (s[l] = r), !i)
        : ((!s[l] || !N.isObject(s[l])) && (s[l] = []),
          t(n, r, s[l], a) && N.isArray(s[l]) && (s[l] = iv(s[l])),
          !i)
    );
  }
  if (N.isFormData(e) && N.isFunction(e.entries)) {
    const n = {};
    return (
      N.forEachEntry(e, (r, s) => {
        t(lv(r), s, n, 0);
      }),
      n
    );
  }
  return null;
}
function uv(e, t, n) {
  if (N.isString(e))
    try {
      return ((t || JSON.parse)(e), N.trim(e));
    } catch (r) {
      if (r.name !== 'SyntaxError') throw r;
    }
  return (n || JSON.stringify)(e);
}
const ds = {
  transitional: U0,
  adapter: ['xhr', 'http', 'fetch'],
  transformRequest: [
    function (t, n) {
      const r = n.getContentType() || '',
        s = r.indexOf('application/json') > -1,
        a = N.isObject(t);
      if ((a && N.isHTMLForm(t) && (t = new FormData(t)), N.isFormData(t)))
        return s ? JSON.stringify(H0(t)) : t;
      if (
        N.isArrayBuffer(t) ||
        N.isBuffer(t) ||
        N.isStream(t) ||
        N.isFile(t) ||
        N.isBlob(t) ||
        N.isReadableStream(t)
      )
        return t;
      if (N.isArrayBufferView(t)) return t.buffer;
      if (N.isURLSearchParams(t))
        return (
          n.setContentType('application/x-www-form-urlencoded;charset=utf-8', !1),
          t.toString()
        );
      let i;
      if (a) {
        if (r.indexOf('application/x-www-form-urlencoded') > -1)
          return ov(t, this.formSerializer).toString();
        if ((i = N.isFileList(t)) || r.indexOf('multipart/form-data') > -1) {
          const u = this.env && this.env.FormData;
          return qa(i ? { 'files[]': t } : t, u && new u(), this.formSerializer);
        }
      }
      return a || s ? (n.setContentType('application/json', !1), uv(t)) : t;
    },
  ],
  transformResponse: [
    function (t) {
      const n = this.transitional || ds.transitional,
        r = n && n.forcedJSONParsing,
        s = this.responseType === 'json';
      if (N.isResponse(t) || N.isReadableStream(t)) return t;
      if (t && N.isString(t) && ((r && !this.responseType) || s)) {
        const l = !(n && n.silentJSONParsing) && s;
        try {
          return JSON.parse(t, this.parseReviver);
        } catch (i) {
          if (l)
            throw i.name === 'SyntaxError'
              ? B.from(i, B.ERR_BAD_RESPONSE, this, null, this.response)
              : i;
        }
      }
      return t;
    },
  ],
  timeout: 0,
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  maxContentLength: -1,
  maxBodyLength: -1,
  env: { FormData: Ee.classes.FormData, Blob: Ee.classes.Blob },
  validateStatus: function (t) {
    return t >= 200 && t < 300;
  },
  headers: { common: { Accept: 'application/json, text/plain, */*', 'Content-Type': void 0 } },
};
N.forEach(['delete', 'get', 'head', 'post', 'put', 'patch'], e => {
  ds.headers[e] = {};
});
const cv = N.toObjectSet([
    'age',
    'authorization',
    'content-length',
    'content-type',
    'etag',
    'expires',
    'from',
    'host',
    'if-modified-since',
    'if-unmodified-since',
    'last-modified',
    'location',
    'max-forwards',
    'proxy-authorization',
    'referer',
    'retry-after',
    'user-agent',
  ]),
  dv = e => {
    const t = {};
    let n, r, s;
    return (
      e &&
        e
          .split(
            `
`
          )
          .forEach(function (l) {
            ((s = l.indexOf(':')),
              (n = l.substring(0, s).trim().toLowerCase()),
              (r = l.substring(s + 1).trim()),
              !(!n || (t[n] && cv[n])) &&
                (n === 'set-cookie'
                  ? t[n]
                    ? t[n].push(r)
                    : (t[n] = [r])
                  : (t[n] = t[n] ? t[n] + ', ' + r : r)));
          }),
      t
    );
  },
  Nc = Symbol('internals');
function wr(e) {
  return e && String(e).trim().toLowerCase();
}
function qs(e) {
  return e === !1 || e == null ? e : N.isArray(e) ? e.map(qs) : String(e);
}
function fv(e) {
  const t = Object.create(null),
    n = /([^\s,;=]+)\s*(?:=\s*([^,;]+))?/g;
  let r;
  for (; (r = n.exec(e)); ) t[r[1]] = r[2];
  return t;
}
const pv = e => /^[-_a-zA-Z0-9^`|~,!#$%&'*+.]+$/.test(e.trim());
function Co(e, t, n, r, s) {
  if (N.isFunction(r)) return r.call(this, t, n);
  if ((s && (t = n), !!N.isString(t))) {
    if (N.isString(r)) return t.indexOf(r) !== -1;
    if (N.isRegExp(r)) return r.test(t);
  }
}
function mv(e) {
  return e
    .trim()
    .toLowerCase()
    .replace(/([a-z\d])(\w*)/g, (t, n, r) => n.toUpperCase() + r);
}
function hv(e, t) {
  const n = N.toCamelCase(' ' + t);
  ['get', 'set', 'has'].forEach(r => {
    Object.defineProperty(e, r + n, {
      value: function (s, a, l) {
        return this[r].call(this, t, s, a, l);
      },
      configurable: !0,
    });
  });
}
let Be = class {
  constructor(t) {
    t && this.set(t);
  }
  set(t, n, r) {
    const s = this;
    function a(i, u, c) {
      const d = wr(u);
      if (!d) throw new Error('header name must be a non-empty string');
      const f = N.findKey(s, d);
      (!f || s[f] === void 0 || c === !0 || (c === void 0 && s[f] !== !1)) && (s[f || u] = qs(i));
    }
    const l = (i, u) => N.forEach(i, (c, d) => a(c, d, u));
    if (N.isPlainObject(t) || t instanceof this.constructor) l(t, n);
    else if (N.isString(t) && (t = t.trim()) && !pv(t)) l(dv(t), n);
    else if (N.isObject(t) && N.isIterable(t)) {
      let i = {},
        u,
        c;
      for (const d of t) {
        if (!N.isArray(d)) throw TypeError('Object iterator must return a key-value pair');
        i[(c = d[0])] = (u = i[c]) ? (N.isArray(u) ? [...u, d[1]] : [u, d[1]]) : d[1];
      }
      l(i, n);
    } else t != null && a(n, t, r);
    return this;
  }
  get(t, n) {
    if (((t = wr(t)), t)) {
      const r = N.findKey(this, t);
      if (r) {
        const s = this[r];
        if (!n) return s;
        if (n === !0) return fv(s);
        if (N.isFunction(n)) return n.call(this, s, r);
        if (N.isRegExp(n)) return n.exec(s);
        throw new TypeError('parser must be boolean|regexp|function');
      }
    }
  }
  has(t, n) {
    if (((t = wr(t)), t)) {
      const r = N.findKey(this, t);
      return !!(r && this[r] !== void 0 && (!n || Co(this, this[r], r, n)));
    }
    return !1;
  }
  delete(t, n) {
    const r = this;
    let s = !1;
    function a(l) {
      if (((l = wr(l)), l)) {
        const i = N.findKey(r, l);
        i && (!n || Co(r, r[i], i, n)) && (delete r[i], (s = !0));
      }
    }
    return (N.isArray(t) ? t.forEach(a) : a(t), s);
  }
  clear(t) {
    const n = Object.keys(this);
    let r = n.length,
      s = !1;
    for (; r--; ) {
      const a = n[r];
      (!t || Co(this, this[a], a, t, !0)) && (delete this[a], (s = !0));
    }
    return s;
  }
  normalize(t) {
    const n = this,
      r = {};
    return (
      N.forEach(this, (s, a) => {
        const l = N.findKey(r, a);
        if (l) {
          ((n[l] = qs(s)), delete n[a]);
          return;
        }
        const i = t ? mv(a) : String(a).trim();
        (i !== a && delete n[a], (n[i] = qs(s)), (r[i] = !0));
      }),
      this
    );
  }
  concat(...t) {
    return this.constructor.concat(this, ...t);
  }
  toJSON(t) {
    const n = Object.create(null);
    return (
      N.forEach(this, (r, s) => {
        r != null && r !== !1 && (n[s] = t && N.isArray(r) ? r.join(', ') : r);
      }),
      n
    );
  }
  [Symbol.iterator]() {
    return Object.entries(this.toJSON())[Symbol.iterator]();
  }
  toString() {
    return Object.entries(this.toJSON()).map(([t, n]) => t + ': ' + n).join(`
`);
  }
  getSetCookie() {
    return this.get('set-cookie') || [];
  }
  get [Symbol.toStringTag]() {
    return 'AxiosHeaders';
  }
  static from(t) {
    return t instanceof this ? t : new this(t);
  }
  static concat(t, ...n) {
    const r = new this(t);
    return (n.forEach(s => r.set(s)), r);
  }
  static accessor(t) {
    const r = (this[Nc] = this[Nc] = { accessors: {} }).accessors,
      s = this.prototype;
    function a(l) {
      const i = wr(l);
      r[i] || (hv(s, l), (r[i] = !0));
    }
    return (N.isArray(t) ? t.forEach(a) : a(t), this);
  }
};
Be.accessor([
  'Content-Type',
  'Content-Length',
  'Accept',
  'Accept-Encoding',
  'User-Agent',
  'Authorization',
]);
N.reduceDescriptors(Be.prototype, ({ value: e }, t) => {
  let n = t[0].toUpperCase() + t.slice(1);
  return {
    get: () => e,
    set(r) {
      this[n] = r;
    },
  };
});
N.freezeMethods(Be);
function To(e, t) {
  const n = this || ds,
    r = t || n,
    s = Be.from(r.headers);
  let a = r.data;
  return (
    N.forEach(e, function (i) {
      a = i.call(n, a, s.normalize(), t ? t.status : void 0);
    }),
    s.normalize(),
    a
  );
}
function W0(e) {
  return !!(e && e.__CANCEL__);
}
function dr(e, t, n) {
  (B.call(this, e ?? 'canceled', B.ERR_CANCELED, t, n), (this.name = 'CanceledError'));
}
N.inherits(dr, B, { __CANCEL__: !0 });
function V0(e, t, n) {
  const r = n.config.validateStatus;
  !n.status || !r || r(n.status)
    ? e(n)
    : t(
        new B(
          'Request failed with status code ' + n.status,
          [B.ERR_BAD_REQUEST, B.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4],
          n.config,
          n.request,
          n
        )
      );
}
function gv(e) {
  const t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
  return (t && t[1]) || '';
}
function xv(e, t) {
  e = e || 10;
  const n = new Array(e),
    r = new Array(e);
  let s = 0,
    a = 0,
    l;
  return (
    (t = t !== void 0 ? t : 1e3),
    function (u) {
      const c = Date.now(),
        d = r[a];
      (l || (l = c), (n[s] = u), (r[s] = c));
      let f = a,
        m = 0;
      for (; f !== s; ) ((m += n[f++]), (f = f % e));
      if (((s = (s + 1) % e), s === a && (a = (a + 1) % e), c - l < t)) return;
      const b = d && c - d;
      return b ? Math.round((m * 1e3) / b) : void 0;
    }
  );
}
function yv(e, t) {
  let n = 0,
    r = 1e3 / t,
    s,
    a;
  const l = (c, d = Date.now()) => {
    ((n = d), (s = null), a && (clearTimeout(a), (a = null)), e(...c));
  };
  return [
    (...c) => {
      const d = Date.now(),
        f = d - n;
      f >= r
        ? l(c, d)
        : ((s = c),
          a ||
            (a = setTimeout(() => {
              ((a = null), l(s));
            }, r - f)));
    },
    () => s && l(s),
  ];
}
const Sa = (e, t, n = 3) => {
    let r = 0;
    const s = xv(50, 250);
    return yv(a => {
      const l = a.loaded,
        i = a.lengthComputable ? a.total : void 0,
        u = l - r,
        c = s(u),
        d = l <= i;
      r = l;
      const f = {
        loaded: l,
        total: i,
        progress: i ? l / i : void 0,
        bytes: u,
        rate: c || void 0,
        estimated: c && i && d ? (i - l) / c : void 0,
        event: a,
        lengthComputable: i != null,
        [t ? 'download' : 'upload']: !0,
      };
      e(f);
    }, n);
  },
  Sc = (e, t) => {
    const n = e != null;
    return [r => t[0]({ lengthComputable: n, total: e, loaded: r }), t[1]];
  },
  kc =
    e =>
    (...t) =>
      N.asap(() => e(...t)),
  vv = Ee.hasStandardBrowserEnv
    ? ((e, t) => n => (
        (n = new URL(n, Ee.origin)),
        e.protocol === n.protocol && e.host === n.host && (t || e.port === n.port)
      ))(new URL(Ee.origin), Ee.navigator && /(msie|trident)/i.test(Ee.navigator.userAgent))
    : () => !0,
  wv = Ee.hasStandardBrowserEnv
    ? {
        write(e, t, n, r, s, a, l) {
          if (typeof document > 'u') return;
          const i = [`${e}=${encodeURIComponent(t)}`];
          (N.isNumber(n) && i.push(`expires=${new Date(n).toUTCString()}`),
            N.isString(r) && i.push(`path=${r}`),
            N.isString(s) && i.push(`domain=${s}`),
            a === !0 && i.push('secure'),
            N.isString(l) && i.push(`SameSite=${l}`),
            (document.cookie = i.join('; ')));
        },
        read(e) {
          if (typeof document > 'u') return null;
          const t = document.cookie.match(new RegExp('(?:^|; )' + e + '=([^;]*)'));
          return t ? decodeURIComponent(t[1]) : null;
        },
        remove(e) {
          this.write(e, '', Date.now() - 864e5, '/');
        },
      }
    : {
        write() {},
        read() {
          return null;
        },
        remove() {},
      };
function bv(e) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
}
function jv(e, t) {
  return t ? e.replace(/\/?\/$/, '') + '/' + t.replace(/^\/+/, '') : e;
}
function G0(e, t, n) {
  let r = !bv(t);
  return e && (r || n == !1) ? jv(e, t) : t;
}
const Ec = e => (e instanceof Be ? { ...e } : e);
function Nn(e, t) {
  t = t || {};
  const n = {};
  function r(c, d, f, m) {
    return N.isPlainObject(c) && N.isPlainObject(d)
      ? N.merge.call({ caseless: m }, c, d)
      : N.isPlainObject(d)
        ? N.merge({}, d)
        : N.isArray(d)
          ? d.slice()
          : d;
  }
  function s(c, d, f, m) {
    if (N.isUndefined(d)) {
      if (!N.isUndefined(c)) return r(void 0, c, f, m);
    } else return r(c, d, f, m);
  }
  function a(c, d) {
    if (!N.isUndefined(d)) return r(void 0, d);
  }
  function l(c, d) {
    if (N.isUndefined(d)) {
      if (!N.isUndefined(c)) return r(void 0, c);
    } else return r(void 0, d);
  }
  function i(c, d, f) {
    if (f in t) return r(c, d);
    if (f in e) return r(void 0, c);
  }
  const u = {
    url: a,
    method: a,
    data: a,
    baseURL: l,
    transformRequest: l,
    transformResponse: l,
    paramsSerializer: l,
    timeout: l,
    timeoutMessage: l,
    withCredentials: l,
    withXSRFToken: l,
    adapter: l,
    responseType: l,
    xsrfCookieName: l,
    xsrfHeaderName: l,
    onUploadProgress: l,
    onDownloadProgress: l,
    decompress: l,
    maxContentLength: l,
    maxBodyLength: l,
    beforeRedirect: l,
    transport: l,
    httpAgent: l,
    httpsAgent: l,
    cancelToken: l,
    socketPath: l,
    responseEncoding: l,
    validateStatus: i,
    headers: (c, d, f) => s(Ec(c), Ec(d), f, !0),
  };
  return (
    N.forEach(Object.keys({ ...e, ...t }), function (d) {
      const f = u[d] || s,
        m = f(e[d], t[d], d);
      (N.isUndefined(m) && f !== i) || (n[d] = m);
    }),
    n
  );
}
const K0 = e => {
    const t = Nn({}, e);
    let {
      data: n,
      withXSRFToken: r,
      xsrfHeaderName: s,
      xsrfCookieName: a,
      headers: l,
      auth: i,
    } = t;
    if (
      ((t.headers = l = Be.from(l)),
      (t.url = F0(G0(t.baseURL, t.url, t.allowAbsoluteUrls), e.params, e.paramsSerializer)),
      i &&
        l.set(
          'Authorization',
          'Basic ' +
            btoa(
              (i.username || '') +
                ':' +
                (i.password ? unescape(encodeURIComponent(i.password)) : '')
            )
        ),
      N.isFormData(n))
    ) {
      if (Ee.hasStandardBrowserEnv || Ee.hasStandardBrowserWebWorkerEnv) l.setContentType(void 0);
      else if (N.isFunction(n.getHeaders)) {
        const u = n.getHeaders(),
          c = ['content-type', 'content-length'];
        Object.entries(u).forEach(([d, f]) => {
          c.includes(d.toLowerCase()) && l.set(d, f);
        });
      }
    }
    if (
      Ee.hasStandardBrowserEnv &&
      (r && N.isFunction(r) && (r = r(t)), r || (r !== !1 && vv(t.url)))
    ) {
      const u = s && a && wv.read(a);
      u && l.set(s, u);
    }
    return t;
  },
  Nv = typeof XMLHttpRequest < 'u',
  Sv =
    Nv &&
    function (e) {
      return new Promise(function (n, r) {
        const s = K0(e);
        let a = s.data;
        const l = Be.from(s.headers).normalize();
        let { responseType: i, onUploadProgress: u, onDownloadProgress: c } = s,
          d,
          f,
          m,
          b,
          x;
        function w() {
          (b && b(),
            x && x(),
            s.cancelToken && s.cancelToken.unsubscribe(d),
            s.signal && s.signal.removeEventListener('abort', d));
        }
        let v = new XMLHttpRequest();
        (v.open(s.method.toUpperCase(), s.url, !0), (v.timeout = s.timeout));
        function h() {
          if (!v) return;
          const g = Be.from('getAllResponseHeaders' in v && v.getAllResponseHeaders()),
            k = {
              data: !i || i === 'text' || i === 'json' ? v.responseText : v.response,
              status: v.status,
              statusText: v.statusText,
              headers: g,
              config: e,
              request: v,
            };
          (V0(
            function (_) {
              (n(_), w());
            },
            function (_) {
              (r(_), w());
            },
            k
          ),
            (v = null));
        }
        ('onloadend' in v
          ? (v.onloadend = h)
          : (v.onreadystatechange = function () {
              !v ||
                v.readyState !== 4 ||
                (v.status === 0 && !(v.responseURL && v.responseURL.indexOf('file:') === 0)) ||
                setTimeout(h);
            }),
          (v.onabort = function () {
            v && (r(new B('Request aborted', B.ECONNABORTED, e, v)), (v = null));
          }),
          (v.onerror = function (j) {
            const k = j && j.message ? j.message : 'Network Error',
              A = new B(k, B.ERR_NETWORK, e, v);
            ((A.event = j || null), r(A), (v = null));
          }),
          (v.ontimeout = function () {
            let j = s.timeout ? 'timeout of ' + s.timeout + 'ms exceeded' : 'timeout exceeded';
            const k = s.transitional || U0;
            (s.timeoutErrorMessage && (j = s.timeoutErrorMessage),
              r(new B(j, k.clarifyTimeoutError ? B.ETIMEDOUT : B.ECONNABORTED, e, v)),
              (v = null));
          }),
          a === void 0 && l.setContentType(null),
          'setRequestHeader' in v &&
            N.forEach(l.toJSON(), function (j, k) {
              v.setRequestHeader(k, j);
            }),
          N.isUndefined(s.withCredentials) || (v.withCredentials = !!s.withCredentials),
          i && i !== 'json' && (v.responseType = s.responseType),
          c && (([m, x] = Sa(c, !0)), v.addEventListener('progress', m)),
          u &&
            v.upload &&
            (([f, b] = Sa(u)),
            v.upload.addEventListener('progress', f),
            v.upload.addEventListener('loadend', b)),
          (s.cancelToken || s.signal) &&
            ((d = g => {
              v && (r(!g || g.type ? new dr(null, e, v) : g), v.abort(), (v = null));
            }),
            s.cancelToken && s.cancelToken.subscribe(d),
            s.signal && (s.signal.aborted ? d() : s.signal.addEventListener('abort', d))));
        const p = gv(s.url);
        if (p && Ee.protocols.indexOf(p) === -1) {
          r(new B('Unsupported protocol ' + p + ':', B.ERR_BAD_REQUEST, e));
          return;
        }
        v.send(a || null);
      });
    },
  kv = (e, t) => {
    const { length: n } = (e = e ? e.filter(Boolean) : []);
    if (t || n) {
      let r = new AbortController(),
        s;
      const a = function (c) {
        if (!s) {
          ((s = !0), i());
          const d = c instanceof Error ? c : this.reason;
          r.abort(d instanceof B ? d : new dr(d instanceof Error ? d.message : d));
        }
      };
      let l =
        t &&
        setTimeout(() => {
          ((l = null), a(new B(`timeout ${t} of ms exceeded`, B.ETIMEDOUT)));
        }, t);
      const i = () => {
        e &&
          (l && clearTimeout(l),
          (l = null),
          e.forEach(c => {
            c.unsubscribe ? c.unsubscribe(a) : c.removeEventListener('abort', a);
          }),
          (e = null));
      };
      e.forEach(c => c.addEventListener('abort', a));
      const { signal: u } = r;
      return ((u.unsubscribe = () => N.asap(i)), u);
    }
  },
  Ev = function* (e, t) {
    let n = e.byteLength;
    if (n < t) {
      yield e;
      return;
    }
    let r = 0,
      s;
    for (; r < n; ) ((s = r + t), yield e.slice(r, s), (r = s));
  },
  Cv = async function* (e, t) {
    for await (const n of Tv(e)) yield* Ev(n, t);
  },
  Tv = async function* (e) {
    if (e[Symbol.asyncIterator]) {
      yield* e;
      return;
    }
    const t = e.getReader();
    try {
      for (;;) {
        const { done: n, value: r } = await t.read();
        if (n) break;
        yield r;
      }
    } finally {
      await t.cancel();
    }
  },
  Cc = (e, t, n, r) => {
    const s = Cv(e, t);
    let a = 0,
      l,
      i = u => {
        l || ((l = !0), r && r(u));
      };
    return new ReadableStream(
      {
        async pull(u) {
          try {
            const { done: c, value: d } = await s.next();
            if (c) {
              (i(), u.close());
              return;
            }
            let f = d.byteLength;
            if (n) {
              let m = (a += f);
              n(m);
            }
            u.enqueue(new Uint8Array(d));
          } catch (c) {
            throw (i(c), c);
          }
        },
        cancel(u) {
          return (i(u), s.return());
        },
      },
      { highWaterMark: 2 }
    );
  },
  Tc = 64 * 1024,
  { isFunction: Ps } = N,
  _v = (({ Request: e, Response: t }) => ({ Request: e, Response: t }))(N.global),
  { ReadableStream: _c, TextEncoder: Ac } = N.global,
  Lc = (e, ...t) => {
    try {
      return !!e(...t);
    } catch {
      return !1;
    }
  },
  Av = e => {
    e = N.merge.call({ skipUndefined: !0 }, _v, e);
    const { fetch: t, Request: n, Response: r } = e,
      s = t ? Ps(t) : typeof fetch == 'function',
      a = Ps(n),
      l = Ps(r);
    if (!s) return !1;
    const i = s && Ps(_c),
      u =
        s &&
        (typeof Ac == 'function'
          ? (
              x => w =>
                x.encode(w)
            )(new Ac())
          : async x => new Uint8Array(await new n(x).arrayBuffer())),
      c =
        a &&
        i &&
        Lc(() => {
          let x = !1;
          const w = new n(Ee.origin, {
            body: new _c(),
            method: 'POST',
            get duplex() {
              return ((x = !0), 'half');
            },
          }).headers.has('Content-Type');
          return x && !w;
        }),
      d = l && i && Lc(() => N.isReadableStream(new r('').body)),
      f = { stream: d && (x => x.body) };
    s &&
      ['text', 'arrayBuffer', 'blob', 'formData', 'stream'].forEach(x => {
        !f[x] &&
          (f[x] = (w, v) => {
            let h = w && w[x];
            if (h) return h.call(w);
            throw new B(`Response type '${x}' is not supported`, B.ERR_NOT_SUPPORT, v);
          });
      });
    const m = async x => {
        if (x == null) return 0;
        if (N.isBlob(x)) return x.size;
        if (N.isSpecCompliantForm(x))
          return (await new n(Ee.origin, { method: 'POST', body: x }).arrayBuffer()).byteLength;
        if (N.isArrayBufferView(x) || N.isArrayBuffer(x)) return x.byteLength;
        if ((N.isURLSearchParams(x) && (x = x + ''), N.isString(x))) return (await u(x)).byteLength;
      },
      b = async (x, w) => {
        const v = N.toFiniteNumber(x.getContentLength());
        return v ?? m(w);
      };
    return async x => {
      let {
          url: w,
          method: v,
          data: h,
          signal: p,
          cancelToken: g,
          timeout: j,
          onDownloadProgress: k,
          onUploadProgress: A,
          responseType: _,
          headers: S,
          withCredentials: P = 'same-origin',
          fetchOptions: R,
        } = K0(x),
        z = t || fetch;
      _ = _ ? (_ + '').toLowerCase() : 'text';
      let K = kv([p, g && g.toAbortSignal()], j),
        F = null;
      const Q =
        K &&
        K.unsubscribe &&
        (() => {
          K.unsubscribe();
        });
      let Fe;
      try {
        if (A && c && v !== 'get' && v !== 'head' && (Fe = await b(S, h)) !== 0) {
          let T = new n(w, { method: 'POST', body: h, duplex: 'half' }),
            I;
          if (
            (N.isFormData(h) && (I = T.headers.get('content-type')) && S.setContentType(I), T.body)
          ) {
            const [U, Z] = Sc(Fe, Sa(kc(A)));
            h = Cc(T.body, Tc, U, Z);
          }
        }
        N.isString(P) || (P = P ? 'include' : 'omit');
        const ue = a && 'credentials' in n.prototype,
          D = {
            ...R,
            signal: K,
            method: v.toUpperCase(),
            headers: S.normalize().toJSON(),
            body: h,
            duplex: 'half',
            credentials: ue ? P : void 0,
          };
        F = a && new n(w, D);
        let C = await (a ? z(F, R) : z(w, D));
        const M = d && (_ === 'stream' || _ === 'response');
        if (d && (k || (M && Q))) {
          const T = {};
          ['status', 'statusText', 'headers'].forEach(Re => {
            T[Re] = C[Re];
          });
          const I = N.toFiniteNumber(C.headers.get('content-length')),
            [U, Z] = (k && Sc(I, Sa(kc(k), !0))) || [];
          C = new r(
            Cc(C.body, Tc, U, () => {
              (Z && Z(), Q && Q());
            }),
            T
          );
        }
        _ = _ || 'text';
        let O = await f[N.findKey(f, _) || 'text'](C, x);
        return (
          !M && Q && Q(),
          await new Promise((T, I) => {
            V0(T, I, {
              data: O,
              headers: Be.from(C.headers),
              status: C.status,
              statusText: C.statusText,
              config: x,
              request: F,
            });
          })
        );
      } catch (ue) {
        throw (
          Q && Q(),
          ue && ue.name === 'TypeError' && /Load failed|fetch/i.test(ue.message)
            ? Object.assign(new B('Network Error', B.ERR_NETWORK, x, F), { cause: ue.cause || ue })
            : B.from(ue, ue && ue.code, x, F)
        );
      }
    };
  },
  Lv = new Map(),
  Q0 = e => {
    let t = (e && e.env) || {};
    const { fetch: n, Request: r, Response: s } = t,
      a = [r, s, n];
    let l = a.length,
      i = l,
      u,
      c,
      d = Lv;
    for (; i--; )
      ((u = a[i]), (c = d.get(u)), c === void 0 && d.set(u, (c = i ? new Map() : Av(t))), (d = c));
    return c;
  };
Q0();
const Qi = { http: Qy, xhr: Sv, fetch: { get: Q0 } };
N.forEach(Qi, (e, t) => {
  if (e) {
    try {
      Object.defineProperty(e, 'name', { value: t });
    } catch {}
    Object.defineProperty(e, 'adapterName', { value: t });
  }
});
const Pc = e => `- ${e}`,
  Pv = e => N.isFunction(e) || e === null || e === !1;
function Rv(e, t) {
  e = N.isArray(e) ? e : [e];
  const { length: n } = e;
  let r, s;
  const a = {};
  for (let l = 0; l < n; l++) {
    r = e[l];
    let i;
    if (((s = r), !Pv(r) && ((s = Qi[(i = String(r)).toLowerCase()]), s === void 0)))
      throw new B(`Unknown adapter '${i}'`);
    if (s && (N.isFunction(s) || (s = s.get(t)))) break;
    a[i || '#' + l] = s;
  }
  if (!s) {
    const l = Object.entries(a).map(
      ([u, c]) =>
        `adapter ${u} ` +
        (c === !1 ? 'is not supported by the environment' : 'is not available in the build')
    );
    let i = n
      ? l.length > 1
        ? `since :
` +
          l.map(Pc).join(`
`)
        : ' ' + Pc(l[0])
      : 'as no adapter specified';
    throw new B('There is no suitable adapter to dispatch the request ' + i, 'ERR_NOT_SUPPORT');
  }
  return s;
}
const q0 = { getAdapter: Rv, adapters: Qi };
function _o(e) {
  if ((e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted))
    throw new dr(null, e);
}
function Rc(e) {
  return (
    _o(e),
    (e.headers = Be.from(e.headers)),
    (e.data = To.call(e, e.transformRequest)),
    ['post', 'put', 'patch'].indexOf(e.method) !== -1 &&
      e.headers.setContentType('application/x-www-form-urlencoded', !1),
    q0
      .getAdapter(
        e.adapter || ds.adapter,
        e
      )(e)
      .then(
        function (r) {
          return (
            _o(e),
            (r.data = To.call(e, e.transformResponse, r)),
            (r.headers = Be.from(r.headers)),
            r
          );
        },
        function (r) {
          return (
            W0(r) ||
              (_o(e),
              r &&
                r.response &&
                ((r.response.data = To.call(e, e.transformResponse, r.response)),
                (r.response.headers = Be.from(r.response.headers)))),
            Promise.reject(r)
          );
        }
      )
  );
}
const Y0 = '1.13.2',
  Ya = {};
['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach((e, t) => {
  Ya[e] = function (r) {
    return typeof r === e || 'a' + (t < 1 ? 'n ' : ' ') + e;
  };
});
const Ic = {};
Ya.transitional = function (t, n, r) {
  function s(a, l) {
    return '[Axios v' + Y0 + "] Transitional option '" + a + "'" + l + (r ? '. ' + r : '');
  }
  return (a, l, i) => {
    if (t === !1) throw new B(s(l, ' has been removed' + (n ? ' in ' + n : '')), B.ERR_DEPRECATED);
    return (
      n &&
        !Ic[l] &&
        ((Ic[l] = !0),
        console.warn(
          s(l, ' has been deprecated since v' + n + ' and will be removed in the near future')
        )),
      t ? t(a, l, i) : !0
    );
  };
};
Ya.spelling = function (t) {
  return (n, r) => (console.warn(`${r} is likely a misspelling of ${t}`), !0);
};
function Iv(e, t, n) {
  if (typeof e != 'object') throw new B('options must be an object', B.ERR_BAD_OPTION_VALUE);
  const r = Object.keys(e);
  let s = r.length;
  for (; s-- > 0; ) {
    const a = r[s],
      l = t[a];
    if (l) {
      const i = e[a],
        u = i === void 0 || l(i, a, e);
      if (u !== !0) throw new B('option ' + a + ' must be ' + u, B.ERR_BAD_OPTION_VALUE);
      continue;
    }
    if (n !== !0) throw new B('Unknown option ' + a, B.ERR_BAD_OPTION);
  }
}
const Ys = { assertOptions: Iv, validators: Ya },
  ct = Ys.validators;
let xn = class {
  constructor(t) {
    ((this.defaults = t || {}), (this.interceptors = { request: new jc(), response: new jc() }));
  }
  async request(t, n) {
    try {
      return await this._request(t, n);
    } catch (r) {
      if (r instanceof Error) {
        let s = {};
        Error.captureStackTrace ? Error.captureStackTrace(s) : (s = new Error());
        const a = s.stack ? s.stack.replace(/^.+\n/, '') : '';
        try {
          r.stack
            ? a &&
              !String(r.stack).endsWith(a.replace(/^.+\n.+\n/, '')) &&
              (r.stack +=
                `
` + a)
            : (r.stack = a);
        } catch {}
      }
      throw r;
    }
  }
  _request(t, n) {
    (typeof t == 'string' ? ((n = n || {}), (n.url = t)) : (n = t || {}),
      (n = Nn(this.defaults, n)));
    const { transitional: r, paramsSerializer: s, headers: a } = n;
    (r !== void 0 &&
      Ys.assertOptions(
        r,
        {
          silentJSONParsing: ct.transitional(ct.boolean),
          forcedJSONParsing: ct.transitional(ct.boolean),
          clarifyTimeoutError: ct.transitional(ct.boolean),
        },
        !1
      ),
      s != null &&
        (N.isFunction(s)
          ? (n.paramsSerializer = { serialize: s })
          : Ys.assertOptions(s, { encode: ct.function, serialize: ct.function }, !0)),
      n.allowAbsoluteUrls !== void 0 ||
        (this.defaults.allowAbsoluteUrls !== void 0
          ? (n.allowAbsoluteUrls = this.defaults.allowAbsoluteUrls)
          : (n.allowAbsoluteUrls = !0)),
      Ys.assertOptions(
        n,
        { baseUrl: ct.spelling('baseURL'), withXsrfToken: ct.spelling('withXSRFToken') },
        !0
      ),
      (n.method = (n.method || this.defaults.method || 'get').toLowerCase()));
    let l = a && N.merge(a.common, a[n.method]);
    (a &&
      N.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], x => {
        delete a[x];
      }),
      (n.headers = Be.concat(l, a)));
    const i = [];
    let u = !0;
    this.interceptors.request.forEach(function (w) {
      (typeof w.runWhen == 'function' && w.runWhen(n) === !1) ||
        ((u = u && w.synchronous), i.unshift(w.fulfilled, w.rejected));
    });
    const c = [];
    this.interceptors.response.forEach(function (w) {
      c.push(w.fulfilled, w.rejected);
    });
    let d,
      f = 0,
      m;
    if (!u) {
      const x = [Rc.bind(this), void 0];
      for (x.unshift(...i), x.push(...c), m = x.length, d = Promise.resolve(n); f < m; )
        d = d.then(x[f++], x[f++]);
      return d;
    }
    m = i.length;
    let b = n;
    for (; f < m; ) {
      const x = i[f++],
        w = i[f++];
      try {
        b = x(b);
      } catch (v) {
        w.call(this, v);
        break;
      }
    }
    try {
      d = Rc.call(this, b);
    } catch (x) {
      return Promise.reject(x);
    }
    for (f = 0, m = c.length; f < m; ) d = d.then(c[f++], c[f++]);
    return d;
  }
  getUri(t) {
    t = Nn(this.defaults, t);
    const n = G0(t.baseURL, t.url, t.allowAbsoluteUrls);
    return F0(n, t.params, t.paramsSerializer);
  }
};
N.forEach(['delete', 'get', 'head', 'options'], function (t) {
  xn.prototype[t] = function (n, r) {
    return this.request(Nn(r || {}, { method: t, url: n, data: (r || {}).data }));
  };
});
N.forEach(['post', 'put', 'patch'], function (t) {
  function n(r) {
    return function (a, l, i) {
      return this.request(
        Nn(i || {}, {
          method: t,
          headers: r ? { 'Content-Type': 'multipart/form-data' } : {},
          url: a,
          data: l,
        })
      );
    };
  }
  ((xn.prototype[t] = n()), (xn.prototype[t + 'Form'] = n(!0)));
});
let Ov = class J0 {
  constructor(t) {
    if (typeof t != 'function') throw new TypeError('executor must be a function.');
    let n;
    this.promise = new Promise(function (a) {
      n = a;
    });
    const r = this;
    (this.promise.then(s => {
      if (!r._listeners) return;
      let a = r._listeners.length;
      for (; a-- > 0; ) r._listeners[a](s);
      r._listeners = null;
    }),
      (this.promise.then = s => {
        let a;
        const l = new Promise(i => {
          (r.subscribe(i), (a = i));
        }).then(s);
        return (
          (l.cancel = function () {
            r.unsubscribe(a);
          }),
          l
        );
      }),
      t(function (a, l, i) {
        r.reason || ((r.reason = new dr(a, l, i)), n(r.reason));
      }));
  }
  throwIfRequested() {
    if (this.reason) throw this.reason;
  }
  subscribe(t) {
    if (this.reason) {
      t(this.reason);
      return;
    }
    this._listeners ? this._listeners.push(t) : (this._listeners = [t]);
  }
  unsubscribe(t) {
    if (!this._listeners) return;
    const n = this._listeners.indexOf(t);
    n !== -1 && this._listeners.splice(n, 1);
  }
  toAbortSignal() {
    const t = new AbortController(),
      n = r => {
        t.abort(r);
      };
    return (this.subscribe(n), (t.signal.unsubscribe = () => this.unsubscribe(n)), t.signal);
  }
  static source() {
    let t;
    return {
      token: new J0(function (s) {
        t = s;
      }),
      cancel: t,
    };
  }
};
function Mv(e) {
  return function (n) {
    return e.apply(null, n);
  };
}
function Dv(e) {
  return N.isObject(e) && e.isAxiosError === !0;
}
const Dl = {
  Continue: 100,
  SwitchingProtocols: 101,
  Processing: 102,
  EarlyHints: 103,
  Ok: 200,
  Created: 201,
  Accepted: 202,
  NonAuthoritativeInformation: 203,
  NoContent: 204,
  ResetContent: 205,
  PartialContent: 206,
  MultiStatus: 207,
  AlreadyReported: 208,
  ImUsed: 226,
  MultipleChoices: 300,
  MovedPermanently: 301,
  Found: 302,
  SeeOther: 303,
  NotModified: 304,
  UseProxy: 305,
  Unused: 306,
  TemporaryRedirect: 307,
  PermanentRedirect: 308,
  BadRequest: 400,
  Unauthorized: 401,
  PaymentRequired: 402,
  Forbidden: 403,
  NotFound: 404,
  MethodNotAllowed: 405,
  NotAcceptable: 406,
  ProxyAuthenticationRequired: 407,
  RequestTimeout: 408,
  Conflict: 409,
  Gone: 410,
  LengthRequired: 411,
  PreconditionFailed: 412,
  PayloadTooLarge: 413,
  UriTooLong: 414,
  UnsupportedMediaType: 415,
  RangeNotSatisfiable: 416,
  ExpectationFailed: 417,
  ImATeapot: 418,
  MisdirectedRequest: 421,
  UnprocessableEntity: 422,
  Locked: 423,
  FailedDependency: 424,
  TooEarly: 425,
  UpgradeRequired: 426,
  PreconditionRequired: 428,
  TooManyRequests: 429,
  RequestHeaderFieldsTooLarge: 431,
  UnavailableForLegalReasons: 451,
  InternalServerError: 500,
  NotImplemented: 501,
  BadGateway: 502,
  ServiceUnavailable: 503,
  GatewayTimeout: 504,
  HttpVersionNotSupported: 505,
  VariantAlsoNegotiates: 506,
  InsufficientStorage: 507,
  LoopDetected: 508,
  NotExtended: 510,
  NetworkAuthenticationRequired: 511,
  WebServerIsDown: 521,
  ConnectionTimedOut: 522,
  OriginIsUnreachable: 523,
  TimeoutOccurred: 524,
  SslHandshakeFailed: 525,
  InvalidSslCertificate: 526,
};
Object.entries(Dl).forEach(([e, t]) => {
  Dl[t] = e;
});
function X0(e) {
  const t = new xn(e),
    n = _0(xn.prototype.request, t);
  return (
    N.extend(n, xn.prototype, t, { allOwnKeys: !0 }),
    N.extend(n, t, null, { allOwnKeys: !0 }),
    (n.create = function (s) {
      return X0(Nn(e, s));
    }),
    n
  );
}
const oe = X0(ds);
oe.Axios = xn;
oe.CanceledError = dr;
oe.CancelToken = Ov;
oe.isCancel = W0;
oe.VERSION = Y0;
oe.toFormData = qa;
oe.AxiosError = B;
oe.Cancel = oe.CanceledError;
oe.all = function (t) {
  return Promise.all(t);
};
oe.spread = Mv;
oe.isAxiosError = Dv;
oe.mergeConfig = Nn;
oe.AxiosHeaders = Be;
oe.formToJSON = e => H0(N.isHTMLForm(e) ? new FormData(e) : e);
oe.getAdapter = q0.getAdapter;
oe.HttpStatusCode = Dl;
oe.default = oe;
const {
    Axios: H1,
    AxiosError: W1,
    CanceledError: V1,
    isCancel: G1,
    CancelToken: K1,
    VERSION: Q1,
    all: q1,
    Cancel: Y1,
    isAxiosError: J1,
    spread: X1,
    toFormData: Z1,
    AxiosHeaders: ew,
    HttpStatusCode: tw,
    formToJSON: nw,
    getAdapter: rw,
    mergeConfig: sw,
  } = oe,
  zv = '/api',
  Hn = oe.create({ baseURL: zv, headers: { 'Content-Type': 'application/json' } });
Hn.interceptors.request.use(
  e => {
    const t = pe.getState().token;
    return (t && (e.headers.Authorization = `Bearer ${t}`), e);
  },
  e => Promise.reject(e)
);
Hn.interceptors.response.use(
  e => e,
  e => {
    var t;
    return (
      ((t = e.response) == null ? void 0 : t.status) === 401 &&
        (pe.getState().logout(), (window.location.href = '/login')),
      Promise.reject(e)
    );
  }
);
const Z0 = {
  async register(e) {
    const t = await Hn.post('/auth/register', e);
    if (t.data.success) {
      const { user: n, token: r } = t.data.data;
      pe.getState().login(n, r);
    }
    return t.data;
  },
  async login(e) {
    const t = await Hn.post('/auth/login', e);
    if (t.data.success) {
      const { user: n, token: r } = t.data.data;
      pe.getState().login(n, r);
    }
    return t.data;
  },
  async logout() {
    try {
      await Hn.post('/auth/logout');
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      pe.getState().logout();
    }
  },
  async getCurrentUser() {
    return (await Hn.get('/auth/me')).data;
  },
};
function $v() {
  var f;
  const e = Qe(),
    n = ((f = en().state) == null ? void 0 : f.email) || '',
    [r, s] = y.useState({ email: n, password: '' }),
    [a, l] = y.useState(!1),
    [i, u] = y.useState(!1),
    { isAuthenticated: c } = pe();
  y.useEffect(() => {
    c && e('/dashboard');
  }, [c, e]);
  const d = async m => {
    var b, x;
    (m.preventDefault(), l(!0));
    try {
      (await Z0.login(r),
        H.success('Вход выполнен успешно!'),
        setTimeout(() => e('/dashboard'), 500));
    } catch (w) {
      const v =
        ((x = (b = w.response) == null ? void 0 : b.data) == null ? void 0 : x.message) ||
        'Неверный email или пароль';
      H.error(v);
    } finally {
      l(!1);
    }
  };
  return o.jsxs('div', {
    className:
      'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden flex items-center justify-center px-4',
    children: [
      o.jsx('div', {
        className:
          'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
      }),
      o.jsx('div', {
        className:
          'absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse',
      }),
      o.jsx('div', {
        className:
          'absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse',
        style: { animationDelay: '1s' },
      }),
      o.jsxs('div', {
        className: 'relative z-10 max-w-md w-full',
        children: [
          o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-scale-in',
            children: [
              o.jsxs('div', {
                className: 'text-center mb-8',
                children: [
                  o.jsx('div', {
                    className: 'inline-block mb-4',
                    children: o.jsx('div', {
                      className:
                        'w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-cyan-500/30 mx-auto',
                      children: o.jsx('svg', {
                        xmlns: 'http://www.w3.org/2000/svg',
                        fill: 'none',
                        viewBox: '0 0 24 24',
                        strokeWidth: 2,
                        stroke: 'currentColor',
                        className: 'w-8 h-8 text-cyan-400',
                        children: o.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          d: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
                        }),
                      }),
                    }),
                  }),
                  o.jsx('h1', {
                    className:
                      'text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3',
                    children: 'Вход',
                  }),
                  o.jsx('p', {
                    className: 'text-gray-400 text-lg font-sans',
                    children: 'Войдите в свой аккаунт',
                  }),
                ],
              }),
              o.jsxs('form', {
                onSubmit: d,
                className: 'space-y-6',
                children: [
                  o.jsx('div', {
                    className: 'animate-fade-in',
                    children: o.jsx(Un, {
                      label: 'Email',
                      type: 'email',
                      value: r.email,
                      onChange: m => s({ ...r, email: m.target.value }),
                      required: !0,
                      autoComplete: 'email',
                      placeholder: 'ivan.ivanov@example.com',
                    }),
                  }),
                  o.jsxs('div', {
                    className: 'relative animate-fade-in',
                    style: { animationDelay: '100ms' },
                    children: [
                      o.jsx(Un, {
                        label: 'Пароль',
                        type: i ? 'text' : 'password',
                        value: r.password,
                        onChange: m => s({ ...r, password: m.target.value }),
                        required: !0,
                        autoComplete: 'current-password',
                        placeholder: 'Введите пароль',
                      }),
                      o.jsx('button', {
                        type: 'button',
                        onClick: () => u(!i),
                        className:
                          'absolute right-3 top-9 text-gray-400 hover:text-cyan-400 focus:outline-none transition-colors',
                        'aria-label': i ? 'Скрыть пароль' : 'Показать пароль',
                        children: i
                          ? o.jsx('svg', {
                              xmlns: 'http://www.w3.org/2000/svg',
                              fill: 'none',
                              viewBox: '0 0 24 24',
                              strokeWidth: 1.5,
                              stroke: 'currentColor',
                              className: 'w-5 h-5',
                              children: o.jsx('path', {
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                d: 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88',
                              }),
                            })
                          : o.jsxs('svg', {
                              xmlns: 'http://www.w3.org/2000/svg',
                              fill: 'none',
                              viewBox: '0 0 24 24',
                              strokeWidth: 1.5,
                              stroke: 'currentColor',
                              className: 'w-5 h-5',
                              children: [
                                o.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  d: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z',
                                }),
                                o.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                                }),
                              ],
                            }),
                      }),
                    ],
                  }),
                  o.jsx('div', {
                    className: 'animate-fade-in',
                    style: { animationDelay: '200ms' },
                    children: o.jsx(te, {
                      type: 'submit',
                      className: 'w-full',
                      isLoading: a,
                      children: a ? 'Вход...' : 'Войти',
                    }),
                  }),
                ],
              }),
              o.jsx('div', {
                className: 'mt-6 text-center animate-fade-in',
                style: { animationDelay: '300ms' },
                children: o.jsxs('p', {
                  className: 'text-gray-400 font-sans',
                  children: [
                    'Нет аккаунта?',
                    ' ',
                    o.jsx(Ce, {
                      to: '/register',
                      className:
                        'text-cyan-400 hover:text-cyan-300 font-semibold border-b border-cyan-400/0 hover:border-cyan-400 transition-all',
                      children: 'Зарегистрироваться',
                    }),
                  ],
                }),
              }),
              o.jsx('div', {
                className: 'mt-6 text-center animate-fade-in',
                style: { animationDelay: '400ms' },
                children: o.jsxs(Ce, {
                  to: '/',
                  className:
                    'text-gray-500 hover:text-gray-300 text-sm font-sans flex items-center justify-center gap-2 group transition-colors',
                  children: [
                    o.jsx('svg', {
                      xmlns: 'http://www.w3.org/2000/svg',
                      fill: 'none',
                      viewBox: '0 0 24 24',
                      strokeWidth: 2,
                      stroke: 'currentColor',
                      className:
                        'w-4 h-4 transform group-hover:-translate-x-1 transition-transform',
                      children: o.jsx('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
                      }),
                    }),
                    'Вернуться на главную',
                  ],
                }),
              }),
            ],
          }),
          o.jsx('div', {
            className: 'mt-8 text-center animate-fade-in',
            style: { animationDelay: '500ms' },
            children: o.jsxs('p', {
              className: 'text-gray-500 text-sm font-sans',
              children: [
                'Защищенный вход через',
                ' ',
                o.jsx('span', { className: 'text-cyan-400 font-mono', children: 'HTTPS' }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
function Oc({ label: e, error: t, options: n, className: r = '', ...s }) {
  return o.jsxs('div', {
    className: 'w-full',
    children: [
      e &&
        o.jsx('label', {
          className: 'block text-sm font-medium text-gray-400 dark:text-gray-400 mb-2 font-sans',
          children: e,
        }),
      o.jsx('select', {
        className: `
          w-full px-4 py-3
          bg-gray-800/50 dark:bg-gray-800/50
          border ${t ? 'border-red-500/50' : 'border-gray-700'}
          rounded-xl text-white dark:text-white
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
          transition-all duration-300
          font-sans
          ${r}
        `,
        ...s,
        children: n.map(a =>
          o.jsx(
            'option',
            { value: a.value, className: 'bg-gray-800 text-white', children: a.label },
            a.value
          )
        ),
      }),
      t && o.jsx('p', { className: 'mt-2 text-sm text-red-400 font-sans', children: t }),
    ],
  });
}
function Bv({ label: e, error: t, className: n = '', ...r }) {
  return o.jsxs('div', {
    className: 'w-full',
    children: [
      e &&
        o.jsx('label', {
          className: 'block text-sm font-medium text-gray-400 dark:text-gray-400 mb-2 font-sans',
          children: e,
        }),
      o.jsx('textarea', {
        className: `
          w-full px-4 py-3
          bg-gray-800/50 dark:bg-gray-800/50
          border ${t ? 'border-red-500/50' : 'border-gray-700'}
          rounded-xl text-white dark:text-white
          placeholder-gray-500 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
          transition-all duration-300
          resize-vertical
          font-sans
          ${n}
        `,
        rows: 4,
        ...r,
      }),
      t && o.jsx('p', { className: 'mt-2 text-sm text-red-400 font-sans', children: t }),
    ],
  });
}
function ep({ current: e, total: t, showLabel: n = !0, className: r = '' }) {
  const s = t > 0 ? (e / t) * 100 : 0;
  return o.jsxs('div', {
    className: `w-full ${r}`,
    children: [
      o.jsx('div', {
        className: 'w-full bg-gray-700 dark:bg-gray-700 rounded-full h-2 overflow-hidden',
        children: o.jsx('div', {
          className:
            'bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out',
          style: { width: `${s}%` },
          role: 'progressbar',
          'aria-valuenow': e,
          'aria-valuemin': 0,
          'aria-valuemax': t,
        }),
      }),
      n &&
        o.jsxs('p', {
          className: 'text-sm text-gray-400 dark:text-gray-400 mt-3 text-center font-sans',
          children: ['Шаг ', e, ' из ', t],
        }),
    ],
  });
}
function Fv() {
  const e = Qe(),
    [t, n] = y.useState(1),
    [r, s] = y.useState(!1),
    [a, l] = y.useState(!1),
    [i, u] = y.useState(!1),
    { isAuthenticated: c } = pe(),
    [d, f] = y.useState(''),
    [m, b] = y.useState(!1),
    [x, w] = y.useState(!1),
    [v, h] = y.useState([]),
    [p, g] = y.useState(!1),
    [j, k] = y.useState(''),
    [A, _] = y.useState(!1),
    [S, P] = y.useState({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      status: 'APPLICANT',
      currentGrade: 8,
      desiredDirection: '',
      motivation: '',
      agreedToTerms: !1,
    });
  (y.useEffect(() => {
    c && e('/dashboard');
  }, [c, e]),
    y.useEffect(() => {
      (async () => {
        g(!0);
        try {
          const U = await (await fetch('/api/students')).json();
          U.success && Array.isArray(U.data) && h(U.data);
        } catch (I) {
          console.error('Failed to fetch students:', I);
        } finally {
          g(!1);
        }
      })();
    }, []));
  const R = v.filter(T => T.toLowerCase().includes(j.toLowerCase())).slice(0, 10),
    z = S.status === 'STUDENT' ? 4 : 5,
    K = T => {
      if (!T) return '';
      if (/[а-яА-ЯёЁ]/.test(T))
        return 'Email не может содержать кириллицу. Используйте только латинские буквы';
      if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(T))
        return 'Некорректный формат email. Пример: example@gmail.com';
      const U = T.split('@')[0];
      return U.length < 3
        ? 'Часть email до @ должна содержать минимум 3 символа'
        : /^[a-z]{10,}$/i.test(U.replace(/[0-9._+-]/g, ''))
          ? 'Email выглядит подозрительно. Используйте настоящий адрес'
          : '';
    },
    F = (T, I) => {
      (P(U => ({ ...U, [T]: I })), T === 'email' && (b(!0), f(K(I))));
    },
    Q = T => {
      if (!T) return { score: 0, label: '', color: 'bg-gray-700' };
      let I = 0;
      const U = {
        length: T.length >= 8,
        lowercase: /[a-z]/.test(T),
        uppercase: /[A-Z]/.test(T),
        number: /[0-9]/.test(T),
        special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(T),
        longLength: T.length >= 12,
      };
      (U.length && (I += 20),
        U.lowercase && (I += 20),
        U.uppercase && (I += 20),
        U.number && (I += 20),
        U.special && (I += 10),
        U.longLength && (I += 10));
      let Z = '',
        Re = '';
      return (
        I < 60
          ? ((Z = 'Слабый'), (Re = 'bg-gradient-to-r from-red-500 to-red-600'))
          : I < 80
            ? ((Z = 'Средний'), (Re = 'bg-gradient-to-r from-yellow-500 to-orange-500'))
            : ((Z = 'Сильный'), (Re = 'bg-gradient-to-r from-green-500 to-emerald-500')),
        { score: I, label: Z, color: Re }
      );
    },
    Fe = () => {
      if (t === 1) {
        if (!S.email || !S.password || !S.confirmPassword || !S.name)
          return (H.error('Заполните все поля'), !1);
        if (d) return (H.error('Исправьте ошибки в форме'), !1);
        if (S.password !== S.confirmPassword) return (H.error('Пароли не совпадают'), !1);
        if (S.password.length < 8)
          return (H.error('Пароль должен содержать минимум 8 символов'), !1);
        if (!/[a-z]/.test(S.password))
          return (H.error('Пароль должен содержать хотя бы одну строчную букву'), !1);
        if (!/[A-Z]/.test(S.password))
          return (H.error('Пароль должен содержать хотя бы одну заглавную букву'), !1);
        if (!/[0-9]/.test(S.password))
          return (H.error('Пароль должен содержать хотя бы одну цифру'), !1);
      } else if (t === 2) {
        if (S.status === 'STUDENT' && !S.name)
          return (H.error('Выберите своё имя из списка учащихся'), !1);
      } else if (t === 4 && S.status === 'APPLICANT') {
        if (!S.motivation || S.motivation.length < 50)
          return (H.error('Мотивация должна содержать минимум 50 символов'), !1);
      } else if (t === z && !S.agreedToTerms)
        return (H.error('Необходимо согласиться с условиями использования'), !1);
      return !0;
    },
    ue = () => {
      Fe() && n(T => Math.min(T + 1, z));
    },
    D = () => {
      n(T => Math.max(T - 1, 1));
    },
    C = async () => {
      var T;
      if (Fe()) {
        s(!0);
        try {
          const I = await fetch('/api/auth/register', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: S.email,
                password: S.password,
                name: S.name,
                status: S.status,
                currentGrade: S.currentGrade,
                desiredDirection: S.desiredDirection || void 0,
                motivation: S.motivation || void 0,
                agreedToTerms: S.agreedToTerms,
                authProvider: 'EMAIL',
              }),
            }),
            U = await I.json();
          if (!I.ok) {
            if (U.message && U.message.includes('уже существует')) w(!0);
            else if (U.errors && Array.isArray(U.errors)) {
              const Z = U.errors.filter(Re => Re.path && Re.path.includes('email'));
              Z.length > 0
                ? (n(1), f(Z[0].message), b(!0), H.error('Пожалуйста, исправьте ошибки в форме'))
                : H.error(
                    ((T = U.errors[0]) == null ? void 0 : T.message) || 'Ошибка валидации данных'
                  );
            } else H.error(U.message || 'Ошибка регистрации');
            return;
          }
          (H.success('Регистрация прошла успешно! Добро пожаловать!'),
            pe.getState().login(U.data.user, U.data.token),
            setTimeout(() => e('/diagnostic'), 500));
        } catch (I) {
          H.error(I.message || 'Произошла ошибка при регистрации');
        } finally {
          s(!1);
        }
      }
    },
    M = t,
    O = z;
  return o.jsxs('div', {
    className: 'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4',
    children: [
      o.jsx('div', {
        className:
          'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
      }),
      o.jsx('div', {
        className:
          'absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse',
      }),
      o.jsx('div', {
        className:
          'absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse',
        style: { animationDelay: '1s' },
      }),
      o.jsxs('div', {
        className: 'relative z-10 max-w-2xl mx-auto',
        children: [
          o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up',
            children: [
              o.jsxs('div', {
                className: 'text-center mb-8',
                children: [
                  o.jsx('h1', {
                    className:
                      'text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3',
                    children: 'Регистрация',
                  }),
                  o.jsx('p', {
                    className: 'text-gray-400 text-lg font-sans',
                    children: 'Начните подготовку к поступлению в лицей',
                  }),
                ],
              }),
              o.jsx(ep, { current: M, total: O, className: 'mb-8' }),
              t === 1 &&
                o.jsxs('div', {
                  className: 'space-y-6 animate-fade-in',
                  children: [
                    o.jsxs('h2', {
                      className:
                        'text-2xl font-display font-semibold text-white mb-6 flex items-center',
                      children: [
                        o.jsx('span', {
                          className: 'w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse',
                        }),
                        'Основная информация',
                      ],
                    }),
                    o.jsx(Un, {
                      label: 'Имя и фамилия',
                      value: S.name,
                      onChange: T => F('name', T.target.value),
                      placeholder: 'Иван Иванов',
                      required: !0,
                    }),
                    o.jsxs('div', {
                      children: [
                        o.jsxs('div', {
                          className: 'mb-2',
                          children: [
                            o.jsx(Un, {
                              label: 'Email',
                              type: 'email',
                              value: S.email,
                              onChange: T => F('email', T.target.value),
                              onBlur: () => b(!0),
                              placeholder: 'ivan.ivanov@example.com',
                              required: !0,
                            }),
                            o.jsx('p', {
                              className: 'mt-2 text-xs text-gray-500 font-sans',
                              children:
                                'Используйте настоящий email адрес. Только латинские буквы, цифры и символы . _ % + -',
                            }),
                          ],
                        }),
                        m &&
                          d &&
                          o.jsx('div', {
                            className:
                              'mt-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm',
                            children: o.jsxs('div', {
                              className: 'flex items-start gap-3',
                              children: [
                                o.jsx('svg', {
                                  xmlns: 'http://www.w3.org/2000/svg',
                                  fill: 'none',
                                  viewBox: '0 0 24 24',
                                  strokeWidth: 2,
                                  stroke: 'currentColor',
                                  className: 'w-5 h-5 text-red-400 flex-shrink-0 mt-0.5',
                                  children: o.jsx('path', {
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    d: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z',
                                  }),
                                }),
                                o.jsxs('div', {
                                  className: 'flex-1',
                                  children: [
                                    o.jsx('p', {
                                      className: 'text-sm font-semibold text-red-300 font-sans',
                                      children: d,
                                    }),
                                    o.jsx('p', {
                                      className: 'text-xs text-red-400 mt-1 font-sans',
                                      children: 'Пожалуйста, исправьте email чтобы продолжить',
                                    }),
                                    o.jsxs('div', {
                                      className: 'mt-3 text-xs text-gray-400',
                                      children: [
                                        o.jsx('p', {
                                          className: 'font-medium mb-2 font-sans',
                                          children: 'Примеры правильных email:',
                                        }),
                                        o.jsxs('ul', {
                                          className:
                                            'list-disc list-inside space-y-1 text-gray-500 font-mono',
                                          children: [
                                            o.jsx('li', { children: 'ivan.petrov@gmail.com' }),
                                            o.jsx('li', { children: 'student2024@mail.ru' }),
                                            o.jsx('li', { children: 'my.email@yandex.ru' }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          }),
                        m &&
                          !d &&
                          S.email &&
                          o.jsxs('div', {
                            className:
                              'mt-2 flex items-center gap-2 text-sm text-green-400 font-sans',
                            children: [
                              o.jsx('svg', {
                                xmlns: 'http://www.w3.org/2000/svg',
                                fill: 'none',
                                viewBox: '0 0 24 24',
                                strokeWidth: 1.5,
                                stroke: 'currentColor',
                                className: 'w-5 h-5',
                                children: o.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                }),
                              }),
                              o.jsx('span', { children: 'Email корректный' }),
                            ],
                          }),
                      ],
                    }),
                    o.jsxs('div', {
                      children: [
                        o.jsxs('div', {
                          className: 'relative',
                          children: [
                            o.jsx(Un, {
                              label: 'Пароль',
                              type: a ? 'text' : 'password',
                              value: S.password,
                              onChange: T => F('password', T.target.value),
                              placeholder: 'Минимум 8 символов',
                              required: !0,
                            }),
                            o.jsx('button', {
                              type: 'button',
                              onClick: () => l(!a),
                              className:
                                'absolute right-3 top-9 text-gray-400 hover:text-cyan-400 focus:outline-none transition-colors',
                              'aria-label': a ? 'Скрыть пароль' : 'Показать пароль',
                              children: a
                                ? o.jsx('svg', {
                                    xmlns: 'http://www.w3.org/2000/svg',
                                    fill: 'none',
                                    viewBox: '0 0 24 24',
                                    strokeWidth: 1.5,
                                    stroke: 'currentColor',
                                    className: 'w-5 h-5',
                                    children: o.jsx('path', {
                                      strokeLinecap: 'round',
                                      strokeLinejoin: 'round',
                                      d: 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88',
                                    }),
                                  })
                                : o.jsxs('svg', {
                                    xmlns: 'http://www.w3.org/2000/svg',
                                    fill: 'none',
                                    viewBox: '0 0 24 24',
                                    strokeWidth: 1.5,
                                    stroke: 'currentColor',
                                    className: 'w-5 h-5',
                                    children: [
                                      o.jsx('path', {
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round',
                                        d: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z',
                                      }),
                                      o.jsx('path', {
                                        strokeLinecap: 'round',
                                        strokeLinejoin: 'round',
                                        d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                                      }),
                                    ],
                                  }),
                            }),
                          ],
                        }),
                        S.password &&
                          o.jsxs('div', {
                            className:
                              'mt-4 p-4 bg-gray-800/50 border border-gray-700/50 rounded-xl backdrop-blur-sm',
                            children: [
                              o.jsxs('div', {
                                className: 'flex items-center justify-between text-sm mb-3',
                                children: [
                                  o.jsx('span', {
                                    className: 'text-gray-400 font-sans',
                                    children: 'Сила пароля:',
                                  }),
                                  o.jsx('span', {
                                    className: `font-semibold font-sans ${Q(S.password).score < 60 ? 'text-red-400' : Q(S.password).score < 80 ? 'text-yellow-400' : 'text-green-400'}`,
                                    children: Q(S.password).label,
                                  }),
                                ],
                              }),
                              o.jsx('div', {
                                className:
                                  'w-full bg-gray-700 rounded-full h-2 overflow-hidden mb-4',
                                children: o.jsx('div', {
                                  className: `h-full transition-all duration-500 ${Q(S.password).color}`,
                                  style: { width: `${Q(S.password).score}%` },
                                }),
                              }),
                              o.jsxs('div', {
                                className: 'text-xs text-gray-400 space-y-2 font-sans',
                                children: [
                                  o.jsxs('div', {
                                    className: 'flex items-center gap-2',
                                    children: [
                                      o.jsx('span', {
                                        className:
                                          S.password.length >= 8
                                            ? 'text-green-400'
                                            : 'text-gray-600',
                                        children: S.password.length >= 8 ? '✓' : '○',
                                      }),
                                      o.jsx('span', { children: 'Минимум 8 символов' }),
                                    ],
                                  }),
                                  o.jsxs('div', {
                                    className: 'flex items-center gap-2',
                                    children: [
                                      o.jsx('span', {
                                        className: /[a-z]/.test(S.password)
                                          ? 'text-green-400'
                                          : 'text-gray-600',
                                        children: /[a-z]/.test(S.password) ? '✓' : '○',
                                      }),
                                      o.jsx('span', { children: 'Строчная буква' }),
                                    ],
                                  }),
                                  o.jsxs('div', {
                                    className: 'flex items-center gap-2',
                                    children: [
                                      o.jsx('span', {
                                        className: /[A-Z]/.test(S.password)
                                          ? 'text-green-400'
                                          : 'text-gray-600',
                                        children: /[A-Z]/.test(S.password) ? '✓' : '○',
                                      }),
                                      o.jsx('span', { children: 'Заглавная буква' }),
                                    ],
                                  }),
                                  o.jsxs('div', {
                                    className: 'flex items-center gap-2',
                                    children: [
                                      o.jsx('span', {
                                        className: /[0-9]/.test(S.password)
                                          ? 'text-green-400'
                                          : 'text-gray-600',
                                        children: /[0-9]/.test(S.password) ? '✓' : '○',
                                      }),
                                      o.jsx('span', { children: 'Цифра' }),
                                    ],
                                  }),
                                  o.jsxs('div', {
                                    className: 'flex items-center gap-2',
                                    children: [
                                      o.jsx('span', {
                                        className: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                          S.password
                                        )
                                          ? 'text-green-400'
                                          : 'text-gray-600',
                                        children: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                                          S.password
                                        )
                                          ? '✓'
                                          : '○',
                                      }),
                                      o.jsx('span', {
                                        children: 'Специальный символ (необязательно)',
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                      ],
                    }),
                    o.jsxs('div', {
                      className: 'relative',
                      children: [
                        o.jsx(Un, {
                          label: 'Подтвердите пароль',
                          type: i ? 'text' : 'password',
                          value: S.confirmPassword,
                          onChange: T => F('confirmPassword', T.target.value),
                          placeholder: 'Повторите пароль',
                          required: !0,
                        }),
                        o.jsx('button', {
                          type: 'button',
                          onClick: () => u(!i),
                          className:
                            'absolute right-3 top-9 text-gray-400 hover:text-cyan-400 focus:outline-none transition-colors',
                          'aria-label': i ? 'Скрыть пароль' : 'Показать пароль',
                          children: i
                            ? o.jsx('svg', {
                                xmlns: 'http://www.w3.org/2000/svg',
                                fill: 'none',
                                viewBox: '0 0 24 24',
                                strokeWidth: 1.5,
                                stroke: 'currentColor',
                                className: 'w-5 h-5',
                                children: o.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  d: 'M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88',
                                }),
                              })
                            : o.jsxs('svg', {
                                xmlns: 'http://www.w3.org/2000/svg',
                                fill: 'none',
                                viewBox: '0 0 24 24',
                                strokeWidth: 1.5,
                                stroke: 'currentColor',
                                className: 'w-5 h-5',
                                children: [
                                  o.jsx('path', {
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    d: 'M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z',
                                  }),
                                  o.jsx('path', {
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    d: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
                                  }),
                                ],
                              }),
                        }),
                      ],
                    }),
                  ],
                }),
              t === 2 &&
                o.jsxs('div', {
                  className: 'space-y-6 animate-fade-in',
                  children: [
                    o.jsxs('h2', {
                      className:
                        'text-2xl font-display font-semibold text-white mb-6 flex items-center',
                      children: [
                        o.jsx('span', {
                          className: 'w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse',
                          style: { animationDelay: '0.5s' },
                        }),
                        'Ваш статус',
                      ],
                    }),
                    o.jsx('button', {
                      onClick: () => F('status', 'STUDENT'),
                      className: `group w-full p-6 border-2 rounded-2xl transition-all duration-300 ${S.status === 'STUDENT' ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 shadow-[0_0_30px_rgba(6,182,212,0.3)]' : 'border-gray-700 hover:border-cyan-500/50 hover:bg-gray-800/50'}`,
                      children: o.jsx('div', {
                        className: 'font-display font-semibold text-xl text-white',
                        children: Rl.STUDENT,
                      }),
                    }),
                    S.status === 'STUDENT' &&
                      o.jsxs('div', {
                        className: 'relative animate-scale-in',
                        children: [
                          o.jsx('label', {
                            className: 'block text-sm font-medium text-gray-400 mb-2 font-sans',
                            children: 'Выберите своё имя из списка учащихся',
                          }),
                          o.jsx('input', {
                            type: 'text',
                            value: j,
                            onChange: T => {
                              (k(T.target.value), F('name', ''), _(!0));
                            },
                            onFocus: () => _(!0),
                            placeholder: p ? 'Загрузка списка...' : 'Начните вводить ФИО...',
                            className:
                              'w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans',
                            disabled: p,
                          }),
                          A &&
                            R.length > 0 &&
                            o.jsx('div', {
                              className:
                                'absolute z-10 w-full mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto backdrop-blur-xl',
                              children: R.map((T, I) =>
                                o.jsx(
                                  'button',
                                  {
                                    type: 'button',
                                    onClick: () => {
                                      (F('name', T), k(T), _(!1));
                                    },
                                    className:
                                      'w-full px-4 py-3 text-left text-gray-300 hover:bg-cyan-500/10 hover:text-cyan-400 focus:bg-cyan-500/10 focus:text-cyan-400 focus:outline-none transition-colors font-sans',
                                    children: T,
                                  },
                                  I
                                )
                              ),
                            }),
                          S.name &&
                            S.status === 'STUDENT' &&
                            o.jsxs('p', {
                              className:
                                'mt-2 text-sm text-green-400 font-sans flex items-center gap-2',
                              children: [
                                o.jsx('svg', {
                                  xmlns: 'http://www.w3.org/2000/svg',
                                  fill: 'none',
                                  viewBox: '0 0 24 24',
                                  strokeWidth: 1.5,
                                  stroke: 'currentColor',
                                  className: 'w-5 h-5',
                                  children: o.jsx('path', {
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                  }),
                                }),
                                'Выбрано: ',
                                S.name,
                              ],
                            }),
                        ],
                      }),
                    o.jsx('button', {
                      onClick: () => F('status', 'APPLICANT'),
                      className: `group w-full p-6 border-2 rounded-2xl transition-all duration-300 ${S.status === 'APPLICANT' ? 'border-purple-500 bg-gradient-to-r from-purple-500/10 to-pink-500/10 shadow-[0_0_30px_rgba(168,85,247,0.3)]' : 'border-gray-700 hover:border-purple-500/50 hover:bg-gray-800/50'}`,
                      children: o.jsx('div', {
                        className: 'font-display font-semibold text-xl text-white',
                        children: Rl.APPLICANT,
                      }),
                    }),
                  ],
                }),
              t === 3 &&
                o.jsxs('div', {
                  className: 'space-y-6 animate-fade-in',
                  children: [
                    o.jsxs('h2', {
                      className:
                        'text-2xl font-display font-semibold text-white mb-6 flex items-center',
                      children: [
                        o.jsx('span', {
                          className: 'w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse',
                        }),
                        'Учебная информация',
                      ],
                    }),
                    o.jsx(Oc, {
                      label: 'Текущий класс',
                      value: S.currentGrade.toString(),
                      onChange: T => F('currentGrade', parseInt(T.target.value)),
                      options: N0.map(T => ({ value: T.toString(), label: j0[T] })),
                      required: !0,
                    }),
                    S.status === 'APPLICANT' &&
                      o.jsx(Oc, {
                        label: 'Желаемое направление',
                        value: S.desiredDirection,
                        onChange: T => F('desiredDirection', T.target.value),
                        options: [
                          { value: '', label: 'Выберите направление' },
                          ...Object.entries(Hi).map(([T, I]) => ({ value: T, label: I })),
                        ],
                      }),
                  ],
                }),
              t === 4 &&
                S.status === 'APPLICANT' &&
                o.jsxs('div', {
                  className: 'space-y-6 animate-fade-in',
                  children: [
                    o.jsxs('h2', {
                      className:
                        'text-2xl font-display font-semibold text-white mb-6 flex items-center',
                      children: [
                        o.jsx('span', {
                          className: 'w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse',
                          style: { animationDelay: '0.5s' },
                        }),
                        'Мотивация',
                      ],
                    }),
                    o.jsx(Bv, {
                      label: 'Почему вы хотите поступить в лицей?',
                      value: S.motivation,
                      onChange: T => F('motivation', T.target.value),
                      placeholder: 'Расскажите о своих целях и мотивации (минимум 50 символов)',
                      rows: 6,
                      required: !0,
                    }),
                    o.jsxs('div', {
                      className: 'flex justify-between items-center',
                      children: [
                        o.jsxs('p', {
                          className: 'text-sm text-gray-400 font-sans',
                          children: [
                            'Символов: ',
                            o.jsx('span', {
                              className:
                                S.motivation.length >= 50 ? 'text-green-400' : 'text-gray-500',
                              children: S.motivation.length,
                            }),
                            ' / 1000',
                          ],
                        }),
                        S.motivation.length >= 50 &&
                          o.jsxs('span', {
                            className: 'text-sm text-green-400 font-sans flex items-center gap-1',
                            children: [
                              o.jsx('svg', {
                                xmlns: 'http://www.w3.org/2000/svg',
                                fill: 'none',
                                viewBox: '0 0 24 24',
                                strokeWidth: 1.5,
                                stroke: 'currentColor',
                                className: 'w-4 h-4',
                                children: o.jsx('path', {
                                  strokeLinecap: 'round',
                                  strokeLinejoin: 'round',
                                  d: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
                                }),
                              }),
                              'Готово',
                            ],
                          }),
                      ],
                    }),
                  ],
                }),
              t === z &&
                o.jsxs('div', {
                  className: 'space-y-6 animate-fade-in',
                  children: [
                    o.jsxs('h2', {
                      className:
                        'text-2xl font-display font-semibold text-white mb-6 flex items-center',
                      children: [
                        o.jsx('span', {
                          className: 'w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse',
                        }),
                        'Условия использования',
                      ],
                    }),
                    o.jsx('div', {
                      className:
                        'bg-gray-800/50 border border-gray-700 rounded-xl p-4 max-h-64 overflow-y-auto backdrop-blur-sm',
                      children: o.jsxs('p', {
                        className: 'text-sm text-gray-300 font-sans leading-relaxed',
                        children: [
                          'Регистрируясь на платформе, вы соглашаетесь с условиями использования...',
                          o.jsx('br', {}),
                          o.jsx('br', {}),
                          'Подробнее см.',
                          ' ',
                          o.jsx(Ce, {
                            to: '/terms',
                            target: '_blank',
                            className:
                              'text-cyan-400 hover:text-cyan-300 border-b border-cyan-400/0 hover:border-cyan-400 transition-all',
                            children: 'Условия использования',
                          }),
                        ],
                      }),
                    }),
                    o.jsxs('label', {
                      className:
                        'flex items-start space-x-3 cursor-pointer group p-4 rounded-xl hover:bg-gray-800/30 transition-colors',
                      children: [
                        o.jsx('input', {
                          type: 'checkbox',
                          checked: S.agreedToTerms,
                          onChange: T => F('agreedToTerms', T.target.checked),
                          className:
                            'mt-1 h-5 w-5 text-cyan-500 focus:ring-cyan-500 border-gray-600 rounded bg-gray-800',
                        }),
                        o.jsxs('span', {
                          className: 'text-sm text-gray-300 font-sans',
                          children: [
                            'Я прочитал и согласен с',
                            ' ',
                            o.jsx(Ce, {
                              to: '/terms',
                              target: '_blank',
                              className:
                                'text-cyan-400 hover:text-cyan-300 border-b border-cyan-400/0 hover:border-cyan-400 transition-all',
                              children: 'условиями использования',
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              o.jsxs('div', {
                className: 'flex justify-between mt-8 pt-6 border-t border-gray-700/50',
                children: [
                  o.jsx(te, {
                    variant: 'outline',
                    onClick: D,
                    disabled: t === 1,
                    children: 'Назад',
                  }),
                  t < z
                    ? o.jsx(te, {
                        onClick: ue,
                        disabled: t === 1 && (!!d || !S.email),
                        children: 'Далее',
                      })
                    : o.jsx(te, {
                        onClick: C,
                        disabled: r || !S.agreedToTerms,
                        children: r ? 'Регистрация...' : 'Зарегистрироваться',
                      }),
                ],
              }),
              o.jsxs('p', {
                className: 'text-center text-sm text-gray-400 mt-6 font-sans',
                children: [
                  'Уже есть аккаунт?',
                  ' ',
                  o.jsx(Ce, {
                    to: '/login',
                    className:
                      'text-cyan-400 hover:text-cyan-300 font-semibold border-b border-cyan-400/0 hover:border-cyan-400 transition-all',
                    children: 'Войти',
                  }),
                ],
              }),
            ],
          }),
          x &&
            o.jsx('div', {
              className:
                'fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in',
              children: o.jsxs('div', {
                className:
                  'bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-scale-in',
                children: [
                  o.jsxs('div', {
                    className: 'text-center mb-6',
                    children: [
                      o.jsx('div', {
                        className:
                          'mx-auto w-16 h-16 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center mb-4 border border-cyan-500/30',
                        children: o.jsx('svg', {
                          xmlns: 'http://www.w3.org/2000/svg',
                          fill: 'none',
                          viewBox: '0 0 24 24',
                          strokeWidth: 2,
                          stroke: 'currentColor',
                          className: 'w-8 h-8 text-cyan-400',
                          children: o.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            d: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
                          }),
                        }),
                      }),
                      o.jsx('h3', {
                        className: 'text-3xl font-display font-bold text-white mb-3',
                        children: 'Аккаунт уже существует',
                      }),
                      o.jsxs('p', {
                        className: 'text-gray-400 font-sans',
                        children: [
                          'Пользователь с email ',
                          o.jsx('span', {
                            className: 'font-semibold text-cyan-400',
                            children: S.email,
                          }),
                          ' уже зарегистрирован в системе',
                        ],
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'space-y-3',
                    children: [
                      o.jsx(te, {
                        onClick: () => {
                          (w(!1), e('/login', { state: { email: S.email } }));
                        },
                        className: 'w-full',
                        children: 'Войти в аккаунт',
                      }),
                      o.jsx(te, {
                        variant: 'outline',
                        onClick: () => {
                          (w(!1), n(1), P(T => ({ ...T, email: '' })), f(''), b(!1));
                        },
                        className: 'w-full',
                        children: 'Изменить email',
                      }),
                    ],
                  }),
                ],
              }),
            }),
        ],
      }),
    ],
  });
}
function zl({ achievement: e, isUnlocked: t, progress: n, unlockedAt: r }) {
  return o.jsxs('div', {
    className: `
        relative rounded-2xl border-2 p-6 transition-all duration-300
        ${t ? 'border-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:shadow-[0_0_40px_rgba(6,182,212,0.3)]' : 'border-gray-700 bg-gray-800/30 opacity-60'}
      `,
    children: [
      o.jsx('div', {
        className: 'flex items-center justify-center mb-4',
        children: o.jsx('span', {
          className: `text-6xl transform transition-transform duration-300 ${t ? 'scale-100' : 'scale-90 grayscale'}`,
          children: e.icon,
        }),
      }),
      o.jsx('h3', {
        className: `text-xl font-display font-bold text-center mb-2 ${t ? 'text-white' : 'text-gray-500'}`,
        children: e.name,
      }),
      o.jsx('p', {
        className: `text-sm text-center mb-4 font-sans ${t ? 'text-gray-300' : 'text-gray-600'}`,
        children: e.description,
      }),
      o.jsxs('div', {
        className: `
          inline-flex items-center justify-center w-full px-3 py-2 rounded-xl text-sm font-semibold font-sans
          ${t ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white' : 'bg-gray-700 text-gray-400'}
        `,
        children: ['+', e.points, ' баллов'],
      }),
      t &&
        r &&
        o.jsxs('p', {
          className: 'text-xs text-gray-500 dark:text-gray-500 text-center mt-3 font-sans',
          children: ['Получено: ', new Date(r).toLocaleDateString('ru-RU')],
        }),
      !t &&
        n !== void 0 &&
        n > 0 &&
        o.jsxs('div', {
          className: 'mt-4',
          children: [
            o.jsxs('p', {
              className: 'text-xs text-gray-500 dark:text-gray-500 mb-2 text-center font-sans',
              children: ['Прогресс: ', n, '%'],
            }),
            o.jsx(ep, { current: n, total: 100, showLabel: !1 }),
          ],
        }),
      !t &&
        o.jsx('div', {
          className: 'absolute top-3 right-3',
          children: o.jsx('div', {
            className: 'bg-gray-700 text-gray-400 text-xs px-2 py-1 rounded-full',
            children: '🔒',
          }),
        }),
    ],
  });
}
function Uv() {
  const [e, t] = y.useState(null),
    [n, r] = y.useState([]),
    [s, a] = y.useState(!0);
  y.useEffect(() => {
    (l(), i());
  }, []);
  const l = async () => {
      try {
        const d = pe.getState().token;
        if (!d) {
          window.location.href = '/login';
          return;
        }
        const f = await fetch('/api/users/profile', { headers: { Authorization: `Bearer ${d}` } });
        if (f.ok) {
          const m = await f.json();
          t(m);
        }
      } catch (d) {
        console.error('Error loading profile:', d);
      } finally {
        a(!1);
      }
    },
    i = async () => {
      try {
        const d = pe.getState().token;
        if (!d) {
          window.location.href = '/login';
          return;
        }
        const f = await fetch('/api/users/achievements', {
          headers: { Authorization: `Bearer ${d}` },
        });
        if (f.ok) {
          const m = await f.json();
          r(m.achievements || []);
        }
      } catch (d) {
        console.error('Error loading achievements:', d);
      }
    };
  if (s)
    return o.jsx('div', {
      className: 'min-h-screen bg-gray-950 dark:bg-black flex items-center justify-center',
      children: o.jsxs('div', {
        className: 'relative',
        children: [
          o.jsx('div', {
            className:
              'w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin',
          }),
          o.jsx('div', {
            className:
              'absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin',
            style: { animationDirection: 'reverse', animationDuration: '0.8s' },
          }),
        ],
      }),
    });
  if (!e)
    return o.jsx('div', {
      className: 'min-h-screen bg-gray-950 dark:bg-black flex items-center justify-center',
      children: o.jsx('div', {
        className: 'text-gray-400 font-sans',
        children: 'Профиль не найден',
      }),
    });
  const u = n.filter(d => d.isUnlocked),
    c = n.filter(d => !d.isUnlocked);
  return o.jsxs('div', {
    className: 'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-8',
    children: [
      o.jsx('div', {
        className:
          'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
      }),
      o.jsx('div', {
        className:
          'absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse',
      }),
      o.jsx('div', {
        className:
          'absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse',
        style: { animationDelay: '1s' },
      }),
      o.jsxs('div', {
        className: 'relative z-10 max-w-7xl mx-auto px-4',
        children: [
          o.jsx('h1', {
            className:
              'text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-8 animate-fade-in',
            children: 'Профиль',
          }),
          o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] mb-8 animate-slide-up',
            children: [
              o.jsxs('h2', {
                className: 'text-3xl font-display font-semibold text-white mb-6 flex items-center',
                children: [
                  o.jsx('span', {
                    className: 'w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse',
                  }),
                  'Личная информация',
                ],
              }),
              o.jsxs('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
                children: [
                  o.jsxs('div', {
                    className: 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                    children: [
                      o.jsx('p', {
                        className: 'text-sm text-gray-500 font-sans mb-1',
                        children: 'Имя',
                      }),
                      o.jsx('p', {
                        className: 'text-lg font-medium text-white font-sans',
                        children: e.name,
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                    children: [
                      o.jsx('p', {
                        className: 'text-sm text-gray-500 font-sans mb-1',
                        children: 'Username',
                      }),
                      o.jsxs('p', {
                        className: 'text-lg font-medium text-cyan-400 font-mono',
                        children: ['@', e.username],
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                    children: [
                      o.jsx('p', {
                        className: 'text-sm text-gray-500 font-sans mb-1',
                        children: 'Email',
                      }),
                      o.jsx('p', {
                        className: 'text-lg font-medium text-white font-sans break-all',
                        children: e.email,
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                    children: [
                      o.jsx('p', {
                        className: 'text-sm text-gray-500 font-sans mb-1',
                        children: 'Статус',
                      }),
                      o.jsx('p', {
                        className: 'text-lg font-medium text-white font-sans',
                        children: Rl[e.status],
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                    children: [
                      o.jsx('p', {
                        className: 'text-sm text-gray-500 font-sans mb-1',
                        children: 'Текущий класс',
                      }),
                      o.jsx('p', {
                        className: 'text-lg font-medium text-white font-sans',
                        children: j0[e.currentGrade],
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                    children: [
                      o.jsx('p', {
                        className: 'text-sm text-gray-500 font-sans mb-1',
                        children: 'Способ входа',
                      }),
                      o.jsx('p', {
                        className: 'text-lg font-medium text-white font-sans',
                        children: kx[e.authProvider],
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                    children: [
                      o.jsx('p', {
                        className: 'text-sm text-gray-500 font-sans mb-1',
                        children: 'Дата регистрации',
                      }),
                      o.jsx('p', {
                        className: 'text-lg font-medium text-white font-sans',
                        children: new Date(e.createdAt).toLocaleDateString('ru-RU'),
                      }),
                    ],
                  }),
                ],
              }),
              e.desiredDirection &&
                o.jsxs('div', {
                  className:
                    'mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-500/30',
                  children: [
                    o.jsx('p', {
                      className: 'text-sm text-gray-500 font-sans mb-1',
                      children: 'Желаемое направление',
                    }),
                    o.jsx('p', {
                      className: 'text-lg font-medium text-cyan-400 font-sans',
                      children: Hi[e.desiredDirection],
                    }),
                  ],
                }),
              e.motivation &&
                o.jsxs('div', {
                  className: 'mt-6 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50',
                  children: [
                    o.jsx('p', {
                      className: 'text-sm text-gray-500 font-sans mb-2',
                      children: 'Мотивация',
                    }),
                    o.jsx('p', {
                      className: 'text-gray-300 font-sans leading-relaxed',
                      children: e.motivation,
                    }),
                  ],
                }),
            ],
          }),
          o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up',
            style: { animationDelay: '100ms' },
            children: [
              o.jsxs('h2', {
                className: 'text-3xl font-display font-semibold text-white mb-6 flex items-center',
                children: [
                  o.jsx('span', {
                    className: 'w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse',
                    style: { animationDelay: '0.5s' },
                  }),
                  'Достижения',
                ],
              }),
              o.jsxs('div', {
                className: 'mb-8',
                children: [
                  o.jsxs('div', {
                    className: 'flex justify-between items-center mb-3',
                    children: [
                      o.jsx('span', {
                        className: 'text-sm text-gray-400 font-sans',
                        children: 'Прогресс',
                      }),
                      o.jsxs('span', {
                        className: 'text-sm font-medium text-cyan-400 font-mono',
                        children: [u.length, ' / ', n.length],
                      }),
                    ],
                  }),
                  o.jsx('div', {
                    className: 'w-full bg-gray-700 rounded-full h-3 overflow-hidden',
                    children: o.jsx('div', {
                      className:
                        'bg-gradient-to-r from-cyan-500 to-blue-500 h-3 rounded-full transition-all duration-1000 ease-out',
                      style: { width: `${n.length > 0 ? (u.length / n.length) * 100 : 0}%` },
                    }),
                  }),
                ],
              }),
              u.length > 0 &&
                o.jsxs('div', {
                  className: 'mb-8',
                  children: [
                    o.jsxs('h3', {
                      className:
                        'text-xl font-display font-semibold mb-4 text-green-400 flex items-center',
                      children: [
                        o.jsx('svg', {
                          xmlns: 'http://www.w3.org/2000/svg',
                          fill: 'none',
                          viewBox: '0 0 24 24',
                          strokeWidth: 2,
                          stroke: 'currentColor',
                          className: 'w-5 h-5 mr-2',
                          children: o.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            d: 'M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z',
                          }),
                        }),
                        'Разблокировано (',
                        u.length,
                        ')',
                      ],
                    }),
                    o.jsx('div', {
                      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
                      children: u.map((d, f) =>
                        o.jsx(
                          'div',
                          {
                            className: 'animate-scale-in',
                            style: { animationDelay: `${f * 50}ms` },
                            children: o.jsx(zl, {
                              achievement: d,
                              isUnlocked: !0,
                              unlockedAt: d.unlockedAt,
                            }),
                          },
                          d.id
                        )
                      ),
                    }),
                  ],
                }),
              c.length > 0 &&
                o.jsxs('div', {
                  children: [
                    o.jsxs('h3', {
                      className:
                        'text-xl font-display font-semibold mb-4 text-gray-500 flex items-center',
                      children: [
                        o.jsx('svg', {
                          xmlns: 'http://www.w3.org/2000/svg',
                          fill: 'none',
                          viewBox: '0 0 24 24',
                          strokeWidth: 2,
                          stroke: 'currentColor',
                          className: 'w-5 h-5 mr-2',
                          children: o.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            d: 'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z',
                          }),
                        }),
                        'Заблокировано (',
                        c.length,
                        ')',
                      ],
                    }),
                    o.jsx('div', {
                      className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
                      children: c.map((d, f) =>
                        o.jsx(
                          'div',
                          {
                            className: 'animate-scale-in',
                            style: { animationDelay: `${(u.length + f) * 50}ms` },
                            children: o.jsx(zl, { achievement: d, isUnlocked: !1 }),
                          },
                          d.id
                        )
                      ),
                    }),
                  ],
                }),
              n.length === 0 &&
                o.jsx('p', {
                  className: 'text-center text-gray-500 py-12 font-sans',
                  children: 'Достижения пока не загружены',
                }),
            ],
          }),
        ],
      }),
    ],
  });
}
const fs = {
    OGE: { duration: 235, title: 'ОГЭ', description: 'Основной государственный экзамен', grade: 9 },
    EGE_PROFILE: {
      duration: 235,
      title: 'ЕГЭ (Профильный)',
      description: 'Единый государственный экзамен профильного уровня',
      grade: 11,
    },
    EGE_BASE: {
      duration: 180,
      title: 'ЕГЭ (Базовый)',
      description: 'Единый государственный экзамен базового уровня',
      grade: 11,
    },
    REGULAR: { duration: 30, title: 'Тест', description: 'Тренировочный тест', grade: 8 },
  },
  Rs = { warningThreshold: 0.25, criticalThreshold: 0.1, tickInterval: 1e3 },
  tp = {
    MATHEMATICS: 'Математика',
    PHYSICS: 'Физика',
    CHEMISTRY: 'Химия',
    BIOLOGY: 'Биология',
    RUSSIAN: 'Русский язык',
    INFORMATICS: 'Информатика',
  },
  Mc = {
    short: { name: 'Краткий ответ', description: 'Введите ответ в поле', icon: '✏️' },
    choice: { name: 'Выбор ответа', description: 'Выберите один правильный ответ', icon: '🔘' },
    matching: { name: 'Соответствие', description: 'Установите соответствие', icon: '🔗' },
    multiple_choice: {
      name: 'Множественный выбор',
      description: 'Выберите все правильные ответы',
      icon: '☑️',
    },
    detailed: { name: 'Развернутый ответ', description: 'Запишите подробное решение', icon: '📝' },
    proof: { name: 'Доказательство', description: 'Запишите доказательство', icon: '📐' },
  },
  _n = { TEST_SESSION: 'lyceum64_test_session', ANSWERS_BACKUP: 'lyceum64_answers_backup' },
  Js = {
    TEST_COMPLETED: 'Тест успешно завершён!',
    TIME_EXPIRED: 'Время истекло!',
    ERROR_LOADING_EXAM: 'Ошибка загрузки экзамена',
    UNANSWERED_WARNING: 'У вас есть неотвеченные вопросы. Продолжить?',
  },
  ft = class ft {
    constructor() {
      $(this, 'duration', 0);
      $(this, 'timeLeft', 0);
      $(this, 'isRunning', !1);
      $(this, 'isPaused', !1);
      $(this, 'intervalId', null);
      $(this, 'tickObservers', new Set());
      $(this, 'completeObservers', new Set());
    }
    static getInstance() {
      return (ft.instance || (ft.instance = new ft()), ft.instance);
    }
    static resetInstance() {
      ft.instance && (ft.instance.stop(), (ft.instance = null));
    }
    start(t) {
      (this.stop(),
        (this.duration = t),
        (this.timeLeft = t),
        (this.isRunning = !0),
        (this.isPaused = !1),
        (this.intervalId = setInterval(() => {
          this.tick();
        }, Rs.tickInterval)),
        this.notifyTick());
    }
    pause() {
      this.isRunning &&
        !this.isPaused &&
        ((this.isPaused = !0),
        (this.isRunning = !1),
        this.intervalId && (clearInterval(this.intervalId), (this.intervalId = null)),
        this.notifyTick());
    }
    resume() {
      this.isPaused &&
        ((this.isPaused = !1),
        (this.isRunning = !0),
        (this.intervalId = setInterval(() => {
          this.tick();
        }, Rs.tickInterval)),
        this.notifyTick());
    }
    stop() {
      (this.intervalId && (clearInterval(this.intervalId), (this.intervalId = null)),
        (this.isRunning = !1),
        (this.isPaused = !1),
        (this.timeLeft = 0),
        this.notifyTick());
    }
    reset(t) {
      (this.stop(), (this.duration = t), (this.timeLeft = t), this.notifyTick());
    }
    getState() {
      return {
        timeLeft: this.timeLeft,
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        status: this.calculateStatus(),
      };
    }
    onTick(t) {
      return (this.tickObservers.add(t), t(this.getState()), () => this.tickObservers.delete(t));
    }
    onComplete(t) {
      return (this.completeObservers.add(t), () => this.completeObservers.delete(t));
    }
    subscribe(t) {
      const n = r => t.update(r);
      return (this.tickObservers.add(n), () => this.tickObservers.delete(n));
    }
    notify(t) {
      this.tickObservers.forEach(n => n(t));
    }
    tick() {
      this.timeLeft > 0 &&
        (this.timeLeft--, this.notifyTick(), this.timeLeft === 0 && this.handleComplete());
    }
    notifyTick() {
      const t = this.getState();
      this.tickObservers.forEach(n => n(t));
    }
    handleComplete() {
      (this.stop(), this.completeObservers.forEach(t => t()));
    }
    calculateStatus() {
      if (this.duration === 0) return 'normal';
      const t = this.timeLeft / this.duration;
      return t <= Rs.criticalThreshold
        ? 'critical'
        : t <= Rs.warningThreshold
          ? 'warning'
          : 'normal';
    }
    static formatTime(t) {
      const n = Math.floor(t / 3600),
        r = Math.floor((t % 3600) / 60),
        s = t % 60;
      return n > 0
        ? `${n}:${r.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        : `${r}:${s.toString().padStart(2, '0')}`;
    }
    getPercentRemaining() {
      return this.duration === 0 ? 100 : Math.round((this.timeLeft / this.duration) * 100);
    }
    isExpired() {
      return this.timeLeft === 0 && this.duration > 0;
    }
    addTime(t) {
      ((this.timeLeft += t), (this.duration += t), this.notifyTick());
    }
  };
$(ft, 'instance', null);
let ar = ft;
const an = class an {
  constructor() {
    $(this, 'prefix', 'lyceum64_');
    $(this, 'isAvailable');
    this.isAvailable = this.checkAvailability();
  }
  static getInstance() {
    return (an.instance || (an.instance = new an()), an.instance);
  }
  checkAvailability() {
    try {
      const t = '__storage_test__';
      return (localStorage.setItem(t, t), localStorage.removeItem(t), !0);
    } catch (t) {
      return (console.warn('localStorage недоступен:', t), !1);
    }
  }
  getKey(t) {
    return `${this.prefix}${t}`;
  }
  save(t, n) {
    if (!this.isAvailable) {
      console.warn('Storage недоступен');
      return;
    }
    try {
      const r = JSON.stringify({ data: n, timestamp: Date.now(), version: '1.0' });
      localStorage.setItem(this.getKey(t), r);
    } catch (r) {
      (console.error('Ошибка сохранения:', r),
        r instanceof DOMException &&
          r.name === 'QuotaExceededError' &&
          (this.clearOldData(), this.save(t, n)));
    }
  }
  load(t) {
    if (!this.isAvailable) return null;
    try {
      const n = localStorage.getItem(this.getKey(t));
      return n ? JSON.parse(n).data : null;
    } catch (n) {
      return (console.error('Ошибка загрузки:', n), null);
    }
  }
  loadWithMeta(t) {
    if (!this.isAvailable) return null;
    try {
      const n = localStorage.getItem(this.getKey(t));
      if (!n) return null;
      const r = JSON.parse(n);
      return { data: r.data, timestamp: r.timestamp };
    } catch (n) {
      return (console.error('Ошибка загрузки:', n), null);
    }
  }
  remove(t) {
    this.isAvailable && localStorage.removeItem(this.getKey(t));
  }
  clear() {
    if (!this.isAvailable) return;
    const t = [];
    for (let n = 0; n < localStorage.length; n++) {
      const r = localStorage.key(n);
      r && r.startsWith(this.prefix) && t.push(r);
    }
    t.forEach(n => localStorage.removeItem(n));
  }
  exists(t) {
    return this.isAvailable ? localStorage.getItem(this.getKey(t)) !== null : !1;
  }
  clearOldData() {
    const n = Date.now();
    for (let r = 0; r < localStorage.length; r++) {
      const s = localStorage.key(r);
      if (s && s.startsWith(this.prefix))
        try {
          const a = localStorage.getItem(s);
          if (a) {
            const l = JSON.parse(a);
            n - l.timestamp > 6048e5 && localStorage.removeItem(s);
          }
        } catch {
          localStorage.removeItem(s);
        }
    }
  }
  getUsedSpace() {
    let t = 0;
    for (let n = 0; n < localStorage.length; n++) {
      const r = localStorage.key(n);
      if (r && r.startsWith(this.prefix)) {
        const s = localStorage.getItem(r);
        s && (t += r.length + s.length);
      }
    }
    return t * 2;
  }
  getKeys() {
    const t = [];
    for (let n = 0; n < localStorage.length; n++) {
      const r = localStorage.key(n);
      r && r.startsWith(this.prefix) && t.push(r.replace(this.prefix, ''));
    }
    return t;
  }
};
$(an, 'instance');
let $l = an;
class Hv {
  constructor() {
    $(this, 'storage');
    this.storage = $l.getInstance();
  }
  saveSession(t) {
    this.storage.save(_n.TEST_SESSION, t);
  }
  loadSession() {
    return this.storage.load(_n.TEST_SESSION);
  }
  clearSession() {
    this.storage.remove(_n.TEST_SESSION);
  }
  hasSession() {
    return this.storage.exists(_n.TEST_SESSION);
  }
  backupAnswers(t) {
    this.storage.save(_n.ANSWERS_BACKUP, Array.from(t.entries()));
  }
  restoreAnswers() {
    const t = this.storage.load(_n.ANSWERS_BACKUP);
    return t ? new Map(t) : null;
  }
}
const br = 'lyceum64_active_test',
  on = class on {
    constructor() {}
    static getInstance() {
      return (on.instance || (on.instance = new on()), on.instance);
    }
    startTest(t) {
      const n = crypto.randomUUID(),
        r = { ...t, id: n };
      return (localStorage.setItem(br, JSON.stringify(r)), n);
    }
    getActiveTest() {
      try {
        const t = localStorage.getItem(br);
        return t ? JSON.parse(t) : null;
      } catch {
        return null;
      }
    }
    hasActiveTest() {
      return this.getActiveTest() !== null;
    }
    updateProgress(t) {
      const n = this.getActiveTest();
      if (!n) return;
      const r = { ...n, ...t };
      localStorage.setItem(br, JSON.stringify(r));
    }
    completeTest() {
      localStorage.removeItem(br);
    }
    abandonTest() {
      localStorage.removeItem(br);
    }
    getTimeSinceStart() {
      const t = this.getActiveTest();
      if (!t) return null;
      const n = new Date(t.startedAt);
      return Math.floor((Date.now() - n.getTime()) / 1e3);
    }
    isTestExpired(t) {
      const n = this.getTimeSinceStart();
      return n === null ? !1 : n >= t;
    }
  };
$(on, 'instance');
let Bl = on;
const mn = () => Bl.getInstance();
function Wv({ onAbandon: e }) {
  const t = Qe(),
    [n, r] = y.useState(null),
    [s, a] = y.useState(!1);
  if (
    (y.useEffect(() => {
      const f = mn();
      r(f.getActiveTest());
    }, []),
    !n)
  )
    return null;
  const l = () => {
      t(n.route);
    },
    i = () => {
      (mn().abandonTest(), r(null), a(!1), e == null || e());
    },
    u = Math.round((n.answeredCount / n.totalTasks) * 100),
    c = new Date(n.startedAt),
    d = Vv(c);
  return o.jsxs('div', {
    className:
      'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-2xl p-6 mb-6',
    children: [
      o.jsx('div', {
        className: 'flex items-start justify-between gap-4',
        children: o.jsxs('div', {
          className: 'flex-1',
          children: [
            o.jsxs('div', {
              className: 'flex items-center gap-2 mb-2',
              children: [
                o.jsx('span', { className: 'text-2xl', children: '⚠️' }),
                o.jsx('h3', {
                  className: 'text-lg font-semibold text-amber-400',
                  children: 'У вас есть незавершённый тест',
                }),
              ],
            }),
            o.jsxs('div', {
              className: 'text-gray-300 mb-3',
              children: [
                o.jsx('p', { className: 'font-medium text-white', children: n.title }),
                o.jsxs('p', { className: 'text-sm text-gray-400', children: ['Начат ', d] }),
              ],
            }),
            o.jsx('div', {
              className: 'flex items-center gap-4 mb-4',
              children: o.jsxs('div', {
                className: 'flex-1',
                children: [
                  o.jsxs('div', {
                    className: 'flex justify-between text-sm mb-1',
                    children: [
                      o.jsx('span', { className: 'text-gray-400', children: 'Прогресс' }),
                      o.jsxs('span', {
                        className: 'text-amber-400',
                        children: [n.answeredCount, ' из ', n.totalTasks],
                      }),
                    ],
                  }),
                  o.jsx('div', {
                    className: 'h-2 bg-gray-700 rounded-full overflow-hidden',
                    children: o.jsx('div', {
                      className:
                        'h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all',
                      style: { width: `${u}%` },
                    }),
                  }),
                ],
              }),
            }),
            o.jsxs('div', {
              className: 'flex gap-3',
              children: [
                o.jsx('button', {
                  onClick: l,
                  className:
                    'px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all',
                  children: 'Продолжить тест',
                }),
                o.jsx('button', {
                  onClick: () => a(!0),
                  className:
                    'px-6 py-2.5 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-all',
                  children: 'Завершить без сохранения',
                }),
              ],
            }),
          ],
        }),
      }),
      s &&
        o.jsx('div', {
          className: 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4',
          children: o.jsxs('div', {
            className: 'bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700',
            children: [
              o.jsx('h4', {
                className: 'text-xl font-semibold text-white mb-3',
                children: 'Завершить тест?',
              }),
              o.jsx('p', {
                className: 'text-gray-400 mb-6',
                children:
                  'Весь прогресс будет потерян. Вы уверены, что хотите завершить тест без сохранения результата?',
              }),
              o.jsxs('div', {
                className: 'flex gap-3',
                children: [
                  o.jsx('button', {
                    onClick: () => a(!1),
                    className:
                      'flex-1 px-4 py-2.5 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-all',
                    children: 'Отмена',
                  }),
                  o.jsx('button', {
                    onClick: i,
                    className:
                      'flex-1 px-4 py-2.5 bg-red-500 text-white font-medium rounded-xl hover:bg-red-600 transition-all',
                    children: 'Да, завершить',
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
function Vv(e) {
  const t = Math.floor((Date.now() - e.getTime()) / 1e3);
  return t < 60
    ? 'только что'
    : t < 3600
      ? `${Math.floor(t / 60)} мин. назад`
      : t < 86400
        ? `${Math.floor(t / 3600)} ч. назад`
        : `${Math.floor(t / 86400)} дн. назад`;
}
function Gv() {
  const e = Qe(),
    { isAuthenticated: t, user: n } = pe(),
    [r, s] = y.useState(null),
    [a, l] = y.useState([]),
    [i, u] = y.useState(!0),
    [c, d] = y.useState({ totalTests: 0, averageScore: 0, bestScore: 0 }),
    [f, m] = y.useState(!1);
  y.useEffect(() => {
    (x(), b());
  }, []);
  const b = () => {
    const h = mn();
    m(h.hasActiveTest());
  };
  y.useEffect(() => {
    if (r) {
      const g = 33.333333333333336;
      let j = 0;
      const k = setInterval(() => {
        j++;
        const A = j / 30,
          _ = 1 - Math.pow(1 - A, 4);
        (d({
          totalTests: Math.floor(r.totalTests * _),
          averageScore: r.averageScore * _,
          bestScore: Math.floor(r.bestScore * _),
        }),
          j >= 30 && (clearInterval(k), d(r)));
      }, g);
      return () => clearInterval(k);
    }
  }, [r]);
  const x = async () => {
      try {
        const h = pe.getState().token,
          p = await fetch('/api/users/stats', { headers: { Authorization: `Bearer ${h}` } });
        p.ok && s(await p.json());
        const g = await fetch('/api/users/achievements', {
          headers: { Authorization: `Bearer ${h}` },
        });
        if (g.ok) {
          const k = (await g.json()).achievements.filter(A => A.isUnlocked).slice(0, 3);
          l(k);
        }
      } catch (h) {
        console.error('Error loading dashboard:', h);
      } finally {
        u(!1);
      }
    },
    w = h => {
      if (f) {
        H.error('Сначала завершите текущий тест');
        return;
      }
      e(`/test/setup/${h}`);
    };
  if (i)
    return o.jsx('div', {
      className: 'min-h-screen bg-gray-950 dark:bg-black flex items-center justify-center',
      children: o.jsxs('div', {
        className: 'relative',
        children: [
          o.jsx('div', {
            className:
              'w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin',
          }),
          o.jsx('div', {
            className:
              'absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin',
            style: { animationDirection: 'reverse', animationDuration: '0.8s' },
          }),
        ],
      }),
    });
  const v = [
    {
      name: 'Тесты по математике',
      icon: '🔢',
      description: 'Подготовка к вступительным экзаменам',
      color: 'from-cyan-500 to-blue-500',
      subjectKey: 'MATHEMATICS',
    },
    {
      name: 'Тесты по физике',
      icon: '⚛️',
      description: 'Профильный предмет для техн. направлений',
      color: 'from-blue-500 to-purple-500',
      subjectKey: 'PHYSICS',
    },
    {
      name: 'Тесты по информатике',
      icon: '💻',
      description: 'Подготовка для программистов',
      color: 'from-purple-500 to-pink-500',
      subjectKey: 'INFORMATICS',
    },
    {
      name: 'Тесты по биологии',
      icon: '🧬',
      description: 'Для направлений медицина и биотехнологии',
      color: 'from-pink-500 to-red-500',
      subjectKey: 'BIOLOGY',
    },
    {
      name: 'Тесты по русскому',
      icon: '📖',
      description: 'Обязательный предмет для всех',
      color: 'from-red-500 to-orange-500',
      subjectKey: 'RUSSIAN',
    },
    {
      name: 'Тесты по истории',
      icon: '🏛️',
      description: 'Для направления культура',
      color: 'from-orange-500 to-yellow-500',
      subjectKey: 'HISTORY',
    },
  ];
  return o.jsxs('div', {
    className: 'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden',
    children: [
      o.jsx('div', {
        className:
          'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
      }),
      o.jsx('div', {
        className:
          'absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse',
      }),
      o.jsx('div', {
        className:
          'absolute bottom-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse',
        style: { animationDelay: '1s' },
      }),
      o.jsxs('div', {
        className: 'relative z-10 max-w-7xl mx-auto px-4 py-8',
        children: [
          o.jsxs('div', {
            className: 'mb-12 animate-fade-in',
            children: [
              o.jsx('h1', {
                className:
                  'text-5xl md:text-6xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3',
                children: t
                  ? `Привет, ${(n == null ? void 0 : n.name) || 'Пользователь'}!`
                  : o.jsxs(o.Fragment, {
                      children: [
                        o.jsx(Ce, {
                          to: '/login',
                          className:
                            'hover:from-cyan-300 hover:via-blue-300 hover:to-purple-300 transition-all',
                          children: 'Войдите',
                        }),
                        o.jsx('span', {
                          className: 'text-gray-600 dark:text-gray-400',
                          children: ' в систему',
                        }),
                      ],
                    }),
              }),
              o.jsx('p', {
                className: 'text-xl text-gray-400 font-sans',
                children: 'Готовы покорять новые вершины знаний?',
              }),
            ],
          }),
          o.jsx(Wv, { onAbandon: () => m(!1) }),
          o.jsxs('div', {
            className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-12',
            children: [
              o.jsx(Ao, {
                title: 'Пройдено тестов',
                value: c.totalTests,
                icon: '📊',
                color: 'from-cyan-500 to-blue-500',
                delay: '0ms',
              }),
              o.jsx(Ao, {
                title: 'Средний балл',
                value: `${c.averageScore.toFixed(1)}%`,
                icon: '⭐',
                color: 'from-blue-500 to-purple-500',
                delay: '100ms',
              }),
              o.jsx(Ao, {
                title: 'Лучший результат',
                value: `${c.bestScore}%`,
                icon: '🏆',
                color: 'from-purple-500 to-pink-500',
                delay: '200ms',
              }),
            ],
          }),
          a.length > 0 &&
            o.jsxs('div', {
              className: 'mb-12 animate-slide-up',
              children: [
                o.jsxs('div', {
                  className: 'flex justify-between items-center mb-6',
                  children: [
                    o.jsxs('h2', {
                      className: 'text-3xl font-display font-bold text-white flex items-center',
                      children: [
                        o.jsx('span', {
                          className: 'w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse',
                        }),
                        'Недавние достижения',
                      ],
                    }),
                    o.jsxs(Ce, {
                      to: '/profile',
                      className:
                        'text-cyan-400 hover:text-cyan-300 font-sans font-medium flex items-center group transition-colors',
                      children: [
                        'Смотреть все',
                        o.jsx('svg', {
                          className:
                            'w-5 h-5 ml-1 transform group-hover:translate-x-1 transition-transform',
                          fill: 'none',
                          stroke: 'currentColor',
                          viewBox: '0 0 24 24',
                          children: o.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            strokeWidth: 2,
                            d: 'M17 8l4 4m0 0l-4 4m4-4H3',
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
                o.jsx('div', {
                  className: 'grid grid-cols-1 md:grid-cols-3 gap-6',
                  children: a.map((h, p) =>
                    o.jsx(
                      'div',
                      {
                        className: 'animate-scale-in',
                        style: { animationDelay: `${p * 100}ms` },
                        children: o.jsx(zl, {
                          achievement: h,
                          isUnlocked: !0,
                          unlockedAt: h.unlockedAt,
                        }),
                      },
                      h.id
                    )
                  ),
                }),
              ],
            }),
          o.jsxs('div', {
            className: 'animate-slide-up',
            style: { animationDelay: '300ms' },
            children: [
              o.jsx('div', {
                className: 'flex items-center justify-between mb-6',
                children: o.jsxs('div', {
                  children: [
                    o.jsxs('h2', {
                      className: 'text-3xl font-display font-bold text-white flex items-center',
                      children: [
                        o.jsx('span', {
                          className: 'w-2 h-2 bg-purple-400 rounded-full mr-3 animate-pulse',
                          style: { animationDelay: '0.5s' },
                        }),
                        'Начать подготовку',
                      ],
                    }),
                    o.jsx('p', {
                      className: 'text-gray-400 font-sans mt-2',
                      children: f
                        ? 'Завершите текущий тест, чтобы начать новый'
                        : 'Выберите предмет для тренировки',
                    }),
                  ],
                }),
              }),
              o.jsx('div', {
                className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
                children: v.map((h, p) =>
                  o.jsx(
                    Kv,
                    { subject: h, index: p, disabled: f, onClick: () => w(h.subjectKey) },
                    h.name
                  )
                ),
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
function Ao({ title: e, value: t, icon: n, color: r, delay: s }) {
  return o.jsxs('div', {
    className: 'group relative animate-scale-in',
    style: { animationDelay: s },
    children: [
      o.jsx('div', {
        className: `absolute -inset-0.5 bg-gradient-to-r ${r} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500`,
      }),
      o.jsxs('div', {
        className:
          'relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transition-all duration-500 group-hover:border-transparent',
        children: [
          o.jsxs('div', {
            className: 'flex items-start justify-between mb-4',
            children: [
              o.jsx('div', { className: 'text-4xl', children: n }),
              o.jsx('div', {
                className: `w-12 h-12 bg-gradient-to-br ${r} rounded-xl opacity-20 group-hover:opacity-30 transition-opacity`,
              }),
            ],
          }),
          o.jsx('h3', {
            className: 'text-sm font-sans font-medium text-gray-400 mb-2',
            children: e,
          }),
          o.jsx('p', {
            className: `text-4xl font-display font-bold bg-gradient-to-r ${r} bg-clip-text text-transparent`,
            children: t,
          }),
        ],
      }),
    ],
  });
}
function Kv({ subject: e, index: t, disabled: n, onClick: r }) {
  const [s, a] = y.useState(!1);
  return o.jsx('div', {
    onClick: r,
    className: `cursor-pointer ${n ? 'opacity-50' : ''}`,
    children: o.jsxs('div', {
      className: 'group relative h-full',
      onMouseEnter: () => a(!0),
      onMouseLeave: () => a(!1),
      style: { animationDelay: `${t * 50}ms` },
      children: [
        o.jsx('div', {
          className: `absolute -inset-0.5 bg-gradient-to-r ${e.color} rounded-2xl opacity-0 ${!n && 'group-hover:opacity-100'} blur transition-all duration-500`,
        }),
        o.jsxs('div', {
          className:
            'relative h-full bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6 transition-all duration-500 group-hover:border-transparent',
          children: [
            o.jsx('div', {
              className:
                'absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500',
            }),
            o.jsxs('div', {
              className: 'relative z-10',
              children: [
                o.jsx('div', {
                  className: `text-4xl mb-4 transform transition-transform duration-500 ${!n && 'group-hover:scale-110 group-hover:rotate-12'}`,
                  children: e.icon,
                }),
                o.jsx('h3', {
                  className: 'font-display font-semibold text-xl mb-2 text-white',
                  children: e.name,
                }),
                o.jsx('p', {
                  className: 'text-gray-400 font-sans text-sm leading-relaxed mb-4',
                  children: e.description,
                }),
                o.jsx('div', {
                  className: `flex items-center font-sans font-medium bg-gradient-to-r ${e.color} bg-clip-text text-transparent transition-all duration-300 ${s && !n ? 'translate-x-2' : ''}`,
                  children: o.jsx('span', { children: n ? 'Заблокировано' : 'Начать →' }),
                }),
              ],
            }),
          ],
        }),
      ],
    }),
  });
}
function Qv() {
  return o.jsx('div', {
    className: 'min-h-screen bg-gray-50 py-12',
    children: o.jsx('div', {
      className: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
      children: o.jsxs('div', {
        className: 'bg-white shadow-lg rounded-lg p-8',
        children: [
          o.jsx('h1', {
            className: 'text-3xl font-bold text-gray-900 mb-6',
            children: 'Пользовательское соглашение',
          }),
          o.jsxs('div', {
            className: 'prose prose-blue max-w-none',
            children: [
              o.jsx('h2', {
                className: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
                children: '1. Общие положения',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  'Настоящее Пользовательское соглашение регулирует отношения между администрацией платформы подготовки к поступлению в Лицей-интернат №64 г. Саратова и пользователями платформы.',
              }),
              o.jsx('h2', {
                className: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
                children: '2. Использование платформы',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '2.1. Платформа предназначена для подготовки к поступлению в Лицей-интернат №64 г. Саратова и является некоммерческим образовательным проектом.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '2.2. Регистрируясь на платформе, пользователь соглашается предоставить достоверную информацию о себе.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '2.3. Пользователь обязуется использовать платформу исключительно в образовательных целях.',
              }),
              o.jsx('h2', {
                className: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
                children: '3. Персональные данные',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '3.1. Платформа собирает следующие персональные данные: имя, email, текущий класс обучения, желаемое направление в лицее.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '3.2. Персональные данные используются исключительно для обеспечения функционирования платформы и улучшения качества обучения.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '3.3. Платформа не передает персональные данные третьим лицам без согласия пользователя.',
              }),
              o.jsx('h2', {
                className: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
                children: '4. Права и обязанности пользователя',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '4.1. Пользователь имеет право на доступ к образовательным материалам и тестам платформы.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '4.2. Пользователь обязуется не распространять материалы платформы без разрешения администрации.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '4.3. Пользователь обязуется не создавать несколько аккаунтов для одного лица.',
              }),
              o.jsx('h2', {
                className: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
                children: '5. Ответственность',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '5.1. Платформа не несет ответственности за результаты вступительных экзаменов пользователей.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '5.2. Платформа предоставляет материалы «как есть» и не гарантирует их полноту или актуальность.',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  '5.3. Пользователь несет полную ответственность за сохранность своих учетных данных.',
              }),
              o.jsx('h2', {
                className: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
                children: '6. Изменение условий',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  'Администрация оставляет за собой право изменять условия настоящего соглашения. Пользователи будут уведомлены об изменениях через платформу.',
              }),
              o.jsx('h2', {
                className: 'text-2xl font-semibold text-gray-900 mt-6 mb-4',
                children: '7. Контакты',
              }),
              o.jsx('p', {
                className: 'text-gray-700 mb-4',
                children:
                  'По всем вопросам, связанным с использованием платформы, вы можете обратиться по адресу: sarli64@mail.ru',
              }),
              o.jsxs('p', {
                className: 'text-gray-600 text-sm mt-8',
                children: ['Дата последнего обновления: ', new Date().toLocaleDateString('ru-RU')],
              }),
            ],
          }),
          o.jsx('div', {
            className: 'mt-8 flex justify-center',
            children: o.jsx(Ce, {
              to: '/register',
              className:
                'px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
              children: 'Вернуться к регистрации',
            }),
          }),
        ],
      }),
    }),
  });
}
function qv() {
  const e = Qe(),
    { token: t, user: n } = pe(),
    [r, s] = y.useState(null),
    [a, l] = y.useState(!0);
  y.useEffect(() => {
    i();
  }, []);
  const i = async () => {
      try {
        const b = await (
          await fetch(
            `/api/diagnostic/status?direction=${(n == null ? void 0 : n.desiredDirection) || ''}`,
            { headers: { Authorization: `Bearer ${t}` } }
          )
        ).json();
        b.success && s(b.data);
      } catch {
        H.error('Ошибка загрузки');
      } finally {
        l(!1);
      }
    },
    u = m => {
      e(`/diagnostic/test/${m}`);
    },
    c = async () => {
      try {
        (
          await (
            await fetch('/api/diagnostic/plan/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
              body: JSON.stringify({ direction: n == null ? void 0 : n.desiredDirection }),
            })
          ).json()
        ).success && (H.success('План обучения создан!'), e('/learning-plan'));
      } catch {
        H.error('Ошибка генерации плана');
      }
    },
    d = m => {
      switch (m) {
        case 'BEGINNER':
          return 'text-red-400 bg-red-500/10 border-red-500/30';
        case 'INTERMEDIATE':
          return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
        case 'ADVANCED':
          return 'text-green-400 bg-green-500/10 border-green-500/30';
        default:
          return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
      }
    },
    f = m => {
      switch (m) {
        case 'BEGINNER':
          return 'Начальный';
        case 'INTERMEDIATE':
          return 'Средний';
        case 'ADVANCED':
          return 'Продвинутый';
        default:
          return m;
      }
    };
  return a
    ? o.jsx('div', {
        className: 'min-h-screen bg-gray-950 dark:bg-black flex items-center justify-center',
        children: o.jsxs('div', {
          className: 'relative',
          children: [
            o.jsx('div', {
              className:
                'w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin',
            }),
            o.jsx('div', {
              className:
                'absolute inset-0 w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin',
              style: { animationDirection: 'reverse', animationDuration: '0.8s' },
            }),
          ],
        }),
      })
    : o.jsxs('div', {
        className: 'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4',
        children: [
          o.jsx('div', {
            className:
              'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
          }),
          o.jsx('div', {
            className:
              'absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse',
          }),
          o.jsx('div', {
            className:
              'absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse',
            style: { animationDelay: '1s' },
          }),
          o.jsx('div', {
            className: 'relative z-10 max-w-4xl mx-auto',
            children: o.jsxs('div', {
              className:
                'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up',
              children: [
                o.jsx('h1', {
                  className:
                    'text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3',
                  children: 'Входная диагностика',
                }),
                o.jsx('p', {
                  className: 'text-gray-400 text-lg font-sans mb-8',
                  children:
                    'Пройдите тесты по предметам, чтобы определить ваш уровень и получить персональный план обучения',
                }),
                o.jsx('div', {
                  className: 'grid gap-6 md:grid-cols-2',
                  children:
                    r == null
                      ? void 0
                      : r.subjects.map((m, b) => {
                          const x = r.results.find(v => v.subject === m),
                            w = Wi[m] || m;
                          return o.jsxs(
                            'div',
                            {
                              className:
                                'group relative bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-scale-in',
                              style: { animationDelay: `${b * 100}ms` },
                              children: [
                                o.jsxs('div', {
                                  className: 'flex justify-between items-start mb-4',
                                  children: [
                                    o.jsx('h3', {
                                      className: 'font-display font-semibold text-xl text-white',
                                      children: w,
                                    }),
                                    x &&
                                      o.jsx('span', {
                                        className: `px-3 py-1.5 rounded-xl text-sm font-medium border font-sans ${d(x.level)}`,
                                        children: f(x.level),
                                      }),
                                  ],
                                }),
                                x
                                  ? o.jsxs('div', {
                                      className: 'space-y-3',
                                      children: [
                                        o.jsxs('div', {
                                          className: 'flex justify-between text-sm font-sans',
                                          children: [
                                            o.jsx('span', {
                                              className: 'text-gray-400',
                                              children: 'Результат:',
                                            }),
                                            o.jsxs('span', {
                                              className: 'font-medium text-white',
                                              children: [x.score, '%'],
                                            }),
                                          ],
                                        }),
                                        o.jsx('div', {
                                          className: 'w-full bg-gray-700 rounded-full h-2.5',
                                          children: o.jsx('div', {
                                            className: `h-2.5 rounded-full transition-all duration-1000 ${x.score >= 70 ? 'bg-gradient-to-r from-green-500 to-emerald-500' : x.score >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 'bg-gradient-to-r from-red-500 to-red-600'}`,
                                            style: { width: `${x.score}%` },
                                          }),
                                        }),
                                        o.jsx(te, {
                                          variant: 'outline',
                                          onClick: () => u(m),
                                          className: 'w-full mt-4',
                                          children: 'Пройти заново',
                                        }),
                                      ],
                                    })
                                  : o.jsx(te, {
                                      onClick: () => u(m),
                                      className: 'w-full',
                                      children: 'Начать тест',
                                    }),
                              ],
                            },
                            m
                          );
                        }),
                }),
                (r == null ? void 0 : r.completed) &&
                  o.jsxs('div', {
                    className:
                      'mt-8 p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl animate-scale-in',
                    children: [
                      o.jsx('h3', {
                        className: 'font-display font-semibold text-xl mb-2 text-white',
                        children: 'Диагностика завершена!',
                      }),
                      o.jsx('p', {
                        className: 'text-gray-400 font-sans mb-4',
                        children: 'Теперь вы можете получить персональный план обучения',
                      }),
                      o.jsx(te, { onClick: c, children: 'Создать план обучения' }),
                    ],
                  }),
                !(r != null && r.completed) &&
                  o.jsx('div', {
                    className:
                      'mt-8 p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl animate-scale-in',
                    children: o.jsxs('p', {
                      className: 'text-amber-400 font-sans',
                      children: [
                        'Пройдите все тесты, чтобы получить персональный план обучения. Осталось:',
                        ' ',
                        o.jsx('span', {
                          className: 'font-semibold',
                          children:
                            ((r == null ? void 0 : r.subjects.length) || 0) -
                            ((r == null ? void 0 : r.results.length) || 0),
                        }),
                        ' ',
                        'предметов',
                      ],
                    }),
                  }),
              ],
            }),
          }),
        ],
      });
}
function Dc() {
  const { testId: e, subject: t } = u0(),
    n = Qe(),
    { token: r } = pe(),
    [s, a] = y.useState(null),
    [l, i] = y.useState(0),
    [u, c] = y.useState([]),
    [d, f] = y.useState(null),
    [m, b] = y.useState(!0),
    [x, w] = y.useState(!1),
    [v, h] = y.useState(Date.now()),
    [p, g] = y.useState(null),
    j = y.useCallback(async () => {
      try {
        let z = '';
        if (t) {
          const Fe = await (
            await fetch(`/api/tests?subject=${t}&isDiagnostic=true`, {
              headers: { Authorization: `Bearer ${r}` },
            })
          ).json();
          if (Fe.data && Fe.data.length > 0) z = `/api/tests/${Fe.data[0].id}/start`;
          else {
            (H.error('Тест не найден'), n('/diagnostic'));
            return;
          }
        } else e && (z = `/api/tests/${e}/start`);
        const F = await (await fetch(z, { headers: { Authorization: `Bearer ${r}` } })).json();
        F.success
          ? (a(F.data), F.data.test.timeLimit && g(F.data.test.timeLimit * 60))
          : (H.error('Ошибка загрузки теста'), n(-1));
      } catch {
        (H.error('Ошибка загрузки'), n(-1));
      } finally {
        b(!1);
      }
    }, [e, t, r, n]);
  (y.useEffect(() => {
    j();
  }, [j]),
    y.useEffect(() => {
      if (p === null || p <= 0) return;
      const z = setInterval(() => {
        g(K => (K === null || K <= 1 ? (clearInterval(z), _(), 0) : K - 1));
      }, 1e3);
      return () => clearInterval(z);
    }, [p]));
  const k = z => {
      f(z);
    },
    A = () => {
      if (!s || d === null) return;
      const z = s.questions[l],
        K = Date.now() - v,
        F = { questionId: z.id, answer: d, timeSpent: K, timestamp: Date.now() };
      (c(Q => [...Q, F]),
        f(null),
        h(Date.now()),
        l < s.questions.length - 1 ? i(Q => Q + 1) : _([...u, F]));
    },
    _ = async z => {
      if (!s) return;
      w(!0);
      const K = z || u;
      try {
        const Q = await (
          await fetch(`/api/tests/${s.test.id}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${r}` },
            body: JSON.stringify({ answers: K, questionsOrder: s.questionsOrder }),
          })
        ).json();
        Q.success &&
          (t &&
            (await fetch('/api/diagnostic/submit', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${r}` },
              body: JSON.stringify({ subject: t, score: Q.data.score }),
            })),
          H.success(`Тест завершён! Результат: ${Q.data.score}%`),
          Q.data.analysis && H.error('Обнаружена подозрительная активность', { duration: 5e3 }),
          n(t ? '/diagnostic' : '/dashboard'));
      } catch {
        H.error('Ошибка отправки');
      } finally {
        w(!1);
      }
    },
    S = z => {
      const K = Math.floor(z / 60),
        F = z % 60;
      return `${K}:${F.toString().padStart(2, '0')}`;
    };
  if (m)
    return o.jsx('div', {
      className: 'min-h-screen flex items-center justify-center',
      children: o.jsx('div', {
        className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600',
      }),
    });
  if (!s) return null;
  const P = s.questions[l],
    R = ((l + 1) / s.questions.length) * 100;
  return o.jsx('div', {
    className: 'min-h-screen py-8 px-4 bg-gray-50',
    children: o.jsx('div', {
      className: 'max-w-3xl mx-auto',
      children: o.jsxs('div', {
        className: 'bg-white rounded-2xl shadow-xl p-8 border border-gray-100',
        children: [
          o.jsxs('div', {
            className: 'flex justify-between items-center mb-6',
            children: [
              o.jsx('h1', { className: 'text-xl font-bold text-gray-900', children: s.test.title }),
              p !== null &&
                o.jsx('div', {
                  className: `px-4 py-2 rounded-lg font-mono text-lg ${p < 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100'}`,
                  children: S(p),
                }),
            ],
          }),
          o.jsxs('div', {
            className: 'mb-6',
            children: [
              o.jsxs('div', {
                className: 'flex justify-between text-sm text-gray-600 mb-2',
                children: [
                  o.jsxs('span', { children: ['Вопрос ', l + 1, ' из ', s.questions.length] }),
                  o.jsxs('span', { children: [Math.round(R), '%'] }),
                ],
              }),
              o.jsx('div', {
                className: 'w-full bg-gray-200 rounded-full h-2',
                children: o.jsx('div', {
                  className: 'bg-blue-600 h-2 rounded-full transition-all',
                  style: { width: `${R}%` },
                }),
              }),
            ],
          }),
          o.jsxs('div', {
            className: 'mb-8',
            children: [
              o.jsx('h2', { className: 'text-lg font-medium mb-6', children: P.question }),
              P.options &&
                o.jsx('div', {
                  className: 'space-y-3',
                  children: P.options.map((z, K) =>
                    o.jsxs(
                      'button',
                      {
                        onClick: () => k(z),
                        className: `w-full p-4 text-left border-2 rounded-xl transition-all ${d === z ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`,
                        children: [
                          o.jsxs('span', {
                            className: 'font-medium mr-3',
                            children: [String.fromCharCode(65 + K), '.'],
                          }),
                          z,
                        ],
                      },
                      K
                    )
                  ),
                }),
            ],
          }),
          o.jsxs('div', {
            className: 'flex justify-between items-center pt-6 border-t',
            children: [
              s.test.preventBackNavigation
                ? o.jsx('span', {
                    className: 'text-sm text-gray-500',
                    children: 'Возврат к предыдущим вопросам запрещён',
                  })
                : o.jsx('div', {}),
              o.jsx(te, {
                onClick: A,
                disabled: d === null || x,
                children: x ? 'Отправка...' : l < s.questions.length - 1 ? 'Далее' : 'Завершить',
              }),
            ],
          }),
        ],
      }),
    }),
  });
}
const Yv = {
    RUSSIAN: '📖',
    MATHEMATICS: '🔢',
    PHYSICS: '⚛️',
    INFORMATICS: '💻',
    BIOLOGY: '🧬',
    HISTORY: '🏛️',
    ENGLISH: '🇬🇧',
  },
  Jv = {
    RUSSIAN: 'Проверьте свои знания русского языка',
    MATHEMATICS: 'Решите задачи по математике',
    PHYSICS: 'Проверьте понимание физических законов',
    INFORMATICS: 'Продемонстрируйте навыки программирования',
    BIOLOGY: 'Покажите знания в биологии',
    HISTORY: 'Проверьте знание истории',
    ENGLISH: 'Проверьте уровень английского языка',
  };
function Xv() {
  const { subject: e } = u0(),
    t = Qe(),
    [n, r] = y.useState(null),
    s = e ? Wi[e] : 'Неизвестный предмет',
    a = (e && Yv[e]) || '📝',
    l = (e && Jv[e]) || 'Тест по предмету',
    i = () => {
      !n ||
        !e ||
        (n === 9 && e === 'MATHEMATICS'
          ? t('/test/oge-ege', { state: { grade: n, subject: e } })
          : n === 11 && e === 'MATHEMATICS'
            ? t('/test/ege-type', { state: { grade: n, subject: e } })
            : t(`/test/${e.toLowerCase()}`, { state: { grade: n, subject: e } }));
    };
  return o.jsxs('div', {
    className: 'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4',
    children: [
      o.jsx('div', {
        className:
          'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
      }),
      o.jsx('div', {
        className:
          'absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse',
      }),
      o.jsx('div', {
        className:
          'absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse',
        style: { animationDelay: '1s' },
      }),
      o.jsxs('div', {
        className: 'relative z-10 max-w-4xl mx-auto',
        children: [
          o.jsxs('button', {
            onClick: () => t('/dashboard'),
            className:
              'group mb-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-sans',
            children: [
              o.jsx('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                fill: 'none',
                viewBox: '0 0 24 24',
                strokeWidth: 2,
                stroke: 'currentColor',
                className: 'w-5 h-5 transform group-hover:-translate-x-1 transition-transform',
                children: o.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
                }),
              }),
              'Назад к панели управления',
            ],
          }),
          o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.1)] animate-slide-up',
            children: [
              o.jsxs('div', {
                className: 'text-center mb-8',
                children: [
                  o.jsx('div', { className: 'text-7xl mb-4 animate-bounce', children: a }),
                  o.jsx('h1', {
                    className:
                      'text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3',
                    children: s,
                  }),
                  o.jsx('p', { className: 'text-gray-400 text-lg font-sans', children: l }),
                ],
              }),
              o.jsxs('div', {
                className: 'mb-8',
                children: [
                  o.jsxs('h2', {
                    className:
                      'text-2xl font-display font-semibold text-white mb-4 flex items-center',
                    children: [
                      o.jsx('span', {
                        className: 'w-2 h-2 bg-cyan-400 rounded-full mr-3 animate-pulse',
                      }),
                      'Выберите ваш класс',
                    ],
                  }),
                  o.jsx('p', {
                    className: 'text-gray-400 font-sans mb-6',
                    children: 'Мы подберем тест соответствующий вашему уровню',
                  }),
                  o.jsx('div', {
                    className: 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4',
                    children: N0.map((u, c) =>
                      o.jsxs(
                        'button',
                        {
                          onClick: () => r(u),
                          className: `
                    group relative p-6 rounded-2xl border-2 transition-all duration-300
                    animate-scale-in
                    ${n === u ? 'border-cyan-500 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-[0_0_30px_rgba(6,182,212,0.3)] scale-105' : 'border-gray-700 bg-gray-800/50 hover:border-cyan-500/50 hover:bg-gray-800/70'}
                  `,
                          style: { animationDelay: `${c * 50}ms` },
                          children: [
                            o.jsxs('div', {
                              className: 'text-center',
                              children: [
                                o.jsx('div', {
                                  className: `text-3xl font-display font-bold mb-2 transition-all duration-300 ${n === u ? 'text-cyan-400 scale-110' : 'text-white group-hover:text-cyan-400'}`,
                                  children: u,
                                }),
                                o.jsx('div', {
                                  className: `text-sm font-sans transition-colors ${n === u ? 'text-cyan-300' : 'text-gray-400 group-hover:text-gray-300'}`,
                                  children: 'класс',
                                }),
                              ],
                            }),
                            n === u &&
                              o.jsx('div', {
                                className:
                                  'absolute -top-2 -right-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full p-1.5 animate-scale-in',
                                children: o.jsx('svg', {
                                  xmlns: 'http://www.w3.org/2000/svg',
                                  fill: 'none',
                                  viewBox: '0 0 24 24',
                                  strokeWidth: 3,
                                  stroke: 'currentColor',
                                  className: 'w-4 h-4 text-white',
                                  children: o.jsx('path', {
                                    strokeLinecap: 'round',
                                    strokeLinejoin: 'round',
                                    d: 'M4.5 12.75l6 6 9-13.5',
                                  }),
                                }),
                              }),
                          ],
                        },
                        u
                      )
                    ),
                  }),
                ],
              }),
              n &&
                o.jsx('div', {
                  className:
                    'p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-2xl mb-6 animate-scale-in',
                  children: o.jsxs('div', {
                    className: 'flex items-start gap-4',
                    children: [
                      o.jsx('div', {
                        className: 'flex-shrink-0',
                        children: o.jsx('div', {
                          className:
                            'w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center',
                          children: o.jsx('svg', {
                            xmlns: 'http://www.w3.org/2000/svg',
                            fill: 'none',
                            viewBox: '0 0 24 24',
                            strokeWidth: 2,
                            stroke: 'currentColor',
                            className: 'w-6 h-6 text-white',
                            children: o.jsx('path', {
                              strokeLinecap: 'round',
                              strokeLinejoin: 'round',
                              d: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
                            }),
                          }),
                        }),
                      }),
                      o.jsxs('div', {
                        className: 'flex-1',
                        children: [
                          o.jsx('h3', {
                            className: 'font-display font-semibold text-white mb-2',
                            children:
                              n === 9
                                ? 'Вариант ОГЭ'
                                : n === 11
                                  ? 'Вариант ЕГЭ'
                                  : `Тест для ${n} класса`,
                          }),
                          o.jsxs('ul', {
                            className: 'text-sm text-gray-300 font-sans space-y-1',
                            children: [
                              o.jsxs('li', {
                                className: 'flex items-center gap-2',
                                children: [
                                  o.jsx('span', { className: 'text-cyan-400', children: '•' }),
                                  n === 9
                                    ? 'Решить вариант ОГЭ'
                                    : n === 11
                                      ? 'Решить вариант ЕГЭ'
                                      : `Задания соответствуют программе ${n} класса`,
                                ],
                              }),
                              o.jsxs('li', {
                                className: 'flex items-center gap-2',
                                children: [
                                  o.jsx('span', { className: 'text-cyan-400', children: '•' }),
                                  n === 9 || n === 11
                                    ? 'Полный экзаменационный вариант'
                                    : 'Примерно 10-15 вопросов',
                                ],
                              }),
                              o.jsxs('li', {
                                className: 'flex items-center gap-2',
                                children: [
                                  o.jsx('span', { className: 'text-cyan-400', children: '•' }),
                                  'Время на прохождение: ',
                                  n === 9 || n === 11 ? '3 часа 55 минут' : '30 минут',
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
              o.jsxs('div', {
                className: 'flex gap-4',
                children: [
                  o.jsx(te, {
                    variant: 'outline',
                    onClick: () => t('/dashboard'),
                    className: 'flex-1',
                    children: 'Отмена',
                  }),
                  o.jsx(te, {
                    onClick: i,
                    disabled: !n,
                    className: 'flex-1',
                    children: n ? 'Начать тест' : 'Выберите класс',
                  }),
                ],
              }),
            ],
          }),
          o.jsx('div', {
            className:
              'mt-6 p-4 bg-gray-900/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm animate-fade-in',
            style: { animationDelay: '200ms' },
            children: o.jsxs('div', {
              className: 'flex items-start gap-3',
              children: [
                o.jsx('svg', {
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  className: 'w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5',
                  children: o.jsx('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    d: 'M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
                  }),
                }),
                o.jsx('div', {
                  className: 'flex-1',
                  children: o.jsxs('p', {
                    className: 'text-sm text-gray-400 font-sans',
                    children: [
                      o.jsx('span', {
                        className: 'text-cyan-400 font-semibold',
                        children: 'Совет:',
                      }),
                      ' Выбирайте класс честно - это поможет нам точнее оценить ваш уровень и подготовить персональный план обучения',
                    ],
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
function Zv() {
  const e = Qe(),
    { token: t } = pe(),
    [n, r] = y.useState(null),
    [s, a] = y.useState(!0);
  y.useEffect(() => {
    l();
  }, []);
  const l = async () => {
      try {
        const f = await fetch('/api/diagnostic/plan', {
            headers: { Authorization: `Bearer ${t}` },
          }),
          m = await f.json();
        m.success ? r(m.data) : f.status === 404 && e('/diagnostic');
      } catch {
        H.error('Ошибка загрузки плана');
      } finally {
        a(!1);
      }
    },
    i = async f => {
      try {
        const b = await (
          await fetch('/api/diagnostic/plan/complete-topic', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({ itemId: f }),
          })
        ).json();
        b.success && (r(b.data), H.success('Тема отмечена как изученная'));
      } catch {
        H.error('Ошибка');
      }
    },
    u = f => {
      const m = {};
      for (const b of f) (m[b.subject] || (m[b.subject] = []), m[b.subject].push(b));
      return m;
    };
  if (s)
    return o.jsx('div', {
      className: 'min-h-screen flex items-center justify-center',
      children: o.jsx('div', {
        className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600',
      }),
    });
  if (!n)
    return o.jsx('div', {
      className: 'min-h-screen py-12 px-4',
      children: o.jsxs('div', {
        className: 'max-w-4xl mx-auto text-center',
        children: [
          o.jsx('h1', {
            className: 'text-2xl font-bold mb-4',
            children: 'План обучения не найден',
          }),
          o.jsx('p', {
            className: 'text-gray-600 mb-6',
            children: 'Сначала пройдите входную диагностику',
          }),
          o.jsx(te, { onClick: () => e('/diagnostic'), children: 'Пройти диагностику' }),
        ],
      }),
    });
  const c = n.totalHours > 0 ? Math.round((n.completedHours / n.totalHours) * 100) : 0,
    d = u(n.items);
  return o.jsx('div', {
    className: 'min-h-screen py-12 px-4 bg-gray-50',
    children: o.jsxs('div', {
      className: 'max-w-4xl mx-auto',
      children: [
        o.jsxs('div', {
          className: 'bg-white rounded-2xl shadow-xl p-8 border border-gray-100 mb-6',
          children: [
            o.jsx('h1', {
              className: 'text-3xl font-bold text-gray-900 mb-2',
              children: 'Персональный план обучения',
            }),
            o.jsx('p', {
              className: 'text-gray-600 mb-6',
              children: 'Следуйте плану для эффективной подготовки к поступлению',
            }),
            o.jsxs('div', {
              className: 'bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6',
              children: [
                o.jsxs('div', {
                  className: 'flex justify-between items-center mb-3',
                  children: [
                    o.jsx('span', { className: 'text-gray-700', children: 'Общий прогресс' }),
                    o.jsxs('span', { className: 'font-bold text-lg', children: [c, '%'] }),
                  ],
                }),
                o.jsx('div', {
                  className: 'w-full bg-white rounded-full h-4 shadow-inner',
                  children: o.jsx('div', {
                    className:
                      'bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all',
                    style: { width: `${c}%` },
                  }),
                }),
                o.jsxs('div', {
                  className: 'flex justify-between text-sm text-gray-600 mt-2',
                  children: [
                    o.jsxs('span', { children: ['Изучено: ', n.completedHours, ' ч'] }),
                    o.jsxs('span', { children: ['Всего: ', n.totalHours, ' ч'] }),
                  ],
                }),
              ],
            }),
          ],
        }),
        Object.entries(d).map(([f, m]) => {
          const b = Wi[f] || f,
            x = m.filter(v => v.completed).length,
            w = Math.round((x / m.length) * 100);
          return o.jsxs(
            'div',
            {
              className: 'bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-4',
              children: [
                o.jsxs('div', {
                  className: 'flex justify-between items-center mb-4',
                  children: [
                    o.jsx('h2', { className: 'text-xl font-bold', children: b }),
                    o.jsxs('span', {
                      className: 'text-sm text-gray-600',
                      children: [x, '/', m.length, ' тем (', w, '%)'],
                    }),
                  ],
                }),
                o.jsx('div', {
                  className: 'space-y-3',
                  children: m.map(v =>
                    o.jsxs(
                      'div',
                      {
                        className: `flex items-center justify-between p-4 rounded-xl border ${v.completed ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`,
                        children: [
                          o.jsxs('div', {
                            className: 'flex items-center gap-3',
                            children: [
                              o.jsx('button', {
                                onClick: () => !v.completed && i(v.id),
                                className: `w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${v.completed ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 hover:border-blue-500'}`,
                                disabled: v.completed,
                                children:
                                  v.completed &&
                                  o.jsx('svg', {
                                    className: 'w-4 h-4',
                                    fill: 'none',
                                    stroke: 'currentColor',
                                    viewBox: '0 0 24 24',
                                    children: o.jsx('path', {
                                      strokeLinecap: 'round',
                                      strokeLinejoin: 'round',
                                      strokeWidth: 2,
                                      d: 'M5 13l4 4L19 7',
                                    }),
                                  }),
                              }),
                              o.jsx('span', {
                                className: v.completed ? 'line-through text-gray-500' : '',
                                children: v.topic,
                              }),
                            ],
                          }),
                          o.jsxs('span', {
                            className: 'text-sm text-gray-500',
                            children: [v.estimatedHours, ' ч'],
                          }),
                        ],
                      },
                      v.id
                    )
                  ),
                }),
              ],
            },
            f
          );
        }),
      ],
    }),
  });
}
function e1() {
  const e = Qe(),
    t = en(),
    { grade: n, subject: r } = t.state || {};
  if (!n || !r)
    return o.jsx('div', {
      className: 'min-h-screen bg-gray-950 flex items-center justify-center',
      children: o.jsxs('div', {
        className: 'text-center',
        children: [
          o.jsx('p', {
            className: 'text-gray-400 font-sans mb-4',
            children: 'Ошибка: данные не переданы',
          }),
          o.jsx(te, { onClick: () => e('/dashboard'), children: 'Вернуться к панели' }),
        ],
      }),
    });
  const s = a => {
    e('/test/ege', { state: { grade: n, subject: r, egeType: a } });
  };
  return o.jsxs('div', {
    className: 'min-h-screen bg-gray-950 dark:bg-black relative overflow-hidden py-12 px-4',
    children: [
      o.jsx('div', {
        className:
          'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
      }),
      o.jsx('div', {
        className:
          'absolute top-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse',
      }),
      o.jsx('div', {
        className:
          'absolute bottom-20 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] animate-pulse',
        style: { animationDelay: '1s' },
      }),
      o.jsxs('div', {
        className: 'relative z-10 max-w-5xl mx-auto',
        children: [
          o.jsxs('button', {
            onClick: () => e(-1),
            className:
              'group mb-6 flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition-colors font-sans',
            children: [
              o.jsx('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                fill: 'none',
                viewBox: '0 0 24 24',
                strokeWidth: 2,
                stroke: 'currentColor',
                className: 'w-5 h-5 transform group-hover:-translate-x-1 transition-transform',
                children: o.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
                }),
              }),
              'Назад',
            ],
          }),
          o.jsxs('div', {
            className: 'text-center mb-12',
            children: [
              o.jsx('div', { className: 'text-7xl mb-4 animate-bounce', children: '🎯' }),
              o.jsx('h1', {
                className:
                  'text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent mb-3',
                children: 'Выберите уровень ЕГЭ',
              }),
              o.jsx('p', {
                className: 'text-gray-400 text-lg font-sans',
                children: 'Математика для 11 класса',
              }),
            ],
          }),
          o.jsxs('div', {
            className: 'grid md:grid-cols-2 gap-6',
            children: [
              o.jsxs('button', {
                onClick: () => s('profile'),
                className:
                  'group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-[0_0_50px_rgba(6,182,212,0.2)] hover:scale-105 animate-slide-up',
                children: [
                  o.jsx('div', {
                    className:
                      'absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform',
                    children: o.jsxs('svg', {
                      xmlns: 'http://www.w3.org/2000/svg',
                      fill: 'none',
                      viewBox: '0 0 24 24',
                      strokeWidth: 2,
                      stroke: 'currentColor',
                      className: 'w-6 h-6 text-white',
                      children: [
                        o.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          d: 'M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z',
                        }),
                        o.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          d: 'M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z',
                        }),
                      ],
                    }),
                  }),
                  o.jsxs('div', {
                    className: 'mb-6',
                    children: [
                      o.jsx('h2', {
                        className:
                          'text-3xl font-display font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent mb-2',
                        children: 'Профильный',
                      }),
                      o.jsx('p', {
                        className: 'text-gray-400 font-sans text-sm',
                        children: 'Для поступления на технические специальности',
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'space-y-3 mb-6',
                    children: [
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-orange-400 mt-1', children: '•' }),
                          o.jsx('span', { children: '19 заданий повышенной сложности' }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-orange-400 mt-1', children: '•' }),
                          o.jsx('span', { children: 'Задания с развёрнутым решением' }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-orange-400 mt-1', children: '•' }),
                          o.jsx('span', { children: 'Максимум 31 первичный балл' }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-orange-400 mt-1', children: '•' }),
                          o.jsx('span', { children: 'Время: 3 часа 55 минут' }),
                        ],
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className:
                      'flex items-center justify-center gap-2 text-orange-400 font-sans font-semibold group-hover:text-orange-300 transition-colors',
                    children: [
                      o.jsx('span', { children: 'Выбрать профильный' }),
                      o.jsx('svg', {
                        xmlns: 'http://www.w3.org/2000/svg',
                        fill: 'none',
                        viewBox: '0 0 24 24',
                        strokeWidth: 2,
                        stroke: 'currentColor',
                        className:
                          'w-5 h-5 transform group-hover:translate-x-1 transition-transform',
                        children: o.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          d: 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
                        }),
                      }),
                    ],
                  }),
                ],
              }),
              o.jsxs('button', {
                onClick: () => s('base'),
                className:
                  'group relative bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 hover:border-green-500/50 transition-all duration-300 hover:shadow-[0_0_50px_rgba(34,197,94,0.2)] hover:scale-105 animate-slide-up',
                style: { animationDelay: '100ms' },
                children: [
                  o.jsx('div', {
                    className:
                      'absolute top-6 right-6 w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform',
                    children: o.jsx('svg', {
                      xmlns: 'http://www.w3.org/2000/svg',
                      fill: 'none',
                      viewBox: '0 0 24 24',
                      strokeWidth: 2,
                      stroke: 'currentColor',
                      className: 'w-6 h-6 text-white',
                      children: o.jsx('path', {
                        strokeLinecap: 'round',
                        strokeLinejoin: 'round',
                        d: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5',
                      }),
                    }),
                  }),
                  o.jsxs('div', {
                    className: 'mb-6',
                    children: [
                      o.jsx('h2', {
                        className:
                          'text-3xl font-display font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-2',
                        children: 'Базовый',
                      }),
                      o.jsx('p', {
                        className: 'text-gray-400 font-sans text-sm',
                        children: 'Для получения аттестата',
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'space-y-3 mb-6',
                    children: [
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-green-400 mt-1', children: '•' }),
                          o.jsx('span', { children: '21 задание базового уровня' }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-green-400 mt-1', children: '•' }),
                          o.jsx('span', { children: 'Только краткие ответы' }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-green-400 mt-1', children: '•' }),
                          o.jsx('span', { children: 'Оценка по пятибалльной шкале' }),
                        ],
                      }),
                      o.jsxs('div', {
                        className: 'flex items-start gap-3 text-gray-300 font-sans text-sm',
                        children: [
                          o.jsx('span', { className: 'text-green-400 mt-1', children: '•' }),
                          o.jsx('span', { children: 'Время: 3 часа' }),
                        ],
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className:
                      'flex items-center justify-center gap-2 text-green-400 font-sans font-semibold group-hover:text-green-300 transition-colors',
                    children: [
                      o.jsx('span', { children: 'Выбрать базовый' }),
                      o.jsx('svg', {
                        xmlns: 'http://www.w3.org/2000/svg',
                        fill: 'none',
                        viewBox: '0 0 24 24',
                        strokeWidth: 2,
                        stroke: 'currentColor',
                        className:
                          'w-5 h-5 transform group-hover:translate-x-1 transition-transform',
                        children: o.jsx('path', {
                          strokeLinecap: 'round',
                          strokeLinejoin: 'round',
                          d: 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          o.jsx('div', {
            className:
              'mt-8 p-6 bg-gray-900/50 border border-gray-700/50 rounded-2xl backdrop-blur-sm animate-fade-in',
            style: { animationDelay: '200ms' },
            children: o.jsxs('div', {
              className: 'flex items-start gap-3',
              children: [
                o.jsx('svg', {
                  xmlns: 'http://www.w3.org/2000/svg',
                  fill: 'none',
                  viewBox: '0 0 24 24',
                  strokeWidth: 2,
                  stroke: 'currentColor',
                  className: 'w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5',
                  children: o.jsx('path', {
                    strokeLinecap: 'round',
                    strokeLinejoin: 'round',
                    d: 'M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z',
                  }),
                }),
                o.jsx('div', {
                  className: 'flex-1',
                  children: o.jsxs('p', {
                    className: 'text-sm text-gray-400 font-sans',
                    children: [
                      o.jsx('span', {
                        className: 'text-cyan-400 font-semibold',
                        children: 'Важно:',
                      }),
                      ' Профильный уровень необходим для поступления на технические, экономические и IT-специальности. Базовый уровень достаточен для получения аттестата и поступления на гуманитарные направления.',
                    ],
                  }),
                }),
              ],
            }),
          }),
        ],
      }),
    ],
  });
}
const Fl = {
    subject: 'MATHEMATICS',
    grade: 9,
    examType: 'OGE',
    duration: 235,
    tasks: [
      {
        number: 1,
        text: 'Найдите значение выражения: 6,3 - 8 : 2',
        type: 'short',
        correctAnswer: '2,3',
        points: 1,
        topic: 'Арифметика',
      },
      {
        number: 2,
        text: 'На координатной прямой отмечены числа a и b. Какое из следующих неравенств неверно?',
        type: 'choice',
        options: ['a - b < 0', 'ab < 0', 'a + b > 0', 'a² > b²'],
        correctAnswer: 'a + b > 0',
        points: 1,
        topic: 'Числа на координатной прямой',
      },
      {
        number: 3,
        text: `Значение какого из выражений является числом рациональным?

1) (√7 - 3)(√7 + 3)
2) √5 · √20
3) (√6 - 2)²
4) √48 : √3`,
        type: 'choice',
        options: ['1', '2', '3', '4'],
        correctAnswer: '1',
        points: 1,
        topic: 'Иррациональные числа',
      },
      {
        number: 4,
        text: `Решите уравнение: x² - 5x - 14 = 0

Если корней несколько, запишите их через точку с запятой в порядке возрастания.`,
        type: 'short',
        correctAnswer: '-2; 7',
        points: 1,
        topic: 'Квадратные уравнения',
      },
      {
        number: 5,
        text: `На рисунке изображены графики функций вида y = kx + b. Установите соответствие между графиками и знаками коэффициентов k и b.

ГРАФИКИ:
А) Прямая возрастает, пересекает ось Y выше 0
Б) Прямая убывает, пересекает ось Y ниже 0
В) Прямая возрастает, пересекает ось Y ниже 0

КОЭФФИЦИЕНТЫ:
1) k > 0, b > 0
2) k > 0, b < 0
3) k < 0, b < 0
4) k < 0, b > 0`,
        type: 'matching',
        correctAnswer: 'А-1, Б-3, В-2',
        points: 1,
        topic: 'Линейная функция',
      },
      {
        number: 6,
        text: `Дана арифметическая прогрессия: -4; -1; 2; 5; ...

Найдите сумму первых десяти её членов.`,
        type: 'short',
        correctAnswer: '95',
        points: 1,
        topic: 'Арифметическая прогрессия',
      },
      {
        number: 7,
        text: 'Найдите значение выражения (a⁵)³ : a¹² при a = 5',
        type: 'short',
        correctAnswer: '125',
        points: 1,
        topic: 'Степени',
      },
      {
        number: 8,
        text: 'На каком рисунке изображено множество решений неравенства x² - 4x - 5 ≤ 0?',
        type: 'choice',
        options: [
          'Отрезок [-1; 5]',
          'Отрезок [-5; 1]',
          'Два луча: (-∞; -1] и [5; +∞)',
          'Два луча: (-∞; -5] и [1; +∞)',
        ],
        correctAnswer: 'Отрезок [-1; 5]',
        points: 1,
        topic: 'Квадратные неравенства',
      },
      {
        number: 9,
        text: 'Турист идёт из одного города в другой, каждый день проходя больше, чем в предыдущий день, на одно и то же расстояние. Известно, что за первый день турист прошёл 10 километров. Определите, сколько километров прошёл турист за третий день, если весь путь он прошёл за 6 дней, а расстояние между городами составляет 120 километров.',
        type: 'short',
        correctAnswer: '20',
        points: 2,
        topic: 'Арифметическая прогрессия - задача',
      },
      {
        number: 10,
        text: 'Вероятность того, что новый электрический чайник прослужит больше года, равна 0,93. Вероятность того, что он прослужит больше двух лет, равна 0,82. Найдите вероятность того, что он прослужит меньше двух лет, но больше года.',
        type: 'short',
        correctAnswer: '0,11',
        points: 1,
        topic: 'Теория вероятностей',
      },
      {
        number: 11,
        text: 'На рисунке изображены графики функций y = 3 - x² и y = 2x. Вычислите абсциссу точки B.',
        type: 'short',
        correctAnswer: '3',
        points: 1,
        topic: 'Графики функций',
      },
      {
        number: 12,
        text: 'Площадь четырёхугольника можно вычислить по формуле S = (d₁ · d₂ · sin α)/2, где d₁ и d₂ — длины диагоналей четырёхугольника, α — угол между диагоналями. Пользуясь этой формулой, найдите длину диагонали d₂, если d₁ = 12, sin α = 1/3, а S = 12.',
        type: 'short',
        correctAnswer: '6',
        points: 1,
        topic: 'Формулы',
      },
      {
        number: 13,
        text: `Укажите решение неравенства:

5x - 7,5 ≥ 6x + 3,2`,
        type: 'choice',
        options: ['x ≥ -10,7', 'x ≤ -10,7', 'x ≥ 10,7', 'x ≤ 10,7'],
        correctAnswer: 'x ≤ -10,7',
        points: 1,
        topic: 'Неравенства',
      },
      {
        number: 14,
        text: 'В среднем из 2000 садовых насосов, поступивших в продажу, 12 подтекают. Найдите вероятность того, что один случайно выбранный для контроля насос не подтекает.',
        type: 'short',
        correctAnswer: '0,994',
        points: 1,
        topic: 'Теория вероятностей',
      },
      {
        number: 15,
        text: 'В треугольнике ABC угол C равен 90°, AC = 4, cos A = 0,8. Найдите AB.',
        type: 'short',
        correctAnswer: '5',
        points: 1,
        topic: 'Прямоугольный треугольник',
      },
      {
        number: 16,
        text: 'Радиус окружности, описанной около квадрата, равен 4√2. Найдите длину стороны этого квадрата.',
        type: 'short',
        correctAnswer: '8',
        points: 1,
        topic: 'Окружность и квадрат',
      },
      {
        number: 17,
        text: 'Площадь прямоугольной трапеции равна 120. Одно из оснований трапеции в два раза больше другого, а её высота равна 6. Найдите меньшее основание трапеции.',
        type: 'short',
        correctAnswer: '10',
        points: 1,
        topic: 'Трапеция',
      },
      {
        number: 18,
        text: 'На клетчатой бумаге с размером клетки 1×1 изображён угол. Найдите тангенс этого угла.',
        type: 'short',
        correctAnswer: '2',
        points: 1,
        topic: 'Тригонометрия на клетчатой бумаге',
      },
      {
        number: 19,
        text: `Какие из следующих утверждений верны?

1) Через точку, не лежащую на данной прямой, можно провести прямую, параллельную этой прямой
2) Если диагонали параллелограмма равны, то это прямоугольник
3) У любой трапеции боковые стороны равны`,
        type: 'multiple_choice',
        correctAnswer: '1, 2',
        points: 1,
        topic: 'Геометрические утверждения',
      },
      {
        number: 20,
        text: `Решите систему уравнений:

{
  y - x² = 6
  y + x = 6
}

Запишите решение в виде пары чисел (x; y). Если решений несколько, запишите их через точку с запятой.`,
        type: 'detailed',
        correctAnswer: '(0; 6); (-5; 31)',
        points: 2,
        topic: 'Системы уравнений',
        detailedSolution: !0,
      },
      {
        number: 21,
        text: 'Из пункта А в пункт В выехал автомобиль. Одновременно с ним из В в А выехал мотоциклист. Автомобиль прибыл в пункт В через 1 час 20 минут после встречи, а мотоциклист прибыл в А через 3 часа после встречи. Сколько времени потратил на путь из А в В автомобиль?',
        type: 'detailed',
        correctAnswer: '3 часа',
        points: 2,
        topic: 'Задачи на движение',
        detailedSolution: !0,
      },
      {
        number: 22,
        text: `Постройте график функции y = |x|·(x + 2) - 2x

Определите, при каких значениях m прямая y = m имеет с графиком ровно две общие точки.`,
        type: 'detailed',
        correctAnswer: 'm = 0 или m < -1',
        points: 2,
        topic: 'Построение и исследование графиков',
        detailedSolution: !0,
      },
      {
        number: 23,
        text: 'Биссектриса угла A параллелограмма ABCD пересекает сторону BC в точке K. Найдите периметр параллелограмма, если BK = 7, CK = 12.',
        type: 'detailed',
        correctAnswer: '50',
        points: 2,
        topic: 'Параллелограмм',
        detailedSolution: !0,
      },
      {
        number: 24,
        text: 'В прямоугольной трапеции ABCD с основаниями AD и BC угол BAD прямой. Окружность, построенная на боковой стороне AB как на диаметре, касается боковой стороны CD. Докажите, что треугольник BCD — равнобедренный.',
        type: 'proof',
        correctAnswer: '',
        points: 2,
        topic: 'Доказательство - окружность и трапеция',
        requiresProof: !0,
      },
      {
        number: 25,
        text: 'Середина M стороны AD выпуклого четырёхугольника ABCD равноудалена от всех его вершин. Найдите AD, если BC = 4, а углы B и C четырёхугольника равны соответственно 112° и 113°.',
        type: 'detailed',
        correctAnswer: '8',
        points: 2,
        topic: 'Четырёхугольник и окружность',
        detailedSolution: !0,
      },
    ],
  },
  np = {
    subject: 'MATHEMATICS',
    grade: 11,
    examType: 'EGE_PROFILE',
    duration: 235,
    tasks: [
      {
        number: 1,
        text: 'В пачке 500 листов бумаги формата А4. За неделю в офисе расходуется 1200 листов. Какого наименьшего количества пачек бумаги хватит на 4 недели?',
        type: 'short',
        correctAnswer: '10',
        points: 1,
        topic: 'Практические задачи',
      },
      {
        number: 2,
        text: `На рисунке жирными точками показана цена золота, установленная Центробанком РФ во все рабочие дни в октябре 2015 года. По горизонтали указываются числа месяца, по вертикали — цена золота в рублях за грамм. Для наглядности жирные точки на рисунке соединены линией.

Определите по рисунку наибольшую цену золота в период с 17 по 24 октября (в рублях за грамм).`,
        type: 'short',
        correctAnswer: '2520',
        points: 1,
        topic: 'Анализ графиков',
      },
      {
        number: 3,
        text: 'Найдите площадь треугольника, изображенного на клетчатой бумаге с размером клетки 1 см × 1 см. Ответ дайте в квадратных сантиметрах.',
        type: 'short',
        correctAnswer: '12',
        points: 1,
        topic: 'Планиметрия на клетчатой бумаге',
      },
      {
        number: 4,
        text: 'В случайном эксперименте симметричную монету бросают дважды. Найдите вероятность того, что решка выпадет ровно один раз.',
        type: 'short',
        correctAnswer: '0,5',
        points: 1,
        topic: 'Теория вероятностей',
      },
      {
        number: 5,
        text: 'Найдите корень уравнения: 5^(2x-3) = 125',
        type: 'short',
        correctAnswer: '3',
        points: 1,
        topic: 'Показательные уравнения',
      },
      {
        number: 6,
        text: 'В треугольнике ABC угол C равен 90°, AC = 6, sin A = 0,6. Найдите AB.',
        type: 'short',
        correctAnswer: '10',
        points: 1,
        topic: 'Прямоугольный треугольник',
      },
      {
        number: 7,
        text: `На рисунке изображён график функции y = f(x) и касательная к нему в точке с абсциссой x₀. Найдите значение производной функции f(x) в точке x₀.

(Касательная проходит через точки (2; 3) и (8; 6))`,
        type: 'short',
        correctAnswer: '0,5',
        points: 1,
        topic: 'Производная функции',
      },
      {
        number: 8,
        text: 'В правильной четырёхугольной призме ABCDA₁B₁C₁D₁ сторона основания равна 4, а боковое ребро равно 6. Найдите объём призмы.',
        type: 'short',
        correctAnswer: '96',
        points: 1,
        topic: 'Стереометрия - объёмы',
      },
      {
        number: 9,
        text: 'Найдите значение выражения: (√3 - √12)²',
        type: 'short',
        correctAnswer: '9',
        points: 1,
        topic: 'Преобразование выражений',
      },
      {
        number: 10,
        text: `Для получения на экране увеличенного изображения лампочки используется собирающая линза с фокусным расстоянием f = 30 см. Расстояние d₁ от линзы до лампочки может изменяться в пределах от 30 до 50 см, а расстояние d₂ от линзы до экрана — в пределах от 150 до 180 см.

Известно, что формула тонкой линзы: 1/f = 1/d₁ + 1/d₂. Найдите, на каком наименьшем расстоянии от линзы можно поместить лампочку, чтобы её изображение на экране было чётким. Ответ дайте в сантиметрах.`,
        type: 'short',
        correctAnswer: '36',
        points: 1,
        topic: 'Физические задачи',
      },
      {
        number: 11,
        text: 'Первый велосипедист выехал из посёлка по шоссе со скоростью 18 км/ч. Через час после него со скоростью 16 км/ч из того же посёлка в том же направлении выехал второй велосипедист, а ещё через час — третий. Найдите скорость третьего велосипедиста, если сначала он догнал второго, а через 9 часов после этого догнал первого. Ответ дайте в км/ч.',
        type: 'short',
        correctAnswer: '20',
        points: 1,
        topic: 'Задачи на движение',
      },
      {
        number: 12,
        text: 'Найдите наименьшее значение функции y = x³ - 3x² + 2 на отрезке [-1; 4]',
        type: 'short',
        correctAnswer: '-2',
        points: 1,
        topic: 'Исследование функций',
      },
      {
        number: 13,
        text: `а) Решите уравнение: 2sin²x - 3sinx - 2 = 0

б) Укажите корни этого уравнения, принадлежащие отрезку [3π/2; 3π]`,
        type: 'detailed',
        correctAnswer: `а) x = (-1)^(n+1) · π/6 + πn, n ∈ Z; x = π/2 + 2πk, k ∈ Z
б) 11π/6, 5π/2`,
        points: 2,
        topic: 'Тригонометрические уравнения',
      },
      {
        number: 14,
        text: `В правильной треугольной призме ABCA₁B₁C₁ все рёбра равны 6. Точка M — середина ребра CC₁.

а) Докажите, что прямые AM и BC₁ перпендикулярны.

б) Найдите расстояние между прямыми AM и BC₁.`,
        type: 'detailed',
        correctAnswer: `а) доказательство
б) 3√3`,
        points: 3,
        topic: 'Стереометрия',
      },
      {
        number: 15,
        text: `Решите неравенство:

log₂(x² - 5x + 6) ≥ log₂(2x - 6) + 1`,
        type: 'detailed',
        correctAnswer: 'x ∈ (3; 4]',
        points: 2,
        topic: 'Логарифмические неравенства',
      },
      {
        number: 16,
        text: `Окружность с центром O, вписанная в треугольник ABC, касается сторон AB, BC и CA в точках C₁, A₁ и B₁ соответственно.

а) Докажите, что углы OA₁C₁ и OB₁C₁ равны.

б) Найдите площадь треугольника A₁B₁C₁, если известно, что AB = 10, BC = 12, CA = 14.`,
        type: 'detailed',
        correctAnswer: `а) доказательство
б) 20`,
        points: 3,
        topic: 'Планиметрия',
      },
      {
        number: 17,
        text: `15-го января планируется взять кредит в банке на 24 месяца. Условия его возврата таковы:

— 1-го числа каждого месяца долг возрастает на 3% по сравнению с концом предыдущего месяца;
— со 2-го по 14-е число каждого месяца необходимо выплатить часть долга;
— 15-го числа каждого месяца долг должен быть на одну и ту же величину меньше долга на 15-е число предыдущего месяца.

Известно, что за первый месяц было выплачено 46,8 тыс. рублей. Какую сумму планируется взять в кредит? Ответ дайте в тысячах рублей.`,
        type: 'detailed',
        correctAnswer: '1200',
        points: 3,
        topic: 'Финансовая математика',
      },
      {
        number: 18,
        text: `Найдите все значения параметра a, при каждом из которых система уравнений

{
  x² + y² = 2
  (x - a)² + y² = 1
}

имеет ровно три различных решения.`,
        type: 'detailed',
        correctAnswer: 'a = ±1',
        points: 4,
        topic: 'Задачи с параметром',
      },
      {
        number: 19,
        text: `На доске написано 30 натуральных чисел (необязательно различных), каждое из которых либо чётное, либо его десятичная запись оканчивается на цифру 7. Сумма написанных чисел равна 810.

а) Может ли на доске быть ровно 24 чётных числа?

б) Может ли ровно одно число на доске оканчиваться на 7?

в) Какое наименьшее количество чисел, оканчивающихся на 7, может быть на доске?`,
        type: 'detailed',
        correctAnswer: `а) да
б) нет
в) 6`,
        points: 4,
        topic: 'Числа и их свойства',
      },
    ],
  },
  rp = {
    subject: 'MATHEMATICS',
    grade: 11,
    examType: 'EGE_BASE',
    duration: 180,
    tasks: [
      {
        number: 1,
        text: 'Больному прописано лекарство, которое нужно пить по 0,5 г 3 раза в день в течение 21 дня. В одной упаковке 10 таблеток лекарства по 0,5 г. Какого наименьшего количества упаковок хватит на весь курс лечения?',
        type: 'short',
        correctAnswer: '7',
        points: 1,
        topic: 'Практические задачи',
      },
      {
        number: 2,
        text: `Установите соответствие между величинами и их возможными значениями.

ВЕЛИЧИНЫ:
А) масса взрослого человека
Б) масса грузового автомобиля
В) масса новорождённого ребёнка
Г) масса дождевой капли

ЗНАЧЕНИЯ:
1) 20 мг
2) 3,5 кг
3) 80 кг
4) 7,5 т

Запишите ответ в виде: А-3, Б-4, В-2, Г-1`,
        type: 'short',
        correctAnswer: 'А-3, Б-4, В-2, Г-1',
        points: 1,
        topic: 'Соответствие величин',
      },
      {
        number: 3,
        text: 'На диаграмме показано распределение выплавки меди в 10 странах мира за 2006 год (в тысячах тонн). Среди представленных стран первое место по выплавке меди занимали США, десятое место — Казахстан. Какое место занимала Индонезия?',
        type: 'short',
        correctAnswer: '5',
        points: 1,
        topic: 'Анализ диаграмм',
      },
      {
        number: 4,
        text: 'В летнем лагере 218 детей и 26 воспитателей. В автобусе можно перевозить не более 45 пассажиров. Какое наименьшее количество автобусов потребуется, чтобы за один раз перевезти всех из лагеря в город?',
        type: 'short',
        correctAnswer: '6',
        points: 1,
        topic: 'Практические задачи',
      },
      {
        number: 5,
        text: 'Найдите значение выражения: (4,7 - 3,2) · 3,4',
        type: 'short',
        correctAnswer: '5,1',
        points: 1,
        topic: 'Арифметические вычисления',
      },
      {
        number: 6,
        text: `В магазине продаётся несколько видов творога в разных упаковках и по разной цене. Какую упаковку надо купить, чтобы цена за 1 кг творога была наименьшей?

1) 90 г за 23 р.
2) 200 г за 48 р.
3) 350 г за 88 р.
4) 400 г за 92 р.

В ответе укажите номер выбранного варианта.`,
        type: 'choice',
        options: ['1', '2', '3', '4'],
        correctAnswer: '4',
        points: 1,
        topic: 'Оптимальный выбор',
      },
      {
        number: 7,
        text: 'Найдите корень уравнения: 3x - 7 = 5x + 9',
        type: 'short',
        correctAnswer: '-8',
        points: 1,
        topic: 'Линейные уравнения',
      },
      {
        number: 8,
        text: 'Участок земли имеет прямоугольную форму. Стороны прямоугольника 25 м и 70 м. Найдите длину забора (в метрах), которым нужно огородить участок, если в заборе надо предусмотреть ворота шириной 4 м.',
        type: 'short',
        correctAnswer: '186',
        points: 1,
        topic: 'Геометрические задачи',
      },
      {
        number: 9,
        text: `Установите соответствие между величинами и их возможными значениями.

ВЕЛИЧИНЫ:
А) площадь почтовой марки
Б) площадь письменного стола
В) площадь города Санкт-Петербург
Г) площадь волейбольной площадки

ЗНАЧЕНИЯ:
1) 162 кв. м
2) 1,2 кв. м
3) 1439 кв. км
4) 4,5 кв. см

Запишите ответ в виде: А-4, Б-2, В-3, Г-1`,
        type: 'short',
        correctAnswer: 'А-4, Б-2, В-3, Г-1',
        points: 1,
        topic: 'Соответствие величин',
      },
      {
        number: 10,
        text: 'В случайном эксперименте бросают три игральные кости. Найдите вероятность того, что в сумме выпадет 6 очков. Результат округлите до сотых.',
        type: 'short',
        correctAnswer: '0,05',
        points: 1,
        topic: 'Теория вероятностей',
      },
      {
        number: 11,
        text: `На рисунке жирными точками показано суточное количество осадков, выпадавших в Томске с 8 по 24 января 2005 года. По горизонтали указываются числа месяца, по вертикали — количество осадков в миллиметрах. Для наглядности жирные точки соединены линией.

Определите по рисунку, какого числа за данный период выпало максимальное количество осадков.`,
        type: 'short',
        correctAnswer: '18',
        points: 1,
        topic: 'Анализ графиков',
      },
      {
        number: 12,
        text: 'В период распродажи магазин снижал цены дважды: в первый раз на 30%, во второй — на 50%. Сколько рублей стал стоить чайник после второго снижения цен, если до начала распродажи он стоил 1800 р.?',
        type: 'short',
        correctAnswer: '630',
        points: 1,
        topic: 'Проценты',
      },
      {
        number: 13,
        text: 'Найдите объём многогранника, вершинами которого являются вершины A, B, C, D, A₁, B₁ правильной шестиугольной призмы ABCDEF A₁B₁C₁D₁E₁F₁, площадь основания которой равна 6, а боковое ребро равно 3.',
        type: 'short',
        correctAnswer: '9',
        points: 1,
        topic: 'Стереометрия',
      },
      {
        number: 14,
        text: `На рисунке изображён график функции y = f(x). Числа a, b, c, d и e задают на оси Ox четыре интервала. Пользуясь графиком, поставьте в соответствие каждому интервалу характеристику функции.

ИНТЕРВАЛЫ:
А) (a; b)
Б) (b; c)
В) (c; d)
Г) (d; e)

ХАРАКТЕРИСТИКИ:
1) функция убывает
2) функция возрастает
3) функция положительна
4) функция отрицательна

Запишите ответ (например: А-2, Б-1, В-3, Г-4)`,
        type: 'short',
        correctAnswer: 'А-2, Б-1, В-2, Г-1',
        points: 1,
        topic: 'Графики функций',
      },
      {
        number: 15,
        text: 'В треугольнике ABC угол C равен 90°, AC = 15, AB = 17. Найдите sin A.',
        type: 'short',
        correctAnswer: '0,47',
        points: 1,
        topic: 'Тригонометрия',
      },
      {
        number: 16,
        text: 'Объём конуса равен 16. Через середину высоты конуса проведена плоскость, параллельная основанию. Найдите объём конуса, отсекаемого от данного конуса проведённой плоскостью.',
        type: 'short',
        correctAnswer: '2',
        points: 1,
        topic: 'Стереометрия - конус',
      },
      {
        number: 17,
        text: `Каждому из четырёх неравенств соответствует одно из решений. Установите соответствие.

НЕРАВЕНСТВА:
А) x² - 4 > 0
Б) x² - 4 < 0
В) (x + 2)(x - 2) ≥ 0
Г) (x + 2)(x - 2) ≤ 0

РЕШЕНИЯ:
1) [-2; 2]
2) (-2; 2)
3) (-∞; -2] ∪ [2; +∞)
4) (-∞; -2) ∪ (2; +∞)

Запишите ответ в виде: А-4, Б-2, В-3, Г-1`,
        type: 'short',
        correctAnswer: 'А-4, Б-2, В-3, Г-1',
        points: 1,
        topic: 'Неравенства',
      },
      {
        number: 18,
        text: 'Хозяин договорился с рабочими, что они копают колодец на следующих условиях: за первый метр он заплатит им 4200 рублей, а за каждый следующий метр — на 1300 рублей больше, чем за предыдущий. Сколько денег хозяин должен будет заплатить рабочим, если они выкопают колодец глубиной 9 метров? Ответ дайте в рублях.',
        type: 'short',
        correctAnswer: '84600',
        points: 1,
        topic: 'Арифметическая прогрессия',
      },
      {
        number: 19,
        text: 'Найдите трёхзначное число, кратное 25, все цифры которого различны, а сумма квадратов цифр делится на 3, но не делится на 9. В ответе укажите какое-нибудь одно такое число.',
        type: 'short',
        correctAnswer: '125',
        points: 1,
        topic: 'Числа и их свойства',
      },
      {
        number: 20,
        text: 'Кузнечик прыгает вдоль координатной прямой в любом направлении на единичный отрезок за прыжок. Кузнечик начинает прыгать из начала координат. Сколько существует различных точек на координатной прямой, в которых кузнечик может оказаться, совершив ровно 6 прыжков?',
        type: 'short',
        correctAnswer: '7',
        points: 1,
        topic: 'Логические задачи',
      },
      {
        number: 21,
        text: 'Список заданий викторины состоял из 25 вопросов. За каждый правильный ответ ученик получал 7 очков, за неправильный ответ с него списывали 10 очков, а при отсутствии ответа давали 0 очков. Сколько верных ответов дал ученик, набравший 42 очка, если известно, что по крайней мере один раз он ошибся?',
        type: 'short',
        correctAnswer: '12',
        points: 1,
        topic: 'Логические задачи',
      },
    ],
  };
function zc() {
  const e = Qe(),
    t = en(),
    { grade: n, subject: r, egeType: s } = t.state || {},
    l = n === 9 ? Fl : n === 11 && s === 'profile' ? np : n === 11 && s === 'base' ? rp : Fl,
    i = l.tasks,
    [u, c] = y.useState(0),
    [d, f] = y.useState({}),
    [m, b] = y.useState(l.duration * 60),
    [x, w] = y.useState(!1),
    [v, h] = y.useState(!1),
    [p, g] = y.useState(!1),
    j = i[u],
    k = ((u + 1) / i.length) * 100,
    A = Object.keys(d).filter(D => {
      var C;
      return (C = d[parseInt(D)]) == null ? void 0 : C.trim();
    }).length,
    _ = () =>
      n === 9
        ? 'ОГЭ Математика'
        : n === 11 && s === 'profile'
          ? 'ЕГЭ Математика (Профильный)'
          : n === 11 && s === 'base'
            ? 'ЕГЭ Математика (Базовый)'
            : 'Экзамен',
    S = () =>
      n === 9
        ? 'OGE'
        : n === 11 && s === 'profile'
          ? 'EGE_PROFILE'
          : n === 11 && s === 'base'
            ? 'EGE_BASE'
            : 'REGULAR';
  (y.useEffect(() => {
    if (!n || !r) return;
    const D = mn();
    p ||
      (D.startTest({
        examType: S(),
        subject: 'MATHEMATICS',
        grade: n,
        title: _(),
        startedAt: new Date().toISOString(),
        currentTaskIndex: 0,
        answeredCount: 0,
        totalTasks: i.length,
        timeLeftSeconds: l.duration * 60,
        route: '/test/oge-ege',
      }),
      g(!0));
  }, [n, r, p]),
    y.useEffect(() => {
      mn().updateProgress({ currentTaskIndex: u, answeredCount: A, timeLeftSeconds: m });
    }, [u, A, m]),
    y.useEffect(() => {
      const D = setInterval(() => {
        b(C => (C <= 1 ? (clearInterval(D), F(), 0) : C - 1));
      }, 1e3);
      return () => clearInterval(D);
    }, []));
  const P = D => {
      const C = Math.floor(D / 3600),
        M = Math.floor((D % 3600) / 60),
        O = D % 60;
      return `${C}:${M.toString().padStart(2, '0')}:${O.toString().padStart(2, '0')}`;
    },
    R = D => {
      f(C => ({ ...C, [j.number]: D }));
    },
    z = () => {
      u < i.length - 1 && c(D => D + 1);
    },
    K = () => {
      u > 0 && c(D => D - 1);
    },
    F = y.useCallback(() => {
      (mn().completeTest(), w(!0), H.success('Тест завершен!'));
    }, []),
    Q = () => {
      h(!0);
    },
    Fe = () => {
      (mn().abandonTest(), H('Тест прерван', { icon: '⚠️' }), e('/dashboard'));
    },
    ue = () => {
      const D = l.duration * 60;
      return m > D * 0.5 ? 'text-cyan-400' : m > D * 0.25 ? 'text-yellow-400' : 'text-red-400';
    };
  if (!n || !r)
    return o.jsx('div', {
      className: 'min-h-screen bg-gray-950 flex items-center justify-center',
      children: o.jsxs('div', {
        className: 'text-center',
        children: [
          o.jsx('p', {
            className: 'text-gray-400 font-sans mb-4',
            children: 'Ошибка загрузки теста',
          }),
          o.jsx(te, { onClick: () => e('/dashboard'), children: 'Вернуться к панели' }),
        ],
      }),
    });
  if (x) {
    const D = Object.entries(d).filter(([O, T]) => {
        var I;
        return (
          ((I = i.find(U => U.number === parseInt(O))) == null ? void 0 : I.correctAnswer) === T
        );
      }).length,
      C = Object.entries(d).reduce((O, [T, I]) => {
        const U = i.find(Z => Z.number === parseInt(T));
        return U && U.correctAnswer === I ? O + U.points : O;
      }, 0),
      M = i.reduce((O, T) => O + T.points, 0);
    return o.jsxs('div', {
      className: 'min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4',
      children: [
        o.jsx('div', {
          className:
            'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
        }),
        o.jsx('div', {
          className: 'relative z-10 max-w-3xl mx-auto',
          children: o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center animate-scale-in',
            children: [
              o.jsx('div', { className: 'text-6xl mb-6', children: '🎉' }),
              o.jsx('h1', {
                className:
                  'text-4xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-4',
                children: 'Тест завершен!',
              }),
              o.jsxs('div', {
                className: 'space-y-2 mb-8',
                children: [
                  o.jsxs('p', {
                    className: 'text-xl text-gray-300 font-sans',
                    children: [
                      'Правильных ответов: ',
                      o.jsx('span', { className: 'font-bold text-cyan-400', children: D }),
                      ' из ',
                      i.length,
                    ],
                  }),
                  o.jsxs('p', {
                    className: 'text-lg text-gray-400 font-sans',
                    children: [
                      'Первичных баллов: ',
                      o.jsx('span', { className: 'font-bold text-purple-400', children: C }),
                      ' из ',
                      M,
                    ],
                  }),
                ],
              }),
              o.jsxs('div', {
                className: 'flex gap-4 justify-center',
                children: [
                  o.jsx(te, { onClick: () => e('/dashboard'), children: 'К панели управления' }),
                  o.jsx(te, {
                    variant: 'outline',
                    onClick: () => window.location.reload(),
                    children: 'Пройти заново',
                  }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  }
  return o.jsxs('div', {
    className: 'min-h-screen bg-gray-950 relative overflow-hidden',
    children: [
      o.jsx('div', {
        className:
          'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
      }),
      o.jsx('div', {
        className: 'sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50',
        children: o.jsxs('div', {
          className: 'max-w-7xl mx-auto px-4 py-4',
          children: [
            o.jsxs('div', {
              className: 'flex items-center justify-between',
              children: [
                o.jsxs('div', {
                  className: 'flex items-center gap-4',
                  children: [
                    o.jsx('div', {
                      className:
                        'text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent',
                      children: _(),
                    }),
                    o.jsxs('div', {
                      className: 'text-sm text-gray-400 font-sans',
                      children: [n, ' класс'],
                    }),
                  ],
                }),
                o.jsxs('div', {
                  className: 'flex items-center gap-6',
                  children: [
                    o.jsxs('div', {
                      className: 'flex items-center gap-2',
                      children: [
                        o.jsx('svg', {
                          xmlns: 'http://www.w3.org/2000/svg',
                          fill: 'none',
                          viewBox: '0 0 24 24',
                          strokeWidth: 2,
                          stroke: 'currentColor',
                          className: `w-5 h-5 ${ue()}`,
                          children: o.jsx('path', {
                            strokeLinecap: 'round',
                            strokeLinejoin: 'round',
                            d: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
                          }),
                        }),
                        o.jsx('span', {
                          className: `font-mono text-lg font-semibold ${ue()}`,
                          children: P(m),
                        }),
                      ],
                    }),
                    o.jsxs('div', {
                      className: 'text-sm font-sans text-gray-400',
                      children: [
                        o.jsx('span', { className: 'text-cyan-400 font-semibold', children: A }),
                        ' / ',
                        i.length,
                        ' отвечено',
                      ],
                    }),
                    o.jsx('button', {
                      onClick: Q,
                      className:
                        'px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-colors text-sm font-medium',
                      children: 'Выйти',
                    }),
                  ],
                }),
              ],
            }),
            o.jsx('div', {
              className: 'mt-3 w-full bg-gray-700 rounded-full h-2',
              children: o.jsx('div', {
                className:
                  'h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300',
                style: { width: `${k}%` },
              }),
            }),
          ],
        }),
      }),
      o.jsxs('div', {
        className: 'relative z-10 max-w-4xl mx-auto px-4 py-8',
        children: [
          o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 animate-fade-in',
            children: [
              o.jsx('div', {
                className: 'flex items-start justify-between mb-6',
                children: o.jsxs('div', {
                  children: [
                    o.jsxs('div', {
                      className: 'flex items-center gap-3 mb-2',
                      children: [
                        o.jsxs('span', {
                          className:
                            'px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-display font-semibold',
                          children: ['Задание ', j.number],
                        }),
                        o.jsxs('span', {
                          className: 'text-sm text-gray-400 font-sans',
                          children: [
                            j.points,
                            ' ',
                            j.points === 1 ? 'балл' : j.points < 5 ? 'балла' : 'баллов',
                          ],
                        }),
                      ],
                    }),
                    o.jsx('div', {
                      className: 'text-sm text-gray-500 font-sans',
                      children: j.topic,
                    }),
                  ],
                }),
              }),
              o.jsx('div', {
                className: 'mb-8 p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50',
                children: o.jsx('p', {
                  className: 'text-lg text-gray-200 font-sans whitespace-pre-line leading-relaxed',
                  children: j.text,
                }),
              }),
              o.jsxs('div', {
                className: 'mb-8',
                children: [
                  j.type === 'choice' &&
                    j.options &&
                    o.jsx('div', {
                      className: 'space-y-3',
                      children: j.options.map((D, C) =>
                        o.jsx(
                          'button',
                          {
                            onClick: () => R(D),
                            className: `w-full p-4 rounded-xl border-2 text-left transition-all duration-200 ${d[j.number] === D ? 'border-cyan-500 bg-cyan-500/10 text-white' : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800/50'}`,
                            children: o.jsx('span', { className: 'font-sans', children: D }),
                          },
                          C
                        )
                      ),
                    }),
                  j.type === 'short' &&
                    o.jsxs('div', {
                      children: [
                        o.jsx('label', {
                          className: 'block text-sm font-sans text-gray-400 mb-2',
                          children: 'Введите ответ:',
                        }),
                        o.jsx('input', {
                          type: 'text',
                          value: d[j.number] || '',
                          onChange: D => R(D.target.value),
                          placeholder: 'Ваш ответ',
                          className:
                            'w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all font-sans',
                        }),
                      ],
                    }),
                  (j.type === 'detailed' || j.type === 'proof') &&
                    o.jsxs('div', {
                      children: [
                        o.jsx('label', {
                          className: 'block text-sm font-sans text-gray-400 mb-2',
                          children:
                            j.type === 'proof' ? 'Напишите доказательство:' : 'Подробное решение:',
                        }),
                        o.jsx('textarea', {
                          value: d[j.number] || '',
                          onChange: D => R(D.target.value),
                          placeholder:
                            j.type === 'proof' ? 'Опишите доказательство...' : 'Опишите решение...',
                          rows: 8,
                          className:
                            'w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all resize-vertical font-sans',
                        }),
                      ],
                    }),
                ],
              }),
              o.jsxs('div', {
                className: 'flex items-center justify-between pt-6 border-t border-gray-700/50',
                children: [
                  o.jsx(te, {
                    variant: 'outline',
                    onClick: K,
                    disabled: u === 0,
                    children: '← Предыдущее',
                  }),
                  o.jsx('div', {
                    className: 'flex gap-3',
                    children:
                      u === i.length - 1
                        ? o.jsx(te, { onClick: F, children: 'Завершить тест' })
                        : o.jsx(te, { onClick: z, children: 'Следующее →' }),
                  }),
                ],
              }),
            ],
          }),
          o.jsxs('div', {
            className:
              'mt-6 bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6',
            children: [
              o.jsx('h3', {
                className: 'text-sm font-sans text-gray-400 mb-3',
                children: 'Быстрая навигация:',
              }),
              o.jsx('div', {
                className: 'grid grid-cols-5 sm:grid-cols-10 gap-2',
                children: i.map((D, C) =>
                  o.jsx(
                    'button',
                    {
                      onClick: () => c(C),
                      className: `aspect-square rounded-lg font-display font-semibold text-sm transition-all ${u === C ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white scale-110' : d[D.number] ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400' : 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-cyan-500/50'}`,
                      children: D.number,
                    },
                    D.number
                  )
                ),
              }),
            ],
          }),
        ],
      }),
      v &&
        o.jsx('div', {
          className: 'fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4',
          children: o.jsxs('div', {
            className:
              'bg-gray-800 rounded-2xl p-6 max-w-md w-full border border-gray-700 animate-scale-in',
            children: [
              o.jsx('h4', {
                className: 'text-xl font-semibold text-white mb-3',
                children: 'Выйти из теста?',
              }),
              o.jsxs('p', {
                className: 'text-gray-400 mb-2',
                children: [
                  'Вы ответили на ',
                  o.jsx('span', { className: 'text-cyan-400 font-semibold', children: A }),
                  ' из ',
                  o.jsx('span', { className: 'text-white', children: i.length }),
                  ' вопросов.',
                ],
              }),
              o.jsx('p', {
                className: 'text-gray-400 mb-6',
                children: 'Вы можете вернуться и продолжить позже или завершить тест сейчас.',
              }),
              o.jsxs('div', {
                className: 'flex flex-col gap-3',
                children: [
                  o.jsx('button', {
                    onClick: () => h(!1),
                    className:
                      'w-full px-4 py-3 bg-cyan-500 text-white font-medium rounded-xl hover:bg-cyan-600 transition-all',
                    children: 'Продолжить тест',
                  }),
                  o.jsx('button', {
                    onClick: F,
                    className:
                      'w-full px-4 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-all',
                    children: 'Завершить и сохранить результат',
                  }),
                  o.jsx('button', {
                    onClick: Fe,
                    className:
                      'w-full px-4 py-3 bg-gray-700 text-gray-300 font-medium rounded-xl hover:bg-gray-600 transition-all',
                    children: 'Выйти без сохранения',
                  }),
                ],
              }),
            ],
          }),
        }),
    ],
  });
}
const xe = [];
for (let e = 0; e < 256; ++e) xe.push((e + 256).toString(16).slice(1));
function t1(e, t = 0) {
  return (
    xe[e[t + 0]] +
    xe[e[t + 1]] +
    xe[e[t + 2]] +
    xe[e[t + 3]] +
    '-' +
    xe[e[t + 4]] +
    xe[e[t + 5]] +
    '-' +
    xe[e[t + 6]] +
    xe[e[t + 7]] +
    '-' +
    xe[e[t + 8]] +
    xe[e[t + 9]] +
    '-' +
    xe[e[t + 10]] +
    xe[e[t + 11]] +
    xe[e[t + 12]] +
    xe[e[t + 13]] +
    xe[e[t + 14]] +
    xe[e[t + 15]]
  ).toLowerCase();
}
let Lo;
const n1 = new Uint8Array(16);
function r1() {
  if (!Lo) {
    if (typeof crypto > 'u' || !crypto.getRandomValues)
      throw new Error(
        'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
      );
    Lo = crypto.getRandomValues.bind(crypto);
  }
  return Lo(n1);
}
const s1 = typeof crypto < 'u' && crypto.randomUUID && crypto.randomUUID.bind(crypto),
  $c = { randomUUID: s1 };
function a1(e, t, n) {
  var s;
  e = e || {};
  const r = e.random ?? ((s = e.rng) == null ? void 0 : s.call(e)) ?? r1();
  if (r.length < 16) throw new Error('Random bytes length must be >= 16');
  return ((r[6] = (r[6] & 15) | 64), (r[8] = (r[8] & 63) | 128), t1(r));
}
function qi(e, t, n) {
  return $c.randomUUID && !e ? $c.randomUUID() : a1(e);
}
class Yi {
  trimWhitespace(t) {
    return t.trim().replace(/\s+/g, ' ');
  }
  toLowerCase(t) {
    return t.toLowerCase();
  }
}
class o1 extends Yi {
  validate(t, n) {
    const r = this.normalize(t),
      s = this.normalize(n);
    if (r === s) return !0;
    const a = this.parseNumber(r),
      l = this.parseNumber(s);
    return a !== null && l !== null ? Math.abs(a - l) < 1e-4 : !1;
  }
  normalize(t) {
    return this.trimWhitespace(t).replace(/,/g, '.').replace(/\s/g, '');
  }
  parseNumber(t) {
    const n = parseFloat(t);
    return isNaN(n) ? null : n;
  }
}
class l1 extends Yi {
  validate(t, n) {
    const r = this.normalize(t),
      s = this.normalize(n);
    return r === s;
  }
  normalize(t) {
    return this.trimWhitespace(t);
  }
}
class i1 extends Yi {
  validate(t, n) {
    return !1;
  }
  normalize(t) {
    return this.trimWhitespace(t);
  }
  hasAnswer(t) {
    return this.normalize(t).length > 0;
  }
  getWordCount(t) {
    return this.normalize(t).split(/\s+/).length;
  }
}
class ka {
  constructor(t) {
    $(this, 'id');
    $(this, 'number');
    $(this, 'text');
    $(this, 'type');
    $(this, 'options');
    $(this, 'correctAnswer');
    $(this, 'points');
    $(this, 'topic');
    $(this, 'requiresDetailedSolution');
    $(this, 'requiresProof');
    $(this, 'validationStrategy');
    ((this.id = qi()),
      (this.number = t.number),
      (this.text = t.text),
      (this.type = t.type),
      (this.options = t.options ?? null),
      (this.correctAnswer = t.correctAnswer),
      (this.points = t.points),
      (this.topic = t.topic),
      (this.requiresDetailedSolution = t.detailedSolution ?? !1),
      (this.requiresProof = t.requiresProof ?? !1),
      (this.validationStrategy = this.createValidationStrategy()));
  }
  createValidationStrategy() {
    switch (this.type) {
      case 'choice':
      case 'multiple_choice':
        return new l1();
      case 'detailed':
      case 'proof':
        return new i1();
      case 'short':
      case 'matching':
      default:
        return new o1();
    }
  }
  validate(t) {
    if (this.requiresDetailedSolution || this.requiresProof)
      return {
        isCorrect: !1,
        earnedPoints: 0,
        maxPoints: this.points,
        feedback: 'Требуется проверка преподавателем',
      };
    const n = this.validationStrategy.validate(t, this.correctAnswer);
    return {
      isCorrect: n,
      earnedPoints: n ? this.points : 0,
      maxPoints: this.points,
      feedback: n ? 'Правильно!' : `Правильный ответ: ${this.correctAnswer}`,
    };
  }
  getDisplayText() {
    return this.text.replace(
      /\\n/g,
      `
`
    );
  }
  isChoiceType() {
    return this.type === 'choice' || this.type === 'multiple_choice';
  }
  requiresTextInput() {
    return this.type === 'short' || this.type === 'matching';
  }
  requiresLongAnswer() {
    return this.type === 'detailed' || this.type === 'proof';
  }
  clone() {
    return new ka({
      number: this.number,
      text: this.text,
      type: this.type,
      options: this.options ? [...this.options] : void 0,
      correctAnswer: this.correctAnswer,
      points: this.points,
      topic: this.topic,
      detailedSolution: this.requiresDetailedSolution,
      requiresProof: this.requiresProof,
    });
  }
  toDTO() {
    return {
      number: this.number,
      text: this.text,
      type: this.type,
      options: this.options ?? void 0,
      correctAnswer: this.correctAnswer,
      points: this.points,
      topic: this.topic,
      detailedSolution: this.requiresDetailedSolution,
      requiresProof: this.requiresProof,
    };
  }
  static fromDTO(t) {
    return new ka(t);
  }
}
class Ja {
  constructor(t) {
    $(this, 'id');
    $(this, 'subject');
    $(this, 'grade');
    $(this, 'examType');
    $(this, 'duration');
    $(this, 'tasks');
    ((this.id = qi()),
      (this.subject = t.subject),
      (this.grade = t.grade),
      (this.examType = t.examType),
      (this.duration = t.duration),
      (this.tasks = t.tasks.map(n => new ka(n))));
  }
  get title() {
    const t = fs[this.examType],
      n = tp[this.subject];
    return `${t.title} ${n}`;
  }
  get maxPoints() {
    return this.tasks.reduce((t, n) => t + n.points, 0);
  }
  getTask(t) {
    return this.tasks.find(n => n.number === t);
  }
  getTaskCount() {
    return this.tasks.length;
  }
  getDurationInSeconds() {
    return this.duration * 60;
  }
  getFormattedDuration() {
    const t = Math.floor(this.duration / 60),
      n = this.duration % 60;
    return t > 0 && n > 0 ? `${t} ч ${n} мин` : t > 0 ? `${t} ч` : `${n} мин`;
  }
  getTasksByTopic(t) {
    return this.tasks.filter(n => n.topic === t);
  }
  getTopics() {
    return [...new Set(this.tasks.map(t => t.topic))];
  }
}
class u1 extends Ja {
  constructor(t) {
    super({ ...t, examType: 'OGE', duration: fs.OGE.duration });
  }
  getDescription() {
    return `Основной государственный экзамен по математике для 9 класса.
            Включает ${this.getTaskCount()} заданий.
            Максимум ${this.maxPoints} баллов.`;
  }
}
class c1 extends Ja {
  constructor(t) {
    super({ ...t, examType: 'EGE_PROFILE', duration: fs.EGE_PROFILE.duration });
  }
  getDescription() {
    return `Единый государственный экзамен по математике профильного уровня.
            Включает ${this.getTaskCount()} заданий повышенной сложности.
            Максимум ${this.maxPoints} первичных баллов.`;
  }
  getFirstPartTasks() {
    return this.tasks.filter(t => t.number <= 12);
  }
  getSecondPartTasks() {
    return this.tasks.filter(t => t.number > 12);
  }
}
class d1 extends Ja {
  constructor(t) {
    super({ ...t, examType: 'EGE_BASE', duration: fs.EGE_BASE.duration });
  }
  getDescription() {
    return `Единый государственный экзамен по математике базового уровня.
            Включает ${this.getTaskCount()} заданий.
            Оценивается по пятибалльной шкале.`;
  }
  convertToGrade(t) {
    return t >= 17 ? 5 : t >= 12 ? 4 : t >= 7 ? 3 : 2;
  }
}
class f1 extends Ja {
  constructor(t) {
    super({ ...t, examType: 'REGULAR', duration: t.duration || fs.REGULAR.duration });
  }
  getDescription() {
    return `Тренировочный тест по ${tp[this.subject]} для ${this.grade} класса.
            Включает ${this.getTaskCount()} заданий.`;
  }
}
class Ji {
  constructor(t) {
    $(this, 'id');
    $(this, 'exam');
    $(this, 'startedAt');
    $(this, 'status');
    $(this, 'currentTaskIndex', 0);
    $(this, 'answers', new Map());
    $(this, 'pausedAt', null);
    $(this, 'totalPausedTime', 0);
    ((this.id = qi()),
      (this.exam = t),
      (this.startedAt = new Date()),
      (this.status = 'in_progress'));
  }
  getCurrentTask() {
    return this.exam.tasks[this.currentTaskIndex];
  }
  setCurrentTaskIndex(t) {
    t >= 0 && t < this.exam.tasks.length && (this.currentTaskIndex = t);
  }
  getCurrentTaskIndex() {
    return this.currentTaskIndex;
  }
  nextTask() {
    return this.currentTaskIndex < this.exam.tasks.length - 1 ? (this.currentTaskIndex++, !0) : !1;
  }
  previousTask() {
    return this.currentTaskIndex > 0 ? (this.currentTaskIndex--, !0) : !1;
  }
  goToTask(t) {
    const n = this.exam.tasks.findIndex(r => r.number === t);
    return n !== -1 ? ((this.currentTaskIndex = n), !0) : !1;
  }
  submitAnswer(t, n) {
    this.answers.set(t, {
      taskNumber: t,
      value: n,
      timestamp: new Date(),
      status: n.trim() ? 'answered' : 'skipped',
    });
  }
  getAnswer(t) {
    return this.answers.get(t);
  }
  getAllAnswers() {
    return new Map(this.answers);
  }
  skipTask(t) {
    const n = this.answers.get(t);
    this.answers.set(t, {
      taskNumber: t,
      value: (n == null ? void 0 : n.value) || '',
      timestamp: new Date(),
      status: 'skipped',
    });
  }
  flagTask(t) {
    const n = this.answers.get(t);
    n
      ? (n.status = n.status === 'flagged' ? 'answered' : 'flagged')
      : this.answers.set(t, { taskNumber: t, value: '', timestamp: new Date(), status: 'flagged' });
  }
  getProgress() {
    return Math.round((this.getAnsweredCount() / this.exam.tasks.length) * 100);
  }
  getAnsweredCount() {
    return Array.from(this.answers.values()).filter(
      t => t.status === 'answered' || t.status === 'flagged'
    ).length;
  }
  getSkippedCount() {
    return Array.from(this.answers.values()).filter(t => t.status === 'skipped').length;
  }
  getFlaggedCount() {
    return Array.from(this.answers.values()).filter(t => t.status === 'flagged').length;
  }
  getUnansweredTasks() {
    return this.exam.tasks.filter(t => {
      const n = this.answers.get(t.number);
      return !n || n.status === 'unanswered' || !n.value.trim();
    });
  }
  pause() {
    this.status === 'in_progress' && ((this.status = 'paused'), (this.pausedAt = new Date()));
  }
  resume() {
    this.status === 'paused' &&
      this.pausedAt &&
      ((this.status = 'in_progress'),
      (this.totalPausedTime += Date.now() - this.pausedAt.getTime()),
      (this.pausedAt = null));
  }
  complete() {
    this.status = 'completed';
    let t = 0,
      n = 0;
    this.exam.tasks.forEach(s => {
      const a = this.answers.get(s.number);
      if (a && a.value) {
        const l = s.validate(a.value);
        l.isCorrect && (t++, (n += l.earnedPoints));
      }
    });
    const r = this.calculateTimeSpent();
    return {
      totalTasks: this.exam.tasks.length,
      answeredTasks: this.getAnsweredCount(),
      correctAnswers: t,
      earnedPoints: n,
      maxPoints: this.exam.maxPoints,
      percentageScore: Math.round((n / this.exam.maxPoints) * 100),
      timeSpent: r,
      completedAt: new Date(),
    };
  }
  expireTime() {
    return ((this.status = 'time_expired'), this.complete());
  }
  calculateTimeSpent() {
    const r = Date.now() - this.startedAt.getTime() - this.totalPausedTime;
    return Math.floor(r / 1e3);
  }
  getTimeSpent() {
    return this.calculateTimeSpent();
  }
  isCurrentTask(t) {
    const n = this.getCurrentTask();
    return (n == null ? void 0 : n.number) === t;
  }
  isTaskAnswered(t) {
    const n = this.answers.get(t);
    return !!n && !!n.value.trim();
  }
  isFirstTask() {
    return this.currentTaskIndex === 0;
  }
  isLastTask() {
    return this.currentTaskIndex === this.exam.tasks.length - 1;
  }
  serialize() {
    return JSON.stringify({
      id: this.id,
      examId: this.exam.id,
      startedAt: this.startedAt.toISOString(),
      status: this.status,
      currentTaskIndex: this.currentTaskIndex,
      answers: Array.from(this.answers.entries()),
      totalPausedTime: this.totalPausedTime,
    });
  }
  static deserialize(t, n) {
    const r = JSON.parse(t),
      s = new Ji(n);
    return (
      (s.id = r.id),
      (s.startedAt = new Date(r.startedAt)),
      (s.status = r.status),
      (s.currentTaskIndex = r.currentTaskIndex),
      (s.totalPausedTime = r.totalPausedTime),
      r.answers.forEach(([a, l]) => {
        s.answers.set(a, { ...l, timestamp: new Date(l.timestamp) });
      }),
      s
    );
  }
}
const ln = class ln {
  constructor() {
    $(this, 'examData', new Map());
    this.registerDefaultExams();
  }
  static getInstance() {
    return (ln.instance || (ln.instance = new ln()), ln.instance);
  }
  registerDefaultExams() {
    (this.register('MATHEMATICS', 9, 'OGE', Fl),
      this.register('MATHEMATICS', 11, 'EGE_PROFILE', np),
      this.register('MATHEMATICS', 11, 'EGE_BASE', rp));
  }
  createKey(t, n, r) {
    return `${t}_${n}_${r}`;
  }
  register(t, n, r, s) {
    const a = this.createKey(t, n, r);
    this.examData.set(a, s);
  }
  get(t, n, r) {
    const s = this.createKey(t, n, r);
    return this.examData.get(s);
  }
  has(t, n, r) {
    const s = this.createKey(t, n, r);
    return this.examData.has(s);
  }
  getAvailableTypes(t, n) {
    const r = [],
      s = ['OGE', 'EGE_PROFILE', 'EGE_BASE', 'REGULAR'];
    for (const a of s) this.has(t, n, a) && r.push(a);
    return r;
  }
};
$(ln, 'instance');
let Ul = ln;
const un = class un {
  constructor() {
    $(this, 'registry');
    this.registry = Ul.getInstance();
  }
  static getInstance() {
    return (un.instance || (un.instance = new un()), un.instance);
  }
  create(t, n, r) {
    const s = this.registry.get(n, r, t);
    if (!s) throw new p1(`Экзамен не найден: ${t} по ${n} для ${r} класса`);
    return this.createExamInstance(t, s);
  }
  createExamInstance(t, n) {
    switch (t) {
      case 'OGE':
        return new u1(n);
      case 'EGE_PROFILE':
        return new c1(n);
      case 'EGE_BASE':
        return new d1(n);
      case 'REGULAR':
      default:
        return new f1(n);
    }
  }
  getAvailableExamTypes(t, n) {
    return this.registry.getAvailableTypes(t, n);
  }
  isExamAvailable(t, n, r) {
    return this.registry.has(n, r, t);
  }
  registerExam(t, n, r, s) {
    this.registry.register(t, n, r, s);
  }
  createOGEMath() {
    return this.create('OGE', 'MATHEMATICS', 9);
  }
  createEGEProfileMath() {
    return this.create('EGE_PROFILE', 'MATHEMATICS', 11);
  }
  createEGEBaseMath() {
    return this.create('EGE_BASE', 'MATHEMATICS', 11);
  }
};
$(un, 'instance');
let Hl = un;
class p1 extends Error {
  constructor(t) {
    (super(t), (this.name = 'ExamNotFoundError'));
  }
}
function m1(e = 0, t = {}) {
  const { onComplete: n, onWarning: r, onCritical: s, autoStart: a = !1 } = t,
    l = y.useRef(ar.getInstance()),
    [i, u] = y.useState({ timeLeft: e, isRunning: !1, isPaused: !1, status: 'normal' }),
    c = y.useRef('normal');
  (y.useEffect(() => {
    const v = l.current.onTick(p => {
        (u(p),
          p.status !== c.current &&
            (p.status === 'warning' && r ? r() : p.status === 'critical' && s && s(),
            (c.current = p.status)));
      }),
      h = l.current.onComplete(() => {
        n && n();
      });
    return () => {
      (v(), h());
    };
  }, [n, r, s]),
    y.useEffect(() => (a && e > 0 && l.current.start(e), () => {}), [a, e]));
  const d = y.useCallback(v => {
      l.current.start(v);
    }, []),
    f = y.useCallback(() => {
      l.current.pause();
    }, []),
    m = y.useCallback(() => {
      l.current.resume();
    }, []),
    b = y.useCallback(() => {
      l.current.stop();
    }, []),
    x = y.useCallback(v => {
      l.current.reset(v);
    }, []),
    w = y.useCallback(v => {
      l.current.addTime(v);
    }, []);
  return {
    timeLeft: i.timeLeft,
    formattedTime: ar.formatTime(i.timeLeft),
    isRunning: i.isRunning,
    isPaused: i.isPaused,
    status: i.status,
    percentRemaining: l.current.getPercentRemaining(),
    start: d,
    pause: f,
    resume: m,
    stop: b,
    reset: x,
    addTime: w,
  };
}
function h1(e) {
  const { exam: t, autoSave: n = !0, onComplete: r, onTimeExpired: s } = e,
    [a] = y.useState(() => new Ji(t)),
    [, l] = y.useState({}),
    i = y.useMemo(() => new Hv(), []),
    u = y.useCallback(() => {
      l({});
    }, []);
  y.useEffect(() => {
    if (n && a.status === 'in_progress') {
      const P = a.serialize();
      i.saveSession(P);
    }
  }, [a, n, i, a.status]);
  const c = a.getCurrentTask(),
    d = a.getCurrentTaskIndex(),
    f = y.useCallback(
      P => {
        (a.goToTask(P), u());
      },
      [a, u]
    ),
    m = y.useCallback(() => {
      (a.nextTask(), u());
    }, [a, u]),
    b = y.useCallback(() => {
      (a.previousTask(), u());
    }, [a, u]),
    x = y.useCallback(
      P => {
        const R = a.getCurrentTask();
        R && (a.submitAnswer(R.number, P), n && i.backupAnswers(a.getAllAnswers()), u());
      },
      [a, n, i, u]
    ),
    w = y.useCallback(P => a.getAnswer(P), [a]),
    v = y.useCallback(P => a.isTaskAnswered(P), [a]),
    h = a.getProgress(),
    p = a.getAnsweredCount(),
    g = t.tasks.length,
    j = y.useCallback(() => {
      const P = a.complete();
      return (i.clearSession(), r && r(P), u(), P);
    }, [a, i, r, u]),
    k = y.useCallback(() => {
      const P = a.expireTime();
      return (i.clearSession(), s && s(), u(), P);
    }, [a, i, s, u]),
    A = y.useCallback(() => {
      (a.pause(), u());
    }, [a, u]),
    _ = y.useCallback(() => {
      (a.resume(), u());
    }, [a, u]),
    S = y.useCallback(
      P => {
        if (a.isCurrentTask(P)) return 'current';
        const R = a.getAnswer(P);
        return R
          ? R.status === 'flagged'
            ? 'flagged'
            : R.value.trim()
              ? 'answered'
              : 'unanswered'
          : 'unanswered';
      },
      [a]
    );
  return {
    session: a,
    status: a.status,
    currentTask: c,
    currentTaskIndex: d,
    isFirstTask: a.isFirstTask(),
    isLastTask: a.isLastTask(),
    goToTask: f,
    nextTask: m,
    previousTask: b,
    submitAnswer: x,
    getAnswer: w,
    isTaskAnswered: v,
    progress: h,
    answeredCount: p,
    totalTasks: g,
    complete: j,
    expireTime: k,
    pause: A,
    resume: _,
    getTaskStatus: S,
  };
}
const g1 = ({
    title: e,
    subtitle: t,
    timeLeft: n,
    timerStatus: r,
    currentTask: s,
    totalTasks: a,
    progress: l,
  }) => {
    const i = () => {
        switch (r) {
          case 'critical':
            return 'text-red-400';
          case 'warning':
            return 'text-yellow-400';
          default:
            return 'text-cyan-400';
        }
      },
      u = () => {
        switch (r) {
          case 'critical':
            return 'bg-red-500/10 border-red-500/30';
          case 'warning':
            return 'bg-yellow-500/10 border-yellow-500/30';
          default:
            return 'bg-cyan-500/10 border-cyan-500/30';
        }
      };
    return o.jsx('div', {
      className: 'sticky top-0 z-50 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50',
      children: o.jsxs('div', {
        className: 'max-w-7xl mx-auto px-4 py-4',
        children: [
          o.jsxs('div', {
            className: 'flex items-center justify-between',
            children: [
              o.jsxs('div', {
                className: 'flex items-center gap-4',
                children: [
                  o.jsx('h1', {
                    className:
                      'text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent',
                    children: e,
                  }),
                  t && o.jsx('span', { className: 'text-sm text-gray-400 font-sans', children: t }),
                ],
              }),
              o.jsxs('div', {
                className: 'flex items-center gap-6',
                children: [
                  o.jsxs('div', {
                    className: `flex items-center gap-2 px-3 py-1.5 rounded-lg border ${u()}`,
                    children: [
                      o.jsx(x1, { className: `w-5 h-5 ${i()}` }),
                      o.jsx('span', {
                        className: `font-mono text-lg font-semibold ${i()}`,
                        children: ar.formatTime(n),
                      }),
                    ],
                  }),
                  o.jsxs('div', {
                    className: 'text-sm font-sans text-gray-400',
                    children: [
                      o.jsx('span', { className: 'text-cyan-400 font-semibold', children: s }),
                      o.jsx('span', { className: 'mx-1', children: '/' }),
                      o.jsx('span', { children: a }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          o.jsx('div', {
            className: 'mt-3 w-full bg-gray-700 rounded-full h-2 overflow-hidden',
            children: o.jsx('div', {
              className:
                'h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300',
              style: { width: `${l}%` },
            }),
          }),
        ],
      }),
    });
  },
  x1 = ({ className: e }) =>
    o.jsx('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      strokeWidth: 2,
      stroke: 'currentColor',
      className: e,
      children: o.jsx('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
      }),
    }),
  y1 = ({ tasks: e, currentTaskNumber: t, getTaskStatus: n, onTaskSelect: r, columns: s = 10 }) => {
    const a = y.useCallback(
      (l, i) => {
        if (i === t)
          return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white scale-110 shadow-lg shadow-cyan-500/30';
        switch (l) {
          case 'answered':
            return 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30';
          case 'flagged':
            return 'bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/30';
          case 'unanswered':
          default:
            return 'bg-gray-800/50 border border-gray-700 text-gray-400 hover:border-cyan-500/50 hover:text-white';
        }
      },
      [t]
    );
    return o.jsxs('div', {
      className:
        'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6',
      children: [
        o.jsxs('div', {
          className: 'flex items-center justify-between mb-4',
          children: [
            o.jsx('h3', {
              className: 'text-sm font-sans text-gray-400',
              children: 'Навигация по заданиям',
            }),
            o.jsx(v1, {}),
          ],
        }),
        o.jsx('div', {
          className: 'grid gap-2',
          style: { gridTemplateColumns: `repeat(${Math.min(s, e.length)}, minmax(0, 1fr))` },
          children: e.map(l => {
            const i = n(l.number),
              u = a(i, l.number);
            return o.jsx(
              'button',
              {
                onClick: () => r(l.number),
                className: `
                aspect-square rounded-lg
                font-display font-semibold text-sm
                transition-all duration-200
                ${u}
              `,
                title: `Задание ${l.number}`,
                children: l.number,
              },
              l.number
            );
          }),
        }),
      ],
    });
  },
  v1 = () =>
    o.jsxs('div', {
      className: 'flex items-center gap-4 text-xs font-sans',
      children: [
        o.jsx(Is, { color: 'bg-cyan-500', label: 'Текущее' }),
        o.jsx(Is, { color: 'bg-cyan-500/20 border border-cyan-500/30', label: 'Отвечено' }),
        o.jsx(Is, { color: 'bg-yellow-500/20 border border-yellow-500/30', label: 'Помечено' }),
        o.jsx(Is, { color: 'bg-gray-800/50 border border-gray-700', label: 'Не отвечено' }),
      ],
    }),
  Is = ({ color: e, label: t }) =>
    o.jsxs('div', {
      className: 'flex items-center gap-1.5',
      children: [
        o.jsx('div', { className: `w-3 h-3 rounded ${e}` }),
        o.jsx('span', { className: 'text-gray-500', children: t }),
      ],
    }),
  w1 = ({ task: e, currentAnswer: t, onAnswer: n, disabled: r = !1 }) => {
    const [s, a] = y.useState(t),
      l = y.useCallback(
        u => {
          const c = u.target.value;
          (a(c), n(c));
        },
        [n]
      ),
      i = y.useCallback(u => {
        u.key === 'Enter' && u.preventDefault();
      }, []);
    return o.jsxs('div', {
      className: 'space-y-3',
      children: [
        o.jsx('label', {
          className: 'block text-sm font-sans text-gray-400',
          children:
            e.type === 'matching'
              ? 'Введите соответствие (например: А-1, Б-2, В-3):'
              : 'Введите ответ:',
        }),
        o.jsxs('div', {
          className: 'relative',
          children: [
            o.jsx('input', {
              type: 'text',
              value: s,
              onChange: l,
              onKeyDown: i,
              disabled: r,
              placeholder: e.type === 'matching' ? 'А-1, Б-2, В-3' : 'Ваш ответ',
              className: `
            w-full px-4 py-3
            bg-gray-800/50
            border border-gray-700
            rounded-xl
            text-white
            placeholder-gray-500
            focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
            transition-all duration-200
            font-sans
            ${r ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
          `,
              autoComplete: 'off',
              spellCheck: 'false',
            }),
            s &&
              o.jsx('div', {
                className: 'absolute right-3 top-1/2 -translate-y-1/2',
                children: o.jsx('svg', {
                  xmlns: 'http://www.w3.org/2000/svg',
                  className: 'h-5 w-5 text-cyan-400',
                  viewBox: '0 0 20 20',
                  fill: 'currentColor',
                  children: o.jsx('path', {
                    fillRule: 'evenodd',
                    d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
                    clipRule: 'evenodd',
                  }),
                }),
              }),
          ],
        }),
        e.type === 'matching' &&
          o.jsx('p', {
            className: 'text-xs text-gray-500 font-sans',
            children: 'Запишите соответствие через запятую, например: А-1, Б-3, В-2',
          }),
      ],
    });
  },
  b1 = ({ task: e, currentAnswer: t, onAnswer: n, disabled: r = !1, multiple: s = !1 }) => {
    const a = y.useMemo(() => (s && t ? t.split(',').map(c => c.trim()) : []), [t, s]),
      l = y.useCallback(
        c => {
          r || n(c);
        },
        [n, r]
      ),
      i = y.useCallback(
        c => {
          if (r) return;
          const d = a.includes(c) ? a.filter(f => f !== c) : [...a, c];
          n(d.join(', '));
        },
        [a, n, r]
      ),
      u = y.useCallback(c => (s ? a.includes(c) : t === c), [t, a, s]);
    return !e.options || e.options.length === 0
      ? o.jsx('div', {
          className: 'text-gray-500 font-sans',
          children: 'Варианты ответов отсутствуют',
        })
      : o.jsxs('div', {
          className: 'space-y-3',
          children: [
            o.jsx('label', {
              className: 'block text-sm font-sans text-gray-400 mb-4',
              children: s ? 'Выберите все подходящие варианты:' : 'Выберите один вариант:',
            }),
            o.jsx('div', {
              className: 'space-y-3',
              children: e.options.map((c, d) => {
                const f = u(c),
                  m = s ? i : l;
                return o.jsx(
                  'button',
                  {
                    onClick: () => m(c),
                    disabled: r,
                    className: `
                w-full p-4 rounded-xl
                border-2 text-left
                transition-all duration-200
                ${f ? 'border-cyan-500 bg-cyan-500/10 text-white shadow-[0_0_20px_rgba(6,182,212,0.2)]' : 'border-gray-700 bg-gray-800/30 text-gray-300 hover:border-cyan-500/50 hover:bg-gray-800/50'}
                ${r ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                group
              `,
                    children: o.jsxs('div', {
                      className: 'flex items-center gap-4',
                      children: [
                        o.jsx('div', {
                          className: `
                  flex-shrink-0 w-6 h-6
                  border-2 rounded-${s ? 'md' : 'full'}
                  flex items-center justify-center
                  transition-all duration-200
                  ${f ? 'border-cyan-500 bg-cyan-500' : 'border-gray-600 group-hover:border-cyan-500/50'}
                `,
                          children:
                            f &&
                            o.jsx('svg', {
                              xmlns: 'http://www.w3.org/2000/svg',
                              className: 'h-4 w-4 text-white',
                              viewBox: '0 0 20 20',
                              fill: 'currentColor',
                              children: o.jsx('path', {
                                fillRule: 'evenodd',
                                d: 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z',
                                clipRule: 'evenodd',
                              }),
                            }),
                        }),
                        o.jsx('span', {
                          className: 'font-sans flex-1 leading-relaxed',
                          children: c,
                        }),
                      ],
                    }),
                  },
                  d
                );
              }),
            }),
            s &&
              a.length > 0 &&
              o.jsxs('div', {
                className: 'mt-4 text-sm text-cyan-400 font-sans',
                children: ['Выбрано: ', a.length],
              }),
          ],
        });
  },
  j1 = ({ task: e, currentAnswer: t, onAnswer: n, disabled: r = !1, isProof: s = !1 }) => {
    const [a, l] = y.useState(t),
      [i, u] = y.useState(0);
    y.useEffect(() => {
      const f = a
        .trim()
        .split(/\s+/)
        .filter(m => m.length > 0);
      u(f.length);
    }, [a]);
    const c = y.useCallback(
        f => {
          const m = f.target.value;
          (l(m), n(m));
        },
        [n]
      ),
      d = y.useCallback(f => {
        const m = f.currentTarget;
        ((m.style.height = 'auto'), (m.style.height = Math.min(m.scrollHeight, 400) + 'px'));
      }, []);
    return o.jsxs('div', {
      className: 'space-y-3',
      children: [
        o.jsxs('div', {
          className: 'flex items-center justify-between',
          children: [
            o.jsx('label', {
              className: 'block text-sm font-sans text-gray-400',
              children: s ? 'Напишите доказательство:' : 'Подробное решение:',
            }),
            o.jsxs('span', {
              className: 'text-sm text-purple-400 font-sans',
              children: ['До ', e.points, ' баллов'],
            }),
          ],
        }),
        o.jsxs('div', {
          className: 'relative',
          children: [
            o.jsx('textarea', {
              value: a,
              onChange: c,
              onInput: d,
              disabled: r,
              placeholder: s
                ? 'Опишите доказательство шаг за шагом...'
                : 'Опишите решение задачи с пояснениями...',
              rows: 8,
              className: `
            w-full px-4 py-3
            bg-gray-800/50
            border border-gray-700
            rounded-xl
            text-white
            placeholder-gray-500
            focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500
            transition-all duration-200
            resize-y min-h-[200px]
            font-sans leading-relaxed
            ${r ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-600'}
          `,
              spellCheck: 'false',
            }),
            o.jsxs('div', {
              className: 'absolute bottom-3 right-3 text-xs text-gray-500 font-mono',
              children: [i, ' ', N1(i)],
            }),
          ],
        }),
        o.jsxs('div', {
          className: 'flex flex-wrap gap-2 mt-2',
          children: [
            o.jsx(Po, { icon: '💡', text: 'Записывайте все этапы решения' }),
            o.jsx(Po, { icon: '📐', text: 'Обосновывайте каждый шаг' }),
            s && o.jsx(Po, { icon: '✓', text: 'Укажите, что требовалось доказать' }),
          ],
        }),
        o.jsx('div', {
          className: 'mt-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg',
          children: o.jsxs('div', {
            className: 'flex items-start gap-2',
            children: [
              o.jsx('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                className: 'h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5',
                viewBox: '0 0 20 20',
                fill: 'currentColor',
                children: o.jsx('path', {
                  fillRule: 'evenodd',
                  d: 'M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z',
                  clipRule: 'evenodd',
                }),
              }),
              o.jsx('p', {
                className: 'text-sm text-purple-300 font-sans',
                children:
                  'Это задание требует развернутого ответа и будет проверено вручную. Постарайтесь максимально подробно объяснить ход решения.',
              }),
            ],
          }),
        }),
      ],
    });
  },
  Po = ({ icon: e, text: t }) =>
    o.jsxs('div', {
      className:
        'flex items-center gap-1.5 px-2 py-1 bg-gray-800/30 rounded-lg text-xs text-gray-400 font-sans',
      children: [o.jsx('span', { children: e }), o.jsx('span', { children: t })],
    });
function N1(e) {
  const t = e % 10,
    n = e % 100;
  return n >= 11 && n <= 19 ? 'слов' : t === 1 ? 'слово' : t >= 2 && t <= 4 ? 'слова' : 'слов';
}
const S1 = ({ task: e, currentAnswer: t, onAnswer: n, disabled: r = !1 }) => {
    const s = () => {
      switch (e.type) {
        case 'choice':
        case 'multiple_choice':
          return o.jsx(b1, {
            task: e,
            currentAnswer: t,
            onAnswer: n,
            disabled: r,
            multiple: e.type === 'multiple_choice',
          });
        case 'detailed':
        case 'proof':
          return o.jsx(j1, {
            task: e,
            currentAnswer: t,
            onAnswer: n,
            disabled: r,
            isProof: e.type === 'proof',
          });
        case 'short':
        case 'matching':
        default:
          return o.jsx(w1, { task: e, currentAnswer: t, onAnswer: n, disabled: r });
      }
    };
    return o.jsxs('div', {
      className: 'space-y-6',
      children: [
        o.jsx('div', {
          className: 'p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50',
          children: o.jsx('p', {
            className: 'text-lg text-gray-200 font-sans whitespace-pre-line leading-relaxed',
            children: e.getDisplayText(),
          }),
        }),
        o.jsx('div', { className: 'mt-6', children: s() }),
      ],
    });
  },
  k1 = ({
    task: e,
    currentAnswer: t,
    onAnswer: n,
    onPrevious: r,
    onNext: s,
    onFinish: a,
    isFirst: l = !1,
    isLast: i = !1,
    disabled: u = !1,
  }) => {
    const c = Mc[e.type] || Mc.short;
    return o.jsxs('div', {
      className:
        'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 animate-fade-in',
      children: [
        o.jsxs('div', {
          className: 'flex items-start justify-between mb-6',
          children: [
            o.jsxs('div', {
              children: [
                o.jsxs('div', {
                  className: 'flex items-center gap-3 mb-2',
                  children: [
                    o.jsxs('span', {
                      className:
                        'px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl text-cyan-400 font-display font-semibold',
                      children: ['Задание ', e.number],
                    }),
                    o.jsxs('span', {
                      className: 'text-sm text-gray-400 font-sans',
                      children: [e.points, ' ', A1(e.points)],
                    }),
                    o.jsxs('span', {
                      className: 'text-sm text-gray-500 font-sans flex items-center gap-1',
                      children: [
                        o.jsx('span', { children: c.icon }),
                        o.jsx('span', { children: c.name }),
                      ],
                    }),
                  ],
                }),
                o.jsx('div', { className: 'text-sm text-gray-500 font-sans', children: e.topic }),
              ],
            }),
            o.jsx(E1, {}),
          ],
        }),
        o.jsx(S1, { task: e, currentAnswer: t, onAnswer: n, disabled: u }),
        o.jsxs('div', {
          className: 'flex items-center justify-between pt-6 mt-6 border-t border-gray-700/50',
          children: [
            o.jsxs('button', {
              onClick: r,
              disabled: l || u,
              className: `
            flex items-center gap-2 px-4 py-2.5
            rounded-xl font-sans font-medium
            transition-all duration-200
            ${l || u ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 hover:text-white hover:bg-gray-800/50'}
          `,
              children: [o.jsx(C1, { className: 'w-5 h-5' }), 'Предыдущее'],
            }),
            o.jsx('div', {
              className: 'flex gap-3',
              children: i
                ? o.jsxs('button', {
                    onClick: a,
                    disabled: u,
                    className: `
                flex items-center gap-2 px-6 py-2.5
                bg-gradient-to-r from-green-500 to-emerald-500
                hover:from-green-400 hover:to-emerald-400
                text-white rounded-xl font-sans font-semibold
                transition-all duration-200
                shadow-lg shadow-green-500/25
                hover:shadow-green-500/40
                ${u ? 'opacity-50 cursor-not-allowed' : ''}
              `,
                    children: ['Завершить тест', o.jsx(_1, { className: 'w-5 h-5' })],
                  })
                : o.jsxs('button', {
                    onClick: s,
                    disabled: u,
                    className: `
                flex items-center gap-2 px-6 py-2.5
                bg-gradient-to-r from-cyan-500 to-blue-500
                hover:from-cyan-400 hover:to-blue-400
                text-white rounded-xl font-sans font-semibold
                transition-all duration-200
                shadow-lg shadow-cyan-500/25
                hover:shadow-cyan-500/40
                ${u ? 'opacity-50 cursor-not-allowed' : ''}
              `,
                    children: ['Следующее', o.jsx(T1, { className: 'w-5 h-5' })],
                  }),
            }),
          ],
        }),
      ],
    });
  },
  E1 = () =>
    o.jsx('button', {
      className:
        'p-2 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-colors',
      title: 'Отметить для проверки',
      children: o.jsx('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        fill: 'none',
        viewBox: '0 0 24 24',
        strokeWidth: 2,
        stroke: 'currentColor',
        className: 'w-5 h-5',
        children: o.jsx('path', {
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          d: 'M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.71l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5',
        }),
      }),
    }),
  C1 = ({ className: e }) =>
    o.jsx('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      strokeWidth: 2,
      stroke: 'currentColor',
      className: e,
      children: o.jsx('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18',
      }),
    }),
  T1 = ({ className: e }) =>
    o.jsx('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      strokeWidth: 2,
      stroke: 'currentColor',
      className: e,
      children: o.jsx('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3',
      }),
    }),
  _1 = ({ className: e }) =>
    o.jsx('svg', {
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
      viewBox: '0 0 24 24',
      strokeWidth: 2,
      stroke: 'currentColor',
      className: e,
      children: o.jsx('path', {
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        d: 'M4.5 12.75l6 6 9-13.5',
      }),
    });
function A1(e) {
  const t = e % 10,
    n = e % 100;
  return n >= 11 && n <= 19 ? 'баллов' : t === 1 ? 'балл' : t >= 2 && t <= 4 ? 'балла' : 'баллов';
}
const L1 = ({ results: e, examTitle: t, onRetry: n }) => {
    const r = Qe(),
      a = (() => {
        const l = e.percentageScore;
        return l >= 90
          ? { grade: 5, label: 'Отлично!', color: 'from-green-400 to-emerald-400', emoji: '🏆' }
          : l >= 75
            ? { grade: 4, label: 'Хорошо!', color: 'from-cyan-400 to-blue-400', emoji: '🎉' }
            : l >= 50
              ? {
                  grade: 3,
                  label: 'Удовлетворительно',
                  color: 'from-yellow-400 to-orange-400',
                  emoji: '👍',
                }
              : {
                  grade: 2,
                  label: 'Нужно повторить',
                  color: 'from-red-400 to-pink-400',
                  emoji: '📚',
                };
      })();
    return o.jsxs('div', {
      className: 'min-h-screen bg-gray-950 relative overflow-hidden py-12 px-4',
      children: [
        o.jsx('div', {
          className:
            'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
        }),
        o.jsx('div', {
          className: 'relative z-10 max-w-2xl mx-auto',
          children: o.jsxs('div', {
            className:
              'bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 text-center animate-scale-in',
            children: [
              o.jsx('div', { className: 'text-7xl mb-6 animate-bounce', children: a.emoji }),
              o.jsx('h1', {
                className: `text-4xl font-display font-bold bg-gradient-to-r ${a.color} bg-clip-text text-transparent mb-2`,
                children: a.label,
              }),
              o.jsxs('p', {
                className: 'text-gray-400 font-sans mb-8',
                children: [t, ' завершен'],
              }),
              o.jsxs('div', {
                className: 'grid grid-cols-2 gap-4 mb-8',
                children: [
                  o.jsx(Bc, {
                    label: 'Правильных ответов',
                    value: e.correctAnswers,
                    suffix: `из ${e.totalTasks}`,
                    color: 'cyan',
                  }),
                  o.jsx(Bc, {
                    label: 'Первичных баллов',
                    value: e.earnedPoints,
                    suffix: `из ${e.maxPoints}`,
                    color: 'purple',
                  }),
                ],
              }),
              o.jsxs('div', {
                className: 'mb-8',
                children: [
                  o.jsxs('div', {
                    className: 'flex items-center justify-between mb-2',
                    children: [
                      o.jsx('span', {
                        className: 'text-sm text-gray-400 font-sans',
                        children: 'Результат',
                      }),
                      o.jsxs('span', {
                        className: `text-lg font-bold bg-gradient-to-r ${a.color} bg-clip-text text-transparent`,
                        children: [e.percentageScore, '%'],
                      }),
                    ],
                  }),
                  o.jsx('div', {
                    className: 'w-full bg-gray-700 rounded-full h-3 overflow-hidden',
                    children: o.jsx('div', {
                      className: `h-3 rounded-full bg-gradient-to-r ${a.color} transition-all duration-1000`,
                      style: { width: `${e.percentageScore}%` },
                    }),
                  }),
                ],
              }),
              o.jsxs('div', {
                className: 'grid grid-cols-2 gap-4 mb-8 text-sm',
                children: [
                  o.jsx(Fc, {
                    icon: '📝',
                    label: 'Отвечено заданий',
                    value: `${e.answeredTasks} из ${e.totalTasks}`,
                  }),
                  o.jsx(Fc, {
                    icon: '⏱️',
                    label: 'Затраченное время',
                    value: ar.formatTime(e.timeSpent),
                  }),
                ],
              }),
              o.jsxs('div', {
                className: 'flex gap-4 justify-center',
                children: [
                  o.jsx('button', {
                    onClick: () => r('/dashboard'),
                    className:
                      'px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-sans font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/25',
                    children: 'К панели управления',
                  }),
                  n &&
                    o.jsx('button', {
                      onClick: n,
                      className:
                        'px-6 py-3 border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 rounded-xl font-sans font-medium transition-all duration-200',
                      children: 'Пройти заново',
                    }),
                ],
              }),
            ],
          }),
        }),
      ],
    });
  },
  Bc = ({ label: e, value: t, suffix: n, color: r }) => {
    const s = {
      cyan: 'from-cyan-500 to-blue-500 text-cyan-400',
      purple: 'from-purple-500 to-pink-500 text-purple-400',
    };
    return o.jsxs('div', {
      className: 'p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50',
      children: [
        o.jsx('p', { className: 'text-sm text-gray-500 font-sans mb-1', children: e }),
        o.jsx('p', { className: 'text-3xl font-display font-bold text-white mb-1', children: t }),
        o.jsx('p', { className: `text-sm font-sans ${s[r].split(' ')[1]}`, children: n }),
      ],
    });
  },
  Fc = ({ icon: e, label: t, value: n }) =>
    o.jsxs('div', {
      className: 'flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg',
      children: [
        o.jsx('span', { className: 'text-xl', children: e }),
        o.jsxs('div', {
          className: 'text-left',
          children: [
            o.jsx('p', { className: 'text-xs text-gray-500 font-sans', children: t }),
            o.jsx('p', { className: 'text-sm text-gray-300 font-sans font-medium', children: n }),
          ],
        }),
      ],
    });
function P1() {
  const e = Qe(),
    n = en().state,
    [r, s] = y.useState(null),
    [a, l] = y.useState(!0),
    [i, u] = y.useState(null),
    [c, d] = y.useState(null),
    f = y.useMemo(
      () =>
        n
          ? n.grade === 9
            ? 'OGE'
            : n.grade === 11
              ? n.egeType === 'base'
                ? 'EGE_BASE'
                : 'EGE_PROFILE'
              : 'REGULAR'
          : 'REGULAR',
      [n]
    );
  return (
    y.useEffect(() => {
      if (!(n != null && n.grade) || !(n != null && n.subject)) {
        (u('Некорректные параметры'), l(!1));
        return;
      }
      try {
        const b = Hl.getInstance().create(f, n.subject, n.grade);
        (s(b), u(null));
      } catch (m) {
        (u(Js.ERROR_LOADING_EXAM), console.error('Ошибка загрузки экзамена:', m));
      } finally {
        l(!1);
      }
    }, [n, f]),
    a
      ? o.jsx(sp, {})
      : i || !r
        ? o.jsx(I1, { error: i || 'Экзамен не найден', onBack: () => e('/dashboard') })
        : c
          ? o.jsx(L1, { results: c, examTitle: r.title, onRetry: () => window.location.reload() })
          : o.jsx(R1, {
              exam: r,
              onComplete: m => {
                (d(m), H.success(Js.TEST_COMPLETED));
              },
              onTimeExpired: () => {
                H.error(Js.TIME_EXPIRED);
              },
            })
  );
}
const R1 = ({ exam: e, onComplete: t, onTimeExpired: n }) => {
    const {
        currentTask: r,
        currentTaskIndex: s,
        isFirstTask: a,
        isLastTask: l,
        goToTask: i,
        nextTask: u,
        previousTask: c,
        submitAnswer: d,
        getAnswer: f,
        progress: m,
        answeredCount: b,
        totalTasks: x,
        complete: w,
        expireTime: v,
        getTaskStatus: h,
      } = h1({ exam: e, autoSave: !0, onComplete: t, onTimeExpired: n }),
      {
        timeLeft: p,
        status: g,
        start: j,
      } = m1(0, {
        onComplete: () => {
          const P = v();
          t(P);
        },
        onWarning: () => {
          H('Осталось 25% времени!', { icon: '⚠️' });
        },
        onCritical: () => {
          H.error('Осталось менее 10% времени!');
        },
      });
    y.useEffect(() => {
      j(e.getDurationInSeconds());
    }, [e, j]);
    const k = y.useMemo(() => {
        if (!r) return '';
        const P = f(r.number);
        return (P == null ? void 0 : P.value) || '';
      }, [r, f]),
      A = y.useCallback(
        P => {
          d(P);
        },
        [d]
      ),
      _ = y.useCallback(() => {
        if (b < x && !window.confirm(Js.UNANSWERED_WARNING)) return;
        const P = w();
        t(P);
      }, [b, x, w, t]),
      S = y.useCallback(
        P => {
          i(P);
        },
        [i]
      );
    return r
      ? o.jsxs('div', {
          className: 'min-h-screen bg-gray-950 relative overflow-hidden',
          children: [
            o.jsx('div', {
              className:
                'absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20',
            }),
            o.jsx(g1, {
              title: e.title,
              subtitle: `${e.grade} класс`,
              timeLeft: p,
              timerStatus: g,
              currentTask: s + 1,
              totalTasks: x,
              progress: m,
            }),
            o.jsxs('div', {
              className: 'relative z-10 max-w-4xl mx-auto px-4 py-8',
              children: [
                o.jsx(k1, {
                  task: r,
                  currentAnswer: k,
                  onAnswer: A,
                  onPrevious: c,
                  onNext: u,
                  onFinish: _,
                  isFirst: a,
                  isLast: l,
                }),
                o.jsx('div', {
                  className: 'mt-6',
                  children: o.jsx(y1, {
                    tasks: e.tasks,
                    currentTaskNumber: r.number,
                    getTaskStatus: h,
                    onTaskSelect: S,
                  }),
                }),
              ],
            }),
          ],
        })
      : o.jsx(sp, {});
  },
  sp = () =>
    o.jsx('div', {
      className: 'min-h-screen bg-gray-950 flex items-center justify-center',
      children: o.jsxs('div', {
        className: 'text-center',
        children: [
          o.jsx('div', {
            className:
              'w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4',
          }),
          o.jsx('p', { className: 'text-gray-400 font-sans', children: 'Загрузка экзамена...' }),
        ],
      }),
    }),
  I1 = ({ error: e, onBack: t }) =>
    o.jsx('div', {
      className: 'min-h-screen bg-gray-950 flex items-center justify-center',
      children: o.jsxs('div', {
        className: 'text-center',
        children: [
          o.jsx('div', { className: 'text-6xl mb-4', children: '😕' }),
          o.jsx('h1', {
            className: 'text-2xl font-display font-bold text-white mb-2',
            children: 'Ошибка',
          }),
          o.jsx('p', { className: 'text-gray-400 font-sans mb-6', children: e }),
          o.jsx(te, { onClick: t, children: 'Вернуться к панели' }),
        ],
      }),
    }),
  O1 = () => {
    const [e, t] = y.useState(() => localStorage.getItem('theme') || 'light');
    return (
      y.useEffect(() => {
        const r = window.document.documentElement;
        (r.classList.remove('light', 'dark'), r.classList.add(e), localStorage.setItem('theme', e));
      }, [e]),
      {
        theme: e,
        toggleTheme: () => {
          t(r => (r === 'light' ? 'dark' : 'light'));
        },
      }
    );
  },
  M1 = () => {
    const { theme: e, toggleTheme: t } = O1();
    return o.jsx('button', {
      onClick: t,
      className:
        'relative w-14 h-7 bg-gray-200 dark:bg-gray-700 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
      'aria-label': 'Toggle theme',
      children: o.jsx('div', {
        className: `absolute top-0.5 left-0.5 w-6 h-6 bg-white dark:bg-gray-800 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${e === 'dark' ? 'translate-x-7' : 'translate-x-0'}`,
        children:
          e === 'light'
            ? o.jsx('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                fill: 'none',
                viewBox: '0 0 24 24',
                strokeWidth: 2,
                stroke: 'currentColor',
                className: 'w-4 h-4 text-yellow-500',
                children: o.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  d: 'M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
                }),
              })
            : o.jsx('svg', {
                xmlns: 'http://www.w3.org/2000/svg',
                fill: 'none',
                viewBox: '0 0 24 24',
                strokeWidth: 2,
                stroke: 'currentColor',
                className: 'w-4 h-4 text-blue-500',
                children: o.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  d: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
                }),
              }),
      }),
    });
  };
function At() {
  const { isAuthenticated: e } = pe(),
    t = async () => {
      (await Z0.logout(), (window.location.href = '/'));
    };
  return o.jsx('header', {
    className:
      'bg-gray-900/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 shadow-lg sticky top-0 z-50 transition-all duration-300',
    children: o.jsx('div', {
      className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4',
      children: o.jsxs('div', {
        className: 'flex justify-between items-center',
        children: [
          o.jsx(Ce, {
            to: '/',
            className: 'flex items-center group',
            children: o.jsx('h1', {
              className:
                'text-2xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-blue-300 transition-all',
              children: 'Лицей-интернат №64',
            }),
          }),
          o.jsxs('nav', {
            className: 'flex items-center gap-4',
            children: [
              o.jsx(M1, {}),
              e
                ? o.jsxs(o.Fragment, {
                    children: [
                      o.jsx(Ce, {
                        to: '/profile',
                        className:
                          'text-gray-300 hover:text-cyan-400 dark:text-gray-300 dark:hover:text-cyan-400 transition-colors font-sans font-medium',
                        children: 'Профиль',
                      }),
                      o.jsx(te, {
                        variant: 'outline',
                        onClick: t,
                        className: 'text-sm',
                        children: 'Выйти',
                      }),
                    ],
                  })
                : o.jsxs(o.Fragment, {
                    children: [
                      o.jsx(Ce, {
                        to: '/login',
                        className:
                          'text-gray-300 hover:text-cyan-400 dark:text-gray-300 dark:hover:text-cyan-400 transition-colors font-sans font-medium',
                        children: 'Войти',
                      }),
                      o.jsx(Ce, {
                        to: '/register',
                        children: o.jsx(te, { className: 'text-sm', children: 'Регистрация' }),
                      }),
                    ],
                  }),
            ],
          }),
        ],
      }),
    }),
  });
}
const D1 = () => {
    const { isAuthenticated: e, token: t } = pe(),
      n = y.useRef(new Set()),
      r = y.useRef(!1);
    y.useEffect(() => {
      if (!e || !t) return;
      const s = async () => {
        try {
          const l = await fetch('/api/users/achievements', {
            headers: { Authorization: `Bearer ${t}` },
          });
          if (!l.ok) return;
          const c = ((await l.json()).achievements || []).filter(d => d.isUnlocked);
          if (!r.current) {
            ((n.current = new Set(c.map(d => d.id))), (r.current = !0));
            return;
          }
          for (const d of c) n.current.has(d.id) || (z1(d), n.current.add(d.id));
        } catch (l) {
          console.error('Error checking achievements:', l);
        }
      };
      s();
      const a = setInterval(s, 1e4);
      return () => clearInterval(a);
    }, [e, t]);
  },
  z1 = e => {
    const t = 'animate-enter';
    H.custom(
      n =>
        o.jsxs('div', {
          className: `${n.visible ? t : 'animate-leave'} max-w-md w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 shadow-2xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 p-4`,
          children: [
            o.jsxs('div', {
              className: 'flex-1 flex items-center',
              children: [
                o.jsx('div', {
                  className: 'flex-shrink-0',
                  children: o.jsx('div', {
                    className:
                      'w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg',
                    children: e.icon,
                  }),
                }),
                o.jsxs('div', {
                  className: 'ml-4 flex-1',
                  children: [
                    o.jsx('div', {
                      className: 'flex items-center gap-2',
                      children: o.jsx('p', {
                        className: 'text-sm font-bold text-white uppercase tracking-wide',
                        children: '🎉 Новое достижение!',
                      }),
                    }),
                    o.jsx('p', {
                      className: 'mt-1 text-lg font-bold text-white',
                      children: e.name,
                    }),
                    o.jsx('p', {
                      className: 'mt-1 text-sm text-yellow-100',
                      children: e.description,
                    }),
                    o.jsx('div', {
                      className: 'mt-2 flex items-center gap-1',
                      children: o.jsxs('span', {
                        className:
                          'text-xs font-semibold text-white bg-white bg-opacity-20 px-2 py-1 rounded',
                        children: ['+', e.points, ' очков'],
                      }),
                    }),
                  ],
                }),
              ],
            }),
            o.jsx('button', {
              onClick: () => H.dismiss(n.id),
              className: 'ml-4 flex-shrink-0 text-white hover:text-yellow-100 transition-colors',
              children: o.jsx('svg', {
                className: 'w-5 h-5',
                fill: 'none',
                viewBox: '0 0 24 24',
                stroke: 'currentColor',
                children: o.jsx('path', {
                  strokeLinecap: 'round',
                  strokeLinejoin: 'round',
                  strokeWidth: 2,
                  d: 'M6 18L18 6M6 6l12 12',
                }),
              }),
            }),
          ],
        }),
      { duration: 6e3, position: 'top-center' }
    );
  };
function $1() {
  return (
    D1(),
    o.jsx(Rg, {
      children: o.jsxs('div', {
        className: 'min-h-screen bg-gray-950',
        children: [
          o.jsx(Sx, {
            position: 'top-right',
            reverseOrder: !1,
            gutter: 8,
            toastOptions: {
              duration: 4e3,
              style: {
                background:
                  'linear-gradient(135deg, rgba(31, 41, 55, 0.95), rgba(17, 24, 39, 0.95))',
                color: '#f3f4f6',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid rgba(75, 85, 99, 0.3)',
                backdropFilter: 'blur(12px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
              },
              success: {
                duration: 3e3,
                style: {
                  background:
                    'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(5, 150, 105, 0.2))',
                  color: '#6ee7b7',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                },
                iconTheme: { primary: '#10b981', secondary: '#064e3b' },
              },
              error: {
                duration: 4e3,
                style: {
                  background:
                    'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(220, 38, 38, 0.2))',
                  color: '#fca5a5',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                },
                iconTheme: { primary: '#ef4444', secondary: '#7f1d1d' },
              },
            },
          }),
          o.jsxs(Eg, {
            children: [
              o.jsx(Ne, {
                path: '/',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(oy, {})] }),
              }),
              o.jsx(Ne, { path: '/login', element: o.jsx($v, {}) }),
              o.jsx(Ne, { path: '/register', element: o.jsx(Fv, {}) }),
              o.jsx(Ne, {
                path: '/terms',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(Qv, {})] }),
              }),
              o.jsx(Ne, {
                path: '/dashboard',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(Gv, {})] }),
              }),
              o.jsx(Ne, {
                path: '/profile',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(Uv, {})] }),
              }),
              o.jsx(Ne, {
                path: '/diagnostic',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(qv, {})] }),
              }),
              o.jsx(Ne, { path: '/diagnostic/test/:subject', element: o.jsx(Dc, {}) }),
              o.jsx(Ne, {
                path: '/test/setup/:subject',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(Xv, {})] }),
              }),
              o.jsx(Ne, {
                path: '/test/ege-type',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(e1, {})] }),
              }),
              o.jsx(Ne, { path: '/test/oge-ege', element: o.jsx(zc, {}) }),
              o.jsx(Ne, { path: '/test/ege', element: o.jsx(zc, {}) }),
              o.jsx(Ne, { path: '/test/exam', element: o.jsx(P1, {}) }),
              o.jsx(Ne, { path: '/test/:testId', element: o.jsx(Dc, {}) }),
              o.jsx(Ne, {
                path: '/learning-plan',
                element: o.jsxs(o.Fragment, { children: [o.jsx(At, {}), o.jsx(Zv, {})] }),
              }),
            ],
          }),
        ],
      }),
    })
  );
}
Ro.createRoot(document.getElementById('root')).render(
  o.jsx(Ql.StrictMode, { children: o.jsx($1, {}) })
);
