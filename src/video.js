import {Inline, Attribute} from 'prosemirror/dist/model';
import MarkdownVideoPlugin from 'markdown-it-video';
import ExecutionEnvironment from 'exenv';
import {ParamPrompt} from "prosemirror/dist/ui/prompt"
import {defineOption} from "prosemirror/dist/edit"


let Dropdown = function(){}
let MenuCommandGroup = function(){}
let elt = function(){};
if (ExecutionEnvironment.canUseDOM) {
  ({Dropdown, MenuCommandGroup} = require('prosemirror/dist/menu/menu'));
  ({elt} = require('prosemirror/dist/dom'));
  const fetch = require('whatwg-fetch').default;
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
    'class': `prosemirror-video-embed prosemirror-video-embed-${service}`
  }, elt('span', {
    'class': `prosemirror-video-embed-label`
  }, `video at ${videoUrl}`))
}

VideoEmbed.prototype.serializeMarkdown = (state, node) => {
  state.write(`@[${node.attrs.service}](${node.attrs.videoId})`)
}
VideoEmbed.prototype.serializeDOM = (node) => {
  const {service, videoId} = node.attrs;
  if (['vimeo', 'youtube'].indexOf(service.toLowerCase()) < 0) {
    return;
  }

  if (service === 'vimeo') {
    const videoUrl = encodeURIComponent(`https://vimeo.com/${videoId}`);
    fetch(`https://vimeo.com/api/oembed.json/?url=${videoUrl}`).then(response => response.json())
      .then(response => {
        // console.log(response)
      })
  }

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


// lifted from prosemirror-widgets
class WidgetParamPrompt extends ParamPrompt {
  prompt() {
    return openWidgetPrompt(this,{onClose: () => this.close()})
  }
}

/// whoa, so cool! better menu! todo(marcos): refactor out


defineOption("commandParamPrompt", WidgetParamPrompt)

function openWidgetPrompt(wpp, options) {
  let close = () => {
    wpp.pm.off("interaction", close)
    if (dialog.parentNode) {
      dialog.parentNode.removeChild(dialog)
      if (options && options.onClose) options.onClose()
    }
  }

  let submit = () => {
     let params = wpp.values()
     if (params) {
         wpp.command.exec(wpp.pm, params)
         close()
      }
  }

  wpp.pm.on("interaction", close)

  let save = elt("input",{name: "save", type: "button", value: "Save"})
  save.addEventListener("mousedown", e => { submit() })

  let cancel = elt("input",{name: "cancel", type: "button", value: "Cancel"})
  cancel.addEventListener("mousedown", e => {
    e.preventDefault(); e.stopPropagation()
    close()
  })

  let buttons = elt("div",{class: "widgetButtons"},save,cancel)
  wpp.form = elt("form",{class: "widgetForm"},
    elt("h4", null, wpp.command.label),
    wpp.fields.map(f => elt('div', {'class': 'prosemirror-prompt-row'},
      elt('label', {'class': 'prosemirror-prompt-row-label'}, f.placeholder, f))),
    buttons
  )

  // Submit if Enter pressed and all fields are valid
    wpp.form.addEventListener("keypress", e => {
      if (e.keyCode == 13) {
          e.preventDefault(); e.stopPropagation()
        save.click()
      }
   })

  let dialog = elt("div",{class: "ProseMirror-prompt"}, wpp.form)
  wpp.pm.wrapper.appendChild(dialog)
  return {close}
}
