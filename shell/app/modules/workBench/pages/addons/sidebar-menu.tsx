import { Icon as CustomIcon } from 'common';
import { Config } from '@icon-park/react';
import i18n from 'i18n';
import React from 'react';

export const getSideMenu = ({ rootPath }: { rootPath: string }) => {
  const sideMenu = [
    {
      href: `${rootPath}/overview`,
      icon: <CustomIcon type='overview' />,
      text: i18n.t('workBench:addon info'),
    },
    {
      href: `${rootPath}/settings`,
      icon: <Config />,
      text: i18n.t('workBench:addon setting'),
    },
  ];
  return sideMenu;
};
