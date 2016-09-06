var unicode = require('emoji-unicode-map')

export let emojiByName: {[name: string]: string} = {}

// custom emoji replacements
unicode.emoji['🚩'] = 'flag'

for (let codePoint in unicode.emoji) {
  const name = unicode.emoji[codePoint]
  emojiByName[name] = codePoint
}
