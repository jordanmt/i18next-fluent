"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var utils = _interopRequireWildcard(require("./utils.js"));

var _fluent = require("fluent");

var _js2ftl = _interopRequireDefault(require("fluent_conv/js2ftl"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function getDefaults() {
  return {
    bindI18nextStore: true,
    fluentBundleOptions: {
      useIsolating: false
    }
  };
}

function nonBlank(line) {
  return !/^\s*$/.test(line);
}

function countIndent(line) {
  var _line$match = line.match(/^\s*/),
      _line$match2 = _slicedToArray(_line$match, 1),
      indent = _line$match2[0];

  return indent.length;
}

function ftl(code) {
  var lines = code.split("\n").filter(nonBlank);
  var indents = lines.map(countIndent);
  var common = Math.min.apply(Math, _toConsumableArray(indents));
  var indent = new RegExp("^\\s{".concat(common, "}"));
  return lines.map(function (line) {
    return line.replace(indent, "");
  }).join("\n");
}

var BundleStore =
/*#__PURE__*/
function () {
  function BundleStore(i18next, options) {
    _classCallCheck(this, BundleStore);

    this.i18next = i18next;
    this.options = options;
    this.bundles = {}; // this.createBundleFromI18next = this.createBundleFromI18next.bind(this);
    // this.createBundle = this.createBundle.bind(this);
    // this.bind = this.bind.bind(this);
  }

  _createClass(BundleStore, [{
    key: "createBundle",
    value: function createBundle(lng, ns, json) {
      var ftlStr = (0, _js2ftl.default)(json);
      var bundle = new _fluent.FluentBundle(lng, this.options.fluentBundleOptions);
      var errors = bundle.addMessages(ftl(ftlStr));
      utils.setPath(this.bundles, [lng, ns], bundle);
    }
  }, {
    key: "createBundleFromI18next",
    value: function createBundleFromI18next(lng, ns) {
      this.createBundle(lng, ns, utils.getPath(this.i18next.store.data, [lng, ns]));
    }
  }, {
    key: "getBundle",
    value: function getBundle(lng, ns) {
      return utils.getPath(this.bundles, [lng, ns]);
    }
  }, {
    key: "bind",
    value: function bind() {
      var _this = this;

      this.i18next.store.on('added', function (lng, ns) {
        if (!_this.i18next.isInitialized) return;

        _this.createBundleFromI18next(lng, ns);
      });
      this.i18next.on('initialized', function () {
        _this.i18next.languages.forEach(function (lng) {
          _this.i18next.options.ns.forEach(function (ns) {
            _this.createBundleFromI18next(lng, ns);
          });
        });
      });
    }
  }]);

  return BundleStore;
}();

var Fluent =
/*#__PURE__*/
function () {
  function Fluent(options) {
    _classCallCheck(this, Fluent);

    this.type = 'i18nFormat';
    this.handleAsObject = false;
    this.init(null, options);
  }

  _createClass(Fluent, [{
    key: "init",
    value: function init(i18next, options) {
      var i18nextOptions = i18next && i18next.options && i18next.options.i18nFormat || {};
      this.options = utils.defaults(i18nextOptions, options, this.options || {}, getDefaults());

      if (i18next) {
        this.store = new BundleStore(i18next, this.options);
        if (this.options.bindI18nextStore) this.store.bind();
        i18next.fluent = this;
      } else {
        this.store = new BundleStore(null, this.options);
      }
    }
  }, {
    key: "parse",
    value: function parse(res, options, lng, ns, key, info) {
      var bundle = this.store.getBundle(lng, ns);
      var isAttr = key.indexOf('.') > -1;
      if (!res) return key;
      var useRes = isAttr ? res.attrs[key.split('.')[1]] : res;
      if (!bundle) return key;
      return bundle.format(useRes, options);
    }
  }, {
    key: "getResource",
    value: function getResource(lng, ns, key, options) {
      var bundle = this.store.getBundle(lng, ns);
      var useKey = key.indexOf('.') > -1 ? key.split('.')[0] : key;
      if (!bundle) return key;
      return bundle.getMessage(useKey);
    }
  }, {
    key: "addLookupKeys",
    value: function addLookupKeys(finalKeys, key, code, ns, options) {
      // no additional keys needed for select or plural
      // so there is no need to add keys to that finalKeys array
      return finalKeys;
    }
  }]);

  return Fluent;
}();

Fluent.type = 'i18nFormat';
var _default = Fluent;
exports.default = _default;