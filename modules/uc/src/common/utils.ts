import { i18n } from 'src/common';

export const getValidText = (v?: string, validType?: 'phone' | 'email') => {
  const validMap = {
    phone: {
      pattern: /^(1[3|4|5|7|8|9])\d{9}$/,
      message: i18n.t('Please enter the correct {name}', { name: i18n.t('mobile') }),
    },
    email: {
      pattern: /^(\w-*\.*)+@(\w-?)+(\.\w{2,})+$/,
      message: i18n.t('Please enter the correct {name}', { name: i18n.t('email') }),
    },
  };

  if (!!v) {
    const curValid = validType && validMap[validType];
    return curValid && !curValid.pattern.test(v) ? curValid.message : '';
  } else {
    return i18n.t('can not be empty');
  }
};

export const getErrorValid = <T>(errorRes: UC.IErrorRes): Partial<T> => {
  const errRes: UC.IErrorRes = errorRes;
  const uiMsg = errRes?.ui?.messages?.[0]?.text;
  if (uiMsg) {
    return { page: uiMsg } as unknown as Partial<T>;
  } else {
    const uiNodes = errRes?.ui?.nodes;
    const errTips: Partial<T> = {};
    uiNodes?.forEach((errNode) => {
      const nodeErrMsg = errNode?.messages?.[0]?.text;
      const curKey = errNode?.attributes?.type as keyof T;
      if (nodeErrMsg && curKey) {
        errTips[curKey] = nodeErrMsg as unknown as T[keyof T];
      }
    });
    return { page: '', ...errTips };
  }
};
