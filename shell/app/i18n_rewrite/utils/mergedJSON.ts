import _ from 'lodash';
// default
// erda-ui/locales
import en1 from '../../../../locales/en.json';
import zh1 from '../../../../locales/zh.json';

// default（uc 不需要用了）
// erda-ui/modules/uc/src/locales
// import en2 from '../../../../modules/uc/src/locales/en.json';
// import zh2 from '../../../../modules/uc/src/locales/zh.json';

// backup|charts|cmp|common|dop|ecp|layout|msp|publisher|resource|runtime|user
import en3 from 'app/locales/en.json';
import zh3 from 'app/locales/zh.json';

// 未写ns
import en4 from 'app/modules/dop/locales/en.json';
import zh4 from 'app/modules/dop/locales/zh.json';

// admin
// erda-ui-enterprise/admin/src/locales'
import en5 from '../../../../../erda-ui-enterprise/admin/src/locales/en.json';
import zh5 from '../../../../../erda-ui-enterprise/admin/src/locales/zh.json';

const enArr = [en1, en3, { default: en4 }, en5];
const zhArr = [zh1, zh3, { default: zh4 }, zh5];

const mergedEn = enArr.reduce((prev, curr) => _.merge(prev, curr), en1[0]);
const mergedZh = zhArr.reduce((prev, curr) => _.merge(prev, curr), zh1[0]);

export default {
  en: mergedEn,
  zh: mergedZh,
};
