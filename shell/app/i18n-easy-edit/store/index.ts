import { createStore } from 'core/cube';
import { getTranslation } from '../utils';

interface IState {
  ns: string | undefined;
  key: string | undefined;
  en: string | undefined;
  zh: string | undefined;
  isVisible: boolean; // edit modal visible
  isEditable: boolean;
  setTextCb: null | ((value: string) => {});
}

const initState: IState = {
  ns: undefined,
  key: undefined,
  en: undefined,
  zh: undefined,
  isVisible: false, // edit modal visible
  isEditable: false,
  setTextCb: null,
};
export default createStore({
  name: 'i18n-page-edit',
  state: initState,
  reducers: {
    resetState(state, ns: string, key: string, en?: string, zh?: string) {
      if (state.isEditable) {
        state.ns = ns;
        state.key = key;
        state.en = en || getTranslation(ns, key, 'en');
        state.zh = zh || getTranslation(ns, key, 'zh');
        state.isVisible = true;
      }
    },
    closeModel(state) {
      state.isVisible = false;
    },
    switchIsEditable(state, value: boolean) {
      state.isEditable = value;
    },
    setCurrentTextCb(state, callback) {
      state.setTextCb = callback;
    },
  },
});
