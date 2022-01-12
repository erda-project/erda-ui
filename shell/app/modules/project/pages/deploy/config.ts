import i18n from 'i18n';

export const ConfigTabs = {
  text: { key: 'text', text: i18n.t('common:text type') },
  other: { key: 'other', text: i18n.t('common:other type') },
};

export const ConfigTypeMap = {
  kv: { key: 'kv', text: i18n.t('value') },
  'dice-file': { key: 'dice-file', text: i18n.t('file') },
};

export const deployOrderStatusMap = {
  WAITDEPLOY: { text: i18n.t('runtime:waiting for deployment'), status: 'default', op: 'start' },
  DEPLOYING: { text: i18n.t('running'), status: 'processing', op: 'cancel' },
  OK: { text: i18n.t('succeed'), status: 'success', op: '' },
  FAILED: { text: i18n.t('failed'), status: 'error', op: 'restart' },
  CANCELED: { text: i18n.t('canceled'), status: 'warning', op: 'restart' },
};
