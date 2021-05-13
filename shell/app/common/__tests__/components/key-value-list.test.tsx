import React from 'react';
import { KeyValueList } from 'common';
import { mount } from 'enzyme';
import { describe, it } from '@jest/globals';

const data = {
  name: 'erda',
  listStr: ['test', 'dev'],
  list: [
    {
      scopeInList: 'global',
    },
    {
      envMapInList: {
        devInList: 'DEV',
        testInList: 'TEST',
      },
    },
  ],
  obj: {
    scopeInObj: 'global',
    envMapInObj: {
      devInObj: 'DEV',
      testInObj: 'TEST',
    },
  },
};

describe('KeyValueList', () => {
  const textRender = (k:string, v:string) => (
    <div className="text-render">
      <div className="text-render-key">{k}</div>
      <div className="text-render-value">{v}</div>
    </div>
  );
  const listRender = (list: string[]) => (
    <div className="list-render">
      {
        (list || []).map(item => {
          return (
            <span className="list-render-item" key={item}>{item}</span>
          );
        })
      }
    </div>
  );
  it('should render with customizeRender', () => {
    const wrapper = mount(
      <KeyValueList
        data={data}
        title="KeyValueList-title"
        shrink
        textRender={textRender}
        listRender={listRender}
      />
    );
    expect(wrapper.find('.title').at(0).text()).toBe('KeyValueList-title');
    expect(wrapper.find('.text-render')).toExist();
    expect(wrapper.find('.list-render')).toExist();
    expect(wrapper.find('.k-v-row')).toHaveLength(8);
  });
  it('should render with defaultRender', () => {
    const wrapper = mount(
      <KeyValueList
        data={data}
        title="KeyValueList-title"
        shrink
      />
    );
    expect(wrapper.find('.text-render')).not.toExist();
    expect(wrapper.find('.list-render')).not.toExist();
    expect(wrapper.find('.k-v-row')).toHaveLength(8);
  });
});
