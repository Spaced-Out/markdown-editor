'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.dynamicMenu = exports.DynamicText = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.dynamicTextWithLabels = dynamicTextWithLabels;

var _model = require('prosemirror/dist/model');

var _markdownItDynamic = require('./markdown-it-dynamic');

var _markdownItDynamic2 = _interopRequireDefault(_markdownItDynamic);

var _exenv = require('exenv');

var _exenv2 = _interopRequireDefault(_exenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /*
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                * a default schema that we use for the editor
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                */

var Dropdown = function Dropdown() {};
var MenuCommandGroup = function MenuCommandGroup() {};
var elt = function elt() {};
var InputRule = function InputRule() {};
if (_exenv2.default.canUseDOM) {
  var _require = require('prosemirror/dist/menu/menu');

  Dropdown = _require.Dropdown;
  MenuCommandGroup = _require.MenuCommandGroup;

  var _require2 = require('prosemirror/dist/dom');

  elt = _require2.elt;

  var _require3 = require('prosemirror/dist/inputrules');

  InputRule = _require3.InputRule;
}

var DynamicText = exports.DynamicText = function (_Inline) {
  _inherits(DynamicText, _Inline);

  function DynamicText() {
    _classCallCheck(this, DynamicText);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(DynamicText).apply(this, arguments));
  }

  _createClass(DynamicText, [{
    key: 'attrs',

    // Not sure what this is for other than tagging
    get: function get() {
      return {
        type: new _model.Attribute('dynamic')
      };
    }
  }]);

  return DynamicText;
}(_model.Inline);

DynamicText.prototype.serializeDOM = function (node) {
  var newNode = elt('span', {
    'dynamic-label': node.attrs.type, // is this passed in by the command?
    'class': 'prosemirror-dynamic-label'
  }, '<' + node.attrs.type + '>');
  return newNode;
};

DynamicText.register('parseDOM', 'span', {
  rank: 35,
  parse: function parse(dom, state) {
    var label = dom.getAttribute('dynamic-label');
    if (!label) {
      return false;
    }
    state.insert(this, { label: label });
  }
});

DynamicText.prototype.serializeMarkdown = function (state, node) {
  state.write('<' + node.attrs.type + '>');
};
DynamicText.register('configureMarkdown', 'dynamic', function (parser) {
  return parser.use(_markdownItDynamic2.default);
});

// this works
DynamicText.register('parseMarkdown', 'dynamic', { parse: function parse(state, tok) {
    state.addNode(this, { type: tok.content });
  } });

// TODO(marcos): find out how to get the parse: 'block' behavior for inline nodes
DynamicText.register('parseMarkdown', 'dynamic_open', { parse: function parse(state, tok) {} });
DynamicText.register('parseMarkdown', 'dynamic_close', { parse: function parse(state, tok) {} });

var dynamicMenu = exports.dynamicMenu = new Dropdown({ label: 'Insert dynamic field' }, new MenuCommandGroup('dynamic'));

// this has the effect of modifying subsequent DynamicText modules
function dynamicTextWithLabels(labels) {
  labels.forEach(function (label, idx) {
    DynamicText.register('command', 'insert' + label, {
      run: function run(pm) {
        var field = this.create({ type: label });
        var _pm$selection = pm.selection;
        var from = _pm$selection.from;
        var to = _pm$selection.to;
        var node = _pm$selection.node;

        var side = pm.doc.resolve(from).parentOffset ? to : from;
        pm.tr.insert(side, field).apply(pm.apply.scroll);
        pm.setTextSelection(side + 1);
      },

      menu: {
        group: 'dynamic',
        rank: (idx + 1) * 10,
        display: {
          type: 'label',
          label: label
        }
      }
    });
  });

  var rule = '{(' + labels.join('|') + ')}$';

  DynamicText.register("autoInput", "autoDynamic", new InputRule(new RegExp(rule), '}', function (pm, match, pos) {
    var start = pos - match[0].length;
    var field = this.create({ type: match[1] });
    pm.tr.delete(start, pos).insertInline(start, field).apply();
  }));

  return DynamicText;
}