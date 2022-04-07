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
import { act, render, waitFor } from '@testing-library/react';
import { message, UploadProps } from 'antd';
import { UploadChangeParam } from 'antd/lib/upload/interface';
import userEvent from '@testing-library/user-event';
import agent from 'agent';
import { flushPromises } from 'test/utils';
import UploadPlugin from '../upload-plugin';

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
          const response = {};
          onChange?.({
            ...data,
            file: {
              status: 'success',
              response: file.name
                ? {
                    success: true,
                    err: {},
                    data: {
                      ...file,
                      url: 'filePath',
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

describe('UploadPlugin', () => {
  const images = new File(['this is an images'], 'logo.png', {
    type: 'image/png',
  });
  beforeAll(() => {
    jest.mock('agent');
    agent.post = () => ({
      send: jest.fn().mockResolvedValue({
        body: {
          success: true,
          data: {
            url: 'img/path',
          },
        },
      }),
    });
  });
  afterAll(() => {
    jest.resetAllMocks();
  });
  it('should work well', async () => {
    const spyOnError = jest.spyOn(message, 'error');

    const insertTextFn = jest.fn();
    const result = render(
      <UploadPlugin
        editor={{
          insertText: insertTextFn,
        }}
      />,
    );
    userEvent.hover(result.getByLabelText('icon: fujian'));
    await waitFor(() => expect(result.queryByText('add annex')).not.toBeNull());
    const imageUpload = result.getByText('image upload').previousElementSibling as HTMLElement;
    imageUpload.style.pointerEvents = 'auto';
    await act(async () => {
      userEvent.upload(imageUpload, images);
      await flushPromises();
    });
    expect(insertTextFn).toHaveBeenLastCalledWith('\n![logo.png（17）](filePath)\n');
    spyOnError.mockClear();
  });
});
