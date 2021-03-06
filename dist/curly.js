'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (md, opts) {
  md.inline.ruler.after('emphasis', 'curly', curlyTextParser);
  md.renderer.rules.curly_open = function () {
    return '{';
  };
  md.renderer.rules.curly_open = function () {
    return '}';
  };
};

// this a curly text markdown parser for markdown-it that is mostly a fork
// of the '~' markdown-it-sub parser but to handle open/closing tags
//
// curly_open and curly_close are there in case we decide to do something with them,
// but for now they render noop in the actual editor (see dynamic-text.js)

var curlyTextParser = function curlyTextParser(state, silent) {
  var UNESCAPE_MD_RE = /\\([\\!"#$%&'()*+,.\/:;<=>?@[\]^_`{|}~-])/g;
  var max = state.posMax;
  var start = state.pos;

  if (state.src.charCodeAt(start) !== 123 /* { */) {
      return false;
    }
  if (silent) {
    return false;
  }
  if (start + 2 >= max) {
    return false;
  }

  var found = void 0;
  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === 125 /* } */) {
        found = true;
        break;
      }
    state.md.inline.skipToken(state);
  }

  if (!found || start + 1 === state.pos) {
    state.pos = start;
    return false;
  }
  var content = state.src.slice(start + 1, state.pos);

  // disallow unescaped spaces/newlines
  if (content.match(/(^|[^\\])(\\\\)*\s/)) {
    state.pos = start;
    return false;
  }

  state.posMax = state.pos;
  state.pos = start + 1;

  // Earlier we checked !silent, but this implementation does not need it
  var token = state.push('curly_open', 'curly', 1);
  token.markup = '{';

  token = state.push('curly', 'text', 0);
  token.content = content.replace(UNESCAPE_MD_RE, '$1');

  token = state.push('curly_close', 'curly', -1);
  token.markup = '}';

  state.pos = state.posMax + 1;
  state.posMax = max;
  return true;
};

;