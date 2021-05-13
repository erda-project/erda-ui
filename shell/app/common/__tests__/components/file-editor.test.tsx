import React from 'react';
import { FileEditor } from 'common';
import { mount } from 'enzyme';
import { describe, it, jest } from '@jest/globals';

const data = {
  name: 'erda',
  org: 'erda.cloud',
};

const dataStr = JSON.stringify(data, null, 2);

describe('FileEditor', () => {
  it('render editable', () => {
    jest.useFakeTimers();
    const fn = jest.fn();
    const extra = <div className="extra-action">extra</div>;
    const wrapper = mount(
      <FileEditor
        className="file-editor"
        readOnly={false}
        autoHeight
        actions={{ copy: true, format: true, extra }}
        value={dataStr}
        onChange={fn}
      />
    );

    expect(wrapper.find('.extra-action')).toExist();
    expect(wrapper.find({ title: 'copy' })).toExist();
    expect(wrapper.find({ title: 'format' })).toExist();
    wrapper.find({ type: 'sx' }).simulate('click');
    expect(fn).toHaveBeenLastCalledWith(dataStr);
  });
  it('render readOnly', () => {
    const wrapper = mount(
      <FileEditor fileExtension="md" className="file-editor" readOnly value={dataStr} />
    );
    expect(wrapper.find('pre').text()).toContain(dataStr);
  });
});
