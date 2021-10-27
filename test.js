const defaultLocale = require('./locales/zh.json').default;
const targetLocale = require('./shell/app/locales/zh.json');

const shareWords = new Map();

Object.keys(targetLocale).forEach((key) => {
  const nsWord = targetLocale[key];
  for (const word of Object.keys(nsWord)) {
    if (defaultLocale[word] === nsWord[word]) {
      if (shareWords.has(key)) {
        shareWords.get(key).push(word);
      } else {
        shareWords.set(key, [word]);
      }
    }
  }
});
console.log('🚀 ~ file: test.js ~ line 5 ~ shareWords', shareWords);
