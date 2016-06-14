import MarkdownIt from 'markdown-it'
import {convertFromRaw} from 'draft-js'

function parseToken(token, struct) {
  if (token.type === 'paragraph_open') {
    struct.blocks.push({type: 'unstyled', depth: 0})
  }
  if (token.type === 'inline') {
    for(let j = 0; j < token.children.length; j += 1) {
      let inlineToken = token.children[j];
      parseToken(inlineToken, struct);
    }
  }
  if (token.type === 'text') {
    let lastBlock = struct.blocks[struct.blocks.length - 1]
    lastBlock.text = lastBlock.text || '';
    lastBlock.text += token.content;
  }

  if (token.type === 'em_open') {
    let lastBlock = struct.blocks[struct.blocks.length - 1]
    lastBlock.inlineStyleRanges = lastBlock.inlineStyleRanges || [];
    lastBlock.inlineStyleRanges.push({
      style: 'ITALIC',
      offset: lastBlock.text.length
    })
    // how do we inform the next text block that it appends to this inlineStyleRange?
  }
  if (token.type === 'em_close') {
    let lastBlock = struct.blocks[struct.blocks.length - 1]
    lastBlock.inlineStyleRanges = lastBlock.inlineStyleRanges.map(styleRange => {
      let lengthObject = {}
      if (styleRange.style === 'ITALIC') {
        let length = lastBlock.text.length - styleRange.offset
        lengthObject.length = length
      }
      let newRange = Object.assign({}, styleRange, lengthObject)
      return newRange
    })
  }

  if (token.type === 'strong_open') {
    let lastBlock = struct.blocks[struct.blocks.length - 1]
    lastBlock.inlineStyleRanges = lastBlock.inlineStyleRanges || [];
    lastBlock.inlineStyleRanges.push({
      style: 'BOLD',
      offset: lastBlock.text.length
    })
    // how do we inform the next text block that it appends to this inlineStyleRange?
  }
  if (token.type === 'strong_close') {
    let lastBlock = struct.blocks[struct.blocks.length - 1]
    lastBlock.inlineStyleRanges = lastBlock.inlineStyleRanges.map(styleRange => {
      let lengthObject = {}
      if (styleRange.style === 'BOLD') {
        let length = lastBlock.text.length - styleRange.offset
        lengthObject.length = length
      }
      let newRange = Object.assign({}, styleRange, lengthObject)
      return newRange
    })
  }

  if (token.type === 'link_open') {
    let lastBlock = struct.blocks[struct.blocks.length - 1]
    lastBlock.inlineStyleRanges = lastBlock.inlineStyleRanges || [];
    lastBlock.inlineStyleRanges.push({
      style: 'BOLD',
      offset: lastBlock.text.length
    })
    // how do we inform the next text block that it appends to this inlineStyleRange?
  }
  if (token.type === 'link_close') {
    let lastBlock = struct.blocks[struct.blocks.length - 1]
    lastBlock.inlineStyleRanges = lastBlock.inlineStyleRanges.map(styleRange => {
      let lengthObject = {}
      if (styleRange.style === 'BOLD') {
        let length = lastBlock.text.length - styleRange.offset
        lengthObject.length = length
      }
      let newRange = Object.assign({}, styleRange, lengthObject)
      return newRange
    })
  }
  // console.log(struct)
  return struct
}

export function parseMarkdown(markdownText) {
  md = new MarkdownIt()
  let structure = {blocks: [], entityMap: {}}
  const tree = md.parse(markdownText);
  for (let i = 0; i < tree.length; i += 1) {
    let token = tree[i];
    structure = parseToken(token, structure)
  }
  const contentBlock = convertFromRaw(structure);
  console.log(contentBlock.getFirstBlock())
  window.raw = contentBlock
  return contentBlock;
}

