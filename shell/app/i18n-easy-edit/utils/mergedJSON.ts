// 1. default
import en1 from '../../../../locales/en.json';
import zh1 from '../../../../locales/zh.json';

// 2. backup|charts|cmp|common|dop|ecp|layout|msp|publisher|resource|runtime|user
import en2 from 'app/locales/en.json';
import zh2 from 'app/locales/zh.json';

// 3. admin
import en3 from '../../../../../erda-ui-enterprise/admin/src/locales/en.json';
import zh3 from '../../../../../erda-ui-enterprise/admin/src/locales/zh.json';

// make sure the path is correspond to the imported object
export default {
  'erda-ui/locales': {
    en: en1,
    zh: zh1,
  },
  'erda-ui/shell/app/locales': {
    en: en2,
    zh: zh2,
  },
  'erda-ui-enterprise/admin/src/locales': {
    en: en3,
    zh: zh3,
  },
};
