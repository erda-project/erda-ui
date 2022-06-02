import { createStore } from 'core/cube';
import { getTranslation } from '../utils';

export interface I18nData {
  ns: string;
  key: string;
  en: string;
  zh: string;
}

export default createStore({
  name: 'i18n-page-edit',
  state: {
    ns: '',
    key: '',
    en: '',
    zh: '',
    isVisible: false, // edit modal visible
    isEditable: false,
    setTextCb: (value: string) => {
      value;
    },
  },
  reducers: {
    initState(state, ns: string, key: string, en?: string, zh?: string) {
      // reset state
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
