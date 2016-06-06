import React from 'react';
import ReactDOM from 'react-dom';
import MarkdownEditor from '../src/index.js';


ReactDOM.render(<div>
  <MarkdownEditor value={`ohai {name} \n\n@[vimeo](82570177)`} debug dynamicLabels={['name', 'email', 'blam']}/>
</div>,
document.getElementById('editor'));
