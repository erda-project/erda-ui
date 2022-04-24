module.exports = {
  '*.{ts,tsx},!.umirc.ts': 'eslint --cache --fix --max-warnings=0',
  '**/*.ts?(x)': () => 'tsc --noEmit',
};
