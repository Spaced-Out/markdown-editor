import {Inline, Attribute} from 'prosemirror/dist/model';
import MarkdownVideoPlugin from 'markdown-it-video';
import ExecutionEnvironment from 'exenv';


let Dropdown = function(){}
let MenuCommandGroup = function(){}
let elt = function(){};
if (ExecutionEnvironment.canUseDOM) {
  ({Dropdown, MenuCommandGroup} = require('prosemirror/dist/menu/menu'));
  ({elt} = require('prosemirror/dist/dom'));
  // const fetch = require('whatwg-fetch').default;
}


export class VideoEmbed extends Inline {
  // Not sure what this is for other than tagging
  get attrs() {
    return {
      videoId: new Attribute({label: 'video id'}),
      service: new Attribute({label: 'hosting service'}),
      width: new Attribute({label: 'embed width', default: 320}),
      height: new Attribute({label: 'embed height', default: 240}),
    }
  }
}

const generateVideoUrl = (attrs) => {
  let {service, videoId} = attrs;
  switch(service) {
    case 'youtube':
      return `https://youtu.be/${videoId}`;
    case 'vimeo':
      return `https://vimeo.com/${videoId}`;
  }
}

const generateTempVideoNode = (attrs) => {
  let {service, videoId} = attrs;
  const videoUrl = generateVideoUrl(attrs);

  return elt('span', {
    'class': `prosemirror-video-embed prosemirror-video-embed-${service}`,
    'contenteditable': 'false'
  }, elt('span', {
    'class': `prosemirror-video-embed-label`
  }, `video at ${videoUrl}`))
};

VideoEmbed.prototype.serializeMarkdown = (state, node) => {
  state.write(`@[${node.attrs.service}](${node.attrs.videoId})`)
}
VideoEmbed.prototype.serializeDOM = (node) => {
  const {service, videoId} = node.attrs;
  if (['vimeo', 'youtube'].indexOf(service.toLowerCase()) < 0) {
    return;
  }

  // if (service === 'vimeo') {
  //   const videoUrl = encodeURIComponent(`https://vimeo.com/${videoId}`);
  //   fetch(`https://vimeo.com/api/oembed.json/?url=${videoUrl}`).then(response => response.json())
  //     .then(response => {
  //       // console.log(response)
  //     })
  // }

  return generateTempVideoNode(node.attrs);
}



VideoEmbed.register("command", "insert", {
  derive: {
    params: [
      {label: "service", attr: "service"},
      {label: "video id", attr: "videoId"},
      {label: "width", attr: "width"},
      {label: "height", attr: "height"},
    ],
  },
  label: 'Insert video',
  menu: {
      group: "insert", rank: 1,
      display: {type: "label", label: "Video"}
    }
  })

VideoEmbed.register('parseMarkdown', 'video', {parse: function(state, tok) {
  state.addNode(this, {service: tok.service, videoId: tok.videoID});
}})


VideoEmbed.register('configureMarkdown', 'video', parser => {
  return parser.use(MarkdownVideoPlugin);
})

// export const dynamicMenu = new Dropdown({label: 'Insert dynamic field'}, new MenuCommandGroup('dynamic'))


