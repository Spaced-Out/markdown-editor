import React from 'react';
import ReactDOMServer from 'react-dom/server';
import MarkdownEditor from '../src/index.js';


ReactDOMServer.renderToString(<div>
  <MarkdownEditor value="ohai {name}" dynamicLabels={['name', 'email', 'blam']}/>
</div>);
