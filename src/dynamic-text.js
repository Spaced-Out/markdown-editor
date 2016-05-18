/*
 * a default schema that we use for the editor
 */

import {Inline, Attribute} from 'prosemirror/dist/model';
import {elt} from 'prosemirror/dist/dom';
import {InputRule} from 'prosemirror/dist/inputrules';
import {Tooltip} from 'prosemirror/dist/ui/tooltip';
import CurlyTextPlugin from './curly';
import {Dropdown, MenuCommandGroup} from 'prosemirror/dist/menu/menu'

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

export const dynamicMenu = new Dropdown({label: 'Insert dynamic field'}, new MenuCommandGroup('dynamic'))

// this has the effect of modifying subsequent DynamicText modules
export function dynamicTextWithLabels(labels) {
  labels.forEach((label, idx) => {
    DynamicText.register('command', 'insert'+label, {
      run(pm) {
        const field = this.create({type: label});
        let {from, to, node} = pm.selection
        let side = pm.doc.resolve(from).parentOffset ? to : from
        pm.tr.insert(side, field).apply(pm.apply.scroll)
        pm.setTextSelection(side + 1)
      },
      menu: {
        group: 'dynamic',
        rank: (idx + 1) * 10,
        display: {
          type: 'label',
          label
        }
      }
    })
  })

  let rule = `{(${labels.join('|')})}$`;

  DynamicText.register("autoInput", "autoDynamic",
    new InputRule(
      new RegExp(rule),
      '}',
      function(pm, match, pos) {
        let start = pos - match[0].length;
        let field = this.create({type: match[1]});
        pm.tr.delete(start, pos).insertInline(start, field).apply();
      }
    )
  )

  return DynamicText;
}
