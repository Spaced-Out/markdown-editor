/*
 * a default schema that we use for the editor
 */

import {Inline, Attribute} from 'prosemirror/dist/model';
import {elt} from 'prosemirror/dist/dom';
import {InputRule} from 'prosemirror/dist/inputrules';
import {Tooltip} from 'prosemirror/dist/ui/tooltip';
import CurlyTextPlugin from './curly';


// const labels = ['name', 'email', 'greeting'];
//used for rendering menu

export class DynamicText extends Inline {
  // Not sure what this is for other than tagging
  get attrs() {
    return {
      type: new Attribute('dynamic')
    }
  }
}

DynamicText.prototype.serializeDOM = (node) => {
  let newNode = elt('span',
    {
      'dynamic-label': node.attrs.type, // is this passed in by the command?
      'class': 'prosemirror-dynamic-label'
    },
    `${node.attrs.type}`);
  return newNode;
  }

DynamicText.register('parseDOM', 'span', {
  rank: 35,
  parse: function(dom, state) {
    let label = dom.getAttribute('dynamic-label');
    if (!label) { return false; }
    state.insert(this, {label});
  }
})

DynamicText.prototype.serializeMarkdown = (state, node) => {
  state.write(`{${node.attrs.type}}`)
};
DynamicText.register('configureMarkdown', 'curly', parser => {
  return parser.use(CurlyTextPlugin);
})

// this works
DynamicText.register('parseMarkdown', 'curly', {parse: function(state, tok) {
  state.addNode(this, {type: tok.content});
}})

// TODO(marcos): find out how to get the parse: 'block' behavior for inline nodes
DynamicText.register('parseMarkdown', 'curly_open', { parse: function(state, tok) { }});
DynamicText.register('parseMarkdown', 'curly_close', { parse: function(state, tok) { }});

export function dynamicTextWithLabels(labels) {
  const labelOptions = labels.map((name) => ({ 'label': name, 'value': name }));
  DynamicText.register('command', 'insert', {
    derive: {
      params: [
        {
          label: 'Type',
          attr: 'type',
          type: 'select',
          options: labelOptions, // TODO(marcos): make these selectable
          default: labelOptions[0],
        },
      ],
    },
    label: 'Insert dynamic text',
    menu: {
      group: 'insert', // TODO(marcos): move this outside of the
      rank: 1,
      display: {
        type: 'label',
        label: 'Dynamic Text' // can be an inline svg iirc
      },
    },
  })
  return DynamicText;
}
