import React from 'react';
import { KeyValueEditor } from 'common';
import { Form } from 'app/nusi';
import { mount } from 'enzyme';
import { describe, it } from '@jest/globals';

const data = {
  env: 'test',
  org: 'erda',
  name: 'erda.cloud',
};

const Comp = Form.create()((props) => {
  return (
    <KeyValueEditor
      {...props}
    />
  );
});

describe('KeyValueEditor', () => {
  it('should render well', () => {
    const wrapper = mount(
      <Comp
        dataSource={data}
      />
    );
    const editor = wrapper.find('KeyValueEditor');
    expect(wrapper.find('KeyValueTable')).toExist();
    expect(wrapper.find('KeyValueTextArea')).not.toExist();
    expect(editor.instance().getEditData()).toStrictEqual(data);
    wrapper.find('RadioGroup').prop('onChange')();
    editor.update();
    expect(wrapper.find('KeyValueTable')).not.toExist();
    expect(wrapper.find('KeyValueTextArea')).toExist();
    expect(editor.instance().getEditData()).toStrictEqual(data);
    wrapper.find('RadioGroup').prop('onChange')();
    editor.update();
  });
});
