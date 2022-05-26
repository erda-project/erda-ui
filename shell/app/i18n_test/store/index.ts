import { createStore } from 'core/cube';

export default createStore({
  name: 'count',
  state: {
    key: '',
    isModelVisible: false,
  },
  reducers: {
    changeKey(state, newKey: string) {
      state.key = newKey;
      console.log(state.key, '123');
    },
  },
  effects: {},
});
