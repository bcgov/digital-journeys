"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports.default = Navigation;
exports.BaseNavigation = exports.styles = void 0;

var _objectWithoutPropertiesLoose2 = _interopRequireDefault(
  require("@babel/runtime/helpers/esm/objectWithoutPropertiesLoose")
);

var _taggedTemplateLiteralLoose2 = _interopRequireDefault(
  require("@babel/runtime/helpers/esm/taggedTemplateLiteralLoose")
);

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _isFunction = _interopRequireDefault(require("lodash/isFunction"));

var _Navigation = require("@button-inc/component-library/Navigation");

var _Header = require("@button-inc/bcgov-theme/Header");

var _fontawesome = require("@button-inc/bcgov-theme/fontawesome");

var _bcgov_logo = _interopRequireDefault(
  require("../../assets/digital-journeys-logo.png")
);

var /* _templateObject, */ _templateObject2;

var styles = {
  shared: {
    container: "\n      width: 100%;\n    ",
    sidebar:
      "\n      color: #fcba19;\n      background-color: #38598a;\n      padding: 5px 0 5px 0;\n      -webkit-box-shadow: 0 6px 8px -4px #b3b1b3;\n      -moz-box-shadow: 0 6px 8px -4px #b3b1b3;\n      box-shadow: 0 6px 8px -4px #b3b1b3;\n\n      & ul {\n        display: flex;\n        flex-direction: column;\n        margin: 0;\n        color: #fff;\n        list-style: none;\n      }\n\n      & ul li {\n        margin: 5px 0;\n      }\n\n      & ul li a {\n        display: flex;\n        font-size: 0.813em;\n        font-weight: normal;  /* 400 */\n        color: #fff;\n        padding: 0 15px 0 15px;\n        text-decoration: none;\n        border-right: 1px solid #9b9b9b;\n      }\n\n      & ul li a:hover {\n        text-decoration: underline;\n      }\n\n      & ul .active {\n        text-decoration: underline;\n        font-weight: bold;\n      }\n    ",
    toggle: "\n      cursor: pointer !important;\n    ",
  },
};
exports.styles = styles;
var config = {
  defaultProps: {},
  staticProps: [],
};
var BaseNavigation = (0, _Navigation.applyTheme)(styles, config);
exports.BaseNavigation = BaseNavigation;

/* Overridden with img element */
// var BannerLogo = _styledComponents.default.a(_templateObject || (_templateObject = (0, _taggedTemplateLiteralLoose2.default)(["\n  height: 90%;\n"])));

var Title = _styledComponents.default.h1(
  _templateObject2 ||
    (_templateObject2 = (0, _taggedTemplateLiteralLoose2.default)([
      "\n  font-weight: normal;\n  margin-top: 10px;\n",
    ]))
);

var DEFAULT_MOBILE_BREAK_POINT = "900";

function Navigation(props) {
  var _props$title = props.title,
    title = _props$title === void 0 ? "" : _props$title,
    _props$onBannerClick = props.onBannerClick,
    onBannerClick =
      _props$onBannerClick === void 0
        ? function () {
            return null;
          }
        : _props$onBannerClick,
    children = props.children,
    mobileMenu = props.mobileMenu,
    _props$mobileBreakPoi = props.mobileBreakPoint,
    mobileBreakPoint =
      _props$mobileBreakPoi === void 0
        ? DEFAULT_MOBILE_BREAK_POINT
        : _props$mobileBreakPoi,
    header = props.header,
    rest = (0, _objectWithoutPropertiesLoose2.default)(props, [
      "title",
      "onBannerClick",
      "children",
      "mobileMenu",
      "mobileBreakPoint",
      "header",
    ]);
  var context = {
    mobileBreakPoint: mobileBreakPoint,
  };
  return /*#__PURE__*/ _react.default.createElement(
    BaseNavigation,
    rest,
    /*#__PURE__*/ _react.default.createElement(
      _Header.BaseHeader,
      {
        header: header,
      },
      /*#__PURE__*/ _react.default.createElement(
        _Header.BaseHeader.Group,
        {
          className: "banner",
          style: { padding: "0px" },
        },
        /*#__PURE__*/ _react.default.createElement("img", {
          onClick: onBannerClick,
          style: { height: "85px", marginBottom: "0px" },
          src: _bcgov_logo.default,
        })
      ),
      /*#__PURE__*/ _react.default.createElement(
        _Header.BaseHeader.Item,
        {
          collapse: mobileBreakPoint,
        },
        /*#__PURE__*/ _react.default.createElement(
          Title,
          null,
          (0, _isFunction.default)(title) ? title(context) : title
        )
      ),
      /*#__PURE__*/ _react.default.createElement(
        _Header.BaseHeader.Item,
        {
          expand: mobileBreakPoint,
          style: {
            marginLeft: "auto",
            fontSize: "2rem",
            marginBottom: "auto",
            marginTop: "auto",
          },
        },
        /*#__PURE__*/ _react.default.createElement(
          BaseNavigation.Toggle,
          null,
          /*#__PURE__*/ _react.default.createElement(
            _fontawesome.FaSVG,
            null,
            /*#__PURE__*/ _react.default.createElement("path", {
              fill: "currentColor",
              d: _fontawesome.Bars,
            })
          )
        )
      )
    ),
    /*#__PURE__*/ _react.default.createElement(
      _Header.BaseHeader,
      {
        header: "sub",
        collapse: mobileBreakPoint,
      },
      children
    ),
    /*#__PURE__*/ _react.default.createElement(
      BaseNavigation.Sidebar,
      null,
      mobileMenu ? mobileMenu() : children
    )
  );
}
