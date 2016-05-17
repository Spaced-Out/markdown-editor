# spacedout-editor

exports a default editor that uses markdown and some extensions we've made:

    <MarkdownEditor value="ohai {name}" dynamicLabels={['name', 'email']}/>

This will make an editor that will use name/email for dynamic labels.

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

![](http://dl.dropboxusercontent.com/u/406291/Screenshots/qL8j.png)

#### integrating dynamic-text.js

included here is a ProseMirror inline plugin called `DynamicText` that uses `curly.js` to support serializing between markdown. This means that in `<MarkdownEditor />` when you use `{text}`, it will be assumed to be a dynamic label.

currently, `dynamic-text.js` exports two methods: either the class `DynamicText` (which you need to register a command on in order to see it in the menu) or (annotated with flow types)

    dynamicTextWithLabels(labels: string[]): DynamicText

which is used by `<MarkdownEditor />` if any labels are passed in.

