# spacedout-editor

`spacedout-editor` might as well be a fork of [prosemirror-react](https://github.com/tgecho/react-prosemirror), but the main difference is that `spacedout-editor` needs to build correctly in isomorphic environments, so for that reason, it uses [exenv](https://github.com/JedWatson/exenv) to gate all the dom-needy bits of prosemirror.

Currently it exports a default editor that uses markdown and some extensions we've made:

    <MarkdownEditor value="ohai {name}" dynamicLabels={['name', 'email']}/>

This will make an editor that will use name/email for dynamic labels (the extension can be found at `src/dynamic-text.js`).

**By default** the editor will treat `value` to be markdown text that can be parsed by `markdown-it` there is no option to change that yet.

## customizing dynamic labels

#### styling

dynamic labels, used for something like mail-merge, are rendered by prosemirror as

    <span data-dynamic-label="email" class="prosemirrror-dynamic-label">email</span>

to customize the display, you should include some css, as follows:

    .prosemirror-dynamic-label {
      font-weight: bold;
    }
    .prosemirror-dynamic-label:before {
      content: '{';
    }
    .prosemirror-dynamic-label:after {
      content: '}';
    }

for example, which will render as

![](http://dl.dropboxusercontent.com/u/406291/Screenshots/k4HZ.png)

#### integrating dynamic-text.js

included here is a ProseMirror inline plugin called `DynamicText` that uses `curly.js` to support serializing between markdown. This means that in `<MarkdownEditor />` when you use `{text}`, it will be assumed to be a dynamic label. if `autoInput` is supported in your prosemirror instance, then any curly-bracketed text input will be automatically transformed to a dynamic token if `dynamicTextWithLabels` is used.

currently, `dynamic-text.js` exports three things:

1. the class `DynamicText` (which, if you only use this, you *need* to register a Command on it in order to see it anywhere)
2. `dynamicMenu` a `Dropdown` with a `MenuCommandGroup` called `dynamic`. You should see how this is used in src/index.js
3. a method `dynamicTextWithLabels` which mutates DynamicText (here, fake-annotated with flow types) and adds submenu items to `dynamicMenu` that insert one of the labels passed in.

  `dynamicTextWithLabels(labels: string[]): DynamicText`

  which is used by `<MarkdownEditor />` if any labels are passed in, it registers commands for each of the labels, which, in turn, show up as submenu items under the main "Insert Dynamic Labels..." menu, as in the above screenshot.

