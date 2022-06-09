import { erdaEnv } from 'common/constants';
import { isAccessFromLocalStorage } from './utils';
export { default as overwriteT } from './utils/overwrite-i18n';
export { default as I18nEasyEditPage } from './pages';

// export const isAccess = erdaEnv.I18N_ACCESS_ENV === 'true' && isAccessFromLocalStorage;
export const isAccess = isAccessFromLocalStorage();
