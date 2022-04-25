import React from 'react';
import { ErdaIcon, useErdaIcon } from '@erda-ui/components';

export default () => {
  useErdaIcon({
    colors: {
      green: '#52C41A',
    },
  });

  return <ErdaIcon type="bell" color="green" size="36px" />;
};
