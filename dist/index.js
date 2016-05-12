'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _exenv = require('exenv');

var _exenv2 = _interopRequireDefault(_exenv);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ProseMirror = function ProseMirror() {};
if (_exenv2.default.canUseDOM) {
  // ProseMirror expects to access the DOM on require, so we
  // gate the requires with exenv. Can't use import though because
  // `import` needs to be a top level function. Ideally we could
  // just import prosemirror outright, but it isn't coded for our
  // environment... yet.
  ProseMirror = require('prosemirror/dist/edit').ProseMirror;
  require('prosemirror/dist/markdown');
  require('prosemirror/dist/menu/menubar');
}

var MarkdownEditor = function (_Component) {
  _inherits(MarkdownEditor, _Component);

  function MarkdownEditor(props) {
    _classCallCheck(this, MarkdownEditor);

    // binding changeHandler to this so that ProseMirror's .off works

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MarkdownEditor).call(this, props));

    _this.changeHandler = _this.changeHandler.bind(_this);
    return _this;
  }

  _createClass(MarkdownEditor, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.val = this.props.value || 'valueLink' in this.props && this.props.valueLink.value || this.props.defaultValue || '';

      this.proseMirror = new ProseMirror({
        place: this.refs.prosemirror,
        doc: this.val,
        docFormat: 'markdown',
        menuBar: true,
        inlineMenu: true,
        buttonMenu: false,
        label: this.props.label
      });
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this.refs.prosemirror.appendChild(this.proseMirror.wrapper);

      this.proseMirror.on('change', this.changeHandler);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(newProps) {
      this.newVal = newProps.value || 'valueLink' in newProps && newProps.valueLink.value || newProps.defaultValue || '';
    }
  }, {
    key: 'componentWillUpdate',
    value: function componentWillUpdate() {
      // unlike with most controlled inputs, we only setContent when
      // the value was changed by an external source (and not the user
      // typing in the proseMirror field directly).
      if (this.newVal !== this.val) {
        this.val = this.newVal;
        this.proseMirror.setContent(this.val, 'markdown');
      }
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this.proseMirror.off('change', this.changeHandler);
    }
  }, {
    key: 'render',
    value: function render() {
      var className = this.props.className || 'editor-description';

      return _react2.default.createElement(
        'div',
        { className: className },
        _react2.default.createElement(Placeholder, { text: this.props.label, value: this.val }),
        _react2.default.createElement('div', { ref: 'prosemirror' })
      );
    }
  }, {
    key: 'changeHandler',
    value: function changeHandler() {
      var callback = this.props.onChange || 'valueLink' in this.props && this.props.valueLink.requestChange;
      if (callback) {
        this.val = this.proseMirror.getContent('markdown');
        callback(this.val);
      }
    }
  }, {
    key: 'getContent',
    value: function getContent() {
      var type = arguments.length <= 0 || arguments[0] === undefined ? 'markdown' : arguments[0];

      return this.proseMirror.getContent(type);
    }
  }]);

  return MarkdownEditor;
}(_react.Component);

exports.default = MarkdownEditor;


MarkdownEditor.propTypes = {
  value: _react2.default.PropTypes.string,
  valueLink: _react2.default.PropTypes.object,
  onChange: _react2.default.PropTypes.func,
  defaultValue: _react2.default.PropTypes.string,
  label: _react2.default.PropTypes.string,
  className: _react2.default.PropTypes.string
};

var Placeholder = function Placeholder(props) {
  var value = props.value;
  var text = props.text;


  value = (value || '').trim();
  return _react2.default.createElement(
    'div',
    { className: 'placeholder-component' + (value ? ' placeholder-component-active' : '') },
    text
  );
};