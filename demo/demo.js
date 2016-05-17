import React from 'react';
import ReactDOM from 'react-dom';
import MarkdownEditor from '../src/index.js';


ReactDOM.render(<MarkdownEditor value="ohai {name}" dynamicLabels={['name', 'email']}/>,
  document.getElementById('editor'));
