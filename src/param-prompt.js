import ExecutionEnvironment from 'exenv';

let elt = function(){};
if (ExecutionEnvironment.canUseDOM) {
  const ParamPrompt = require('prosemirror/dist/ui/prompt').ParamPrompt;
  const defineOption = require('prosemirror/dist/edit').defineOption;
  ({elt} = require('prosemirror/dist/dom'));

  // lifted from prosemirror-widgets
  class WidgetParamPrompt extends ParamPrompt {
    prompt() {
      return openWidgetPrompt(this,{onClose: () => this.close()});
    }
  }

  defineOption("commandParamPrompt", WidgetParamPrompt);
}


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
