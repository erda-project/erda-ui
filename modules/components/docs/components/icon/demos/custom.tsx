import React from 'react';
import { ErdaIcon, useErdaIcon } from '@erda-ui/components';

export default () => {
  useErdaIcon({
    url: '//at.alicdn.com/t/font_500774_mn4zbo4c94.js',
  });

  return <ErdaIcon type="aliyun" />;
};
