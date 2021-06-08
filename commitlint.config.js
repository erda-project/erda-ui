module.exports = {
  extends: ['ali'],
  rules: {
    'type-enum': [2, 'always', ['feat', 'fix', 'refactor', 'docs', 'style', 'perf', 'test', 'chore', 'revert', 'WIP']],
    'type-case': [1, 'always', 'snake-case'],
  },
};
