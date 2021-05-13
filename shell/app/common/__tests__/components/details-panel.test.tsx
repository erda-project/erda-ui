import React from 'react';
import { DetailsPanel } from 'common';
import { mount } from 'enzyme';
import { describe, it } from '@jest/globals';

const baseInfoConf = {
  title: 'DetailsPanel',
  panelProps: {
    fields: [
      {
        label: 'domain',
        value: 'https://www.erda.cloud',
      },
      {
        label: 'name',
        value: 'erda',
      },
    ],
  },
};

const props = {
  baseInfoConf,
  linkList: [
    {
      key: 'API',
      showTitle: true,
      linkProps: {
        title: 'API',
        icon: <div className="api-icon" />,
      },
      panelProps: {
        fields: [],
      },
    },
    {
      key: 'TEST',
      showTitle: false,
      linkProps: {
        title: 'TEST',
        icon: <div className="test-icon" />,
      },
      getComp: () => (<div className="get-comp">getComp</div>),
    },
  ],
};

describe('DetailsPanel', () => {
  it('should render well', () => {
    const wrapper = mount(
      <DetailsPanel
        {...props}
      />
    );
    expect(wrapper.find({ title: 'DetailsPanel' })).toExist();
    expect(wrapper.find('AnchorLink')).toHaveLength(2);
    expect(wrapper.find('.get-comp')).toExist();
    expect(wrapper.find('.api-icon')).toExist();
  });
});
