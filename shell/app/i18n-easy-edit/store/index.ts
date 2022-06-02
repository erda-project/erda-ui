import { createStore } from 'core/cube';
import { getTranslation } from '../utils';

interface IState {
  ns: string | null;
  key: string | null;
  en: string | null;
  zh: string | null;
  isVisible: boolean;
  isEditable: boolean;
  setTextCb: null | ((value: string) => void);
}

const initState: IState = {
  ns: null,
  key: null,
  en: null,
  zh: null,
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
    closeModal(state) {
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
