import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErdaIcon, { ErdaIconProps, useErdaIcon } from '../../src/icon';

const TestIconComp = (props: ErdaIconProps<'green' | 'red'>) => {
  useErdaIcon({
    url: '//at.alicdn.com/t/font_500774_mn4zbo4c94.js',
    colors: {
      green: '#52C41A',
    },
  });

  return <ErdaIcon {...props} />;
};

describe('test Erda Icon', () => {
  it('render basic icon', () => {
    const { container } = render(<TestIconComp type="chinese" />);
    const iconDom = container.querySelector('.erda-icon > use');
    expect(iconDom?.getAttribute('xlink:href')?.includes('#icon-chinese')).toBeTruthy();
  });
  it('render predefine color icon', () => {
    const { container } = render(<TestIconComp type="aliyun" />);
    const iconDom = container.querySelector('.erda-icon > use');
    expect(iconDom?.getAttribute('xlink:href')?.includes('#icon-aliyun')).toBeTruthy();
  });
});
