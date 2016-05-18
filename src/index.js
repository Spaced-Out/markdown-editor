import React, {Component} from 'react';
import ExecutionEnvironment from 'exenv';
import {DynamicText, dynamicTextWithLabels, dynamicMenu} from './dynamic-text';
import {Schema, defaultSchema} from 'prosemirror/dist/model';
import {CommandSet} from 'prosemirror/dist/edit';
import {renderGrouped, inlineGroup, insertMenu, textblockMenu, blockGroup, historyGroup} from "prosemirror/dist/menu/menu"

let ProseMirror = () => {};
if (ExecutionEnvironment.canUseDOM) {
  // ProseMirror expects to access the DOM on require, so we
  // gate the requires with exenv. Can't use import though because
  // `import` needs to be a top level function. Ideally we could
  // just import prosemirror outright, but it isn't coded for our
  // environment... yet.
  ProseMirror = require('prosemirror/dist/edit').ProseMirror;
  require('prosemirror/dist/markdown');
  require('prosemirror/dist/menu/menubar');
}


export default class MarkdownEditor extends Component {
  constructor(props) {
    super(props);

    // binding changeHandler to this so that ProseMirror's .off works
    this.changeHandler = this.changeHandler.bind(this);
  }

  componentWillMount() {
    this.val = (this.props.value ||
      ('valueLink' in this.props && this.props.valueLink.value) ||
      this.props.defaultValue) || '';

    const mainMenuBar = {
      float: true,
      content: [
        inlineGroup,
        insertMenu,
        [textblockMenu, blockGroup],
        historyGroup,
        dynamicMenu,
      ],
    }

    let spec = defaultSchema.spec;

    if (this.props.dynamicLabels.length) {
      spec = spec.update({dynamic: dynamicTextWithLabels(this.props.dynamicLabels)});
    }

    let EditorSchema = new Schema(spec);

    this.proseMirror = new ProseMirror({
      place: this.refs.prosemirror,
      doc: this.val || '',
      docFormat: 'markdown',
      menuBar: mainMenuBar,
      inlineMenu: true,
      buttonMenu: false,
      label: this.props.label,
      schema: EditorSchema,
      autoInput: true,
    });
    window.pm = this.proseMirror
  }

  componentDidMount() {
    this.refs.prosemirror.appendChild(this.proseMirror.wrapper);

    this.proseMirror.on('change', this.changeHandler);
  }

  componentWillReceiveProps(newProps) {
    this.newVal = (newProps.value ||
      ('valueLink' in newProps && newProps.valueLink.value) ||
      newProps.defaultValue) || '';
  }

  componentWillUpdate() {
    // unlike with most controlled inputs, we only setContent when
    // the value was changed by an external source (and not the user
    // typing in the proseMirror field directly).
    if (this.newVal !== this.val) {
      this.val = this.newVal;
      this.proseMirror.setContent(this.val, 'markdown');
    }
  }

  componentWillUnmount() {
    this.proseMirror.off('change', this.changeHandler);
  }

  render() {
    const className = this.props.className || 'editor-description';

    return <div className={className}>
      <Placeholder text={this.props.label} value={this.val} />
      <div ref="prosemirror" />
    </div>;
  }

  changeHandler() {
    let callback = (this.props.onChange ||
      'valueLink' in this.props && this.props.valueLink.requestChange);
    if (callback) {
      this.val = this.proseMirror.getContent('markdown');
      callback(this.val);
    }
  }

  getContent(type = 'markdown') {
    return this.proseMirror.getContent(type);
  }
}

MarkdownEditor.defaultProps = {
  dynamicLabels: [],
}

MarkdownEditor.propTypes = {
  value: React.PropTypes.string,
  valueLink: React.PropTypes.object,
  onChange: React.PropTypes.func,
  defaultValue: React.PropTypes.string,
  label: React.PropTypes.string,
  className: React.PropTypes.string,
  dynamicLabels: React.PropTypes.arrayOf(React.PropTypes.string),
};


let Placeholder = (props) => {
  let {value, text} = props;

  value = (value || '').trim();
  return <div className={'placeholder-component' + (value ? ' placeholder-component-active': '')}>
    {text}
  </div>;
};
