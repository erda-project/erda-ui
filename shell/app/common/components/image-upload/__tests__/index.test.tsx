// Copyright (c) 2021 Terminus, Inc.
//
// This program is free software: you can use, redistribute, and/or modify
// it under the terms of the GNU Affero General Public License, version 3
// or later ("AGPL"), as published by the Free Software Foundation.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
// FITNESS FOR A PARTICULAR PURPOSE.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program. If not, see <http://www.gnu.org/licenses/>.

import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { flushPromises } from 'test/utils';
import '@testing-library/jest-dom';
import { UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import ImageUpload from '..';

jest.mock('antd', () => {
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const React = require('react');
  // eslint-disable-next-line @typescript-eslint/no-shadow
  const antd = jest.requireActual('antd');
  const OldUpload = antd.Upload;
  const Upload: React.FC<UploadProps> = ({ children, onChange, ...rest }) => {
    return (
      <OldUpload
        {...rest}
        onChange={(data: UploadChangeParam) => {
          const file = data.file;
          onChange?.({
            ...data,
            file: {
              ...file,
              response: file.name
                ? {
                    data: {
                      url: imgUrl,
                    },
                  }
                : undefined,
            },
          });
        }}
      >
        {children}
      </OldUpload>
    );
  };
  return {
    ...antd,
    Upload,
  };
});

const hintText = 'this is a hint text';
const imgUrl = 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png';
const imgUrlWithoutProtocol = imgUrl.replace(/^http(s)?:/g, '');
const file = new File(['logo file'], 'logo.png', {
  type: 'image/png',
});

describe('ImageUpload', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should work well with single', async () => {
    const afterUploadFn = jest.fn();
    const setFieldsValue = jest.fn();
    const result = render(
      <ImageUpload
        form={{ setFieldsValue }}
        afterUpload={afterUploadFn}
        showHint
        hintText={hintText}
        id="singleUpload"
      />,
    );
    expect(result.getByText(hintText)).toBeTruthy();
    expect(result.container).isExist('.pure-upload', 1);
    const inp = result.container.querySelector('[type="file"]')!;
    userEvent.upload(inp, file);
    await waitFor(() => expect(setFieldsValue).toHaveBeenCalledWith({ singleUpload: imgUrlWithoutProtocol }));
    expect(afterUploadFn).toHaveBeenLastCalledWith(imgUrlWithoutProtocol);
    result.rerender(
      <ImageUpload
        form={{ setFieldsValue }}
        afterUpload={afterUploadFn}
        showHint
        id="singleUpload"
        value={imgUrlWithoutProtocol}
      />,
    );
    expect(result.getByAltText('upload')).toHaveAttribute('src', imgUrlWithoutProtocol);
    expect(result.container).isExist('[name="shanchu"]', 1);
    fireEvent.click(result.getByText('Remove'));
    expect(setFieldsValue).toHaveBeenCalledWith({ singleUpload: undefined });
    expect(afterUploadFn).toHaveBeenLastCalledWith(undefined);
  });
  it('should work well with multi', async () => {
    const afterUploadFn = jest.fn();
    const setFieldsValue = jest.fn();
    const result = render(
      <ImageUpload id="multiUpload" form={{ setFieldsValue }} afterUpload={afterUploadFn} isMulti />,
    );
    const inp = result.container.querySelector('[type="file"]')!;
    userEvent.upload(inp, file);
    await waitFor(() => expect(setFieldsValue).toHaveBeenCalledWith({ multiUpload: [imgUrlWithoutProtocol] }));
    expect(afterUploadFn).toHaveBeenLastCalledWith([imgUrlWithoutProtocol]);
    result.rerender(
      <ImageUpload
        form={{ setFieldsValue }}
        afterUpload={afterUploadFn}
        showHint
        id="multiUpload"
        isMulti
        value={[imgUrlWithoutProtocol]}
      />,
    );
    expect(result.container).isExist('[name="shanchu"]', 1);
    fireEvent.click(result.getByText('Remove'));
    expect(setFieldsValue).toHaveBeenCalledWith({ multiUpload: [] });
    expect(afterUploadFn).toHaveBeenLastCalledWith([]);
  });
  it('should work well with no response', async () => {
    const afterUploadFn = jest.fn();
    const setFieldsValue = jest.fn();
    const result = render(<ImageUpload id="noResponse" form={{ setFieldsValue }} afterUpload={afterUploadFn} />);
    const inp = result.container.querySelector('[type="file"]')!;
    userEvent.upload(
      inp,
      new File(['logo file'], '', {
        type: 'image/png',
      }),
    );
    await flushPromises();
    expect(setFieldsValue).not.toHaveBeenCalled();
  });
});
