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
  const Upload: React.FC<UploadProps> = ({ children, onChange }) => {
    return (
      <label>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onChange?.({
              file: {
                ...file,
                status: 'success',
                response: {
                  success: true,
                  err: {},
                  data: {
                    name: file.name,
                    size: file.size,
                    url: 'filePath',
                  },
                },
              },
            } as UploadChangeParam);
          }}
          style={{ display: 'none' }}
        />
        {children}
      </label>
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
  const kbFile = new File([new ArrayBuffer(1024)], 'small.bin', {
    type: 'application/octet-stream',
  });
  const mbFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'big.bin', {
    type: 'application/octet-stream',
  });
  const decimalFile = new File([new Uint8Array(1500)], 'decimal.bin', {
    type: 'application/octet-stream',
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
    await waitFor(() => expect(result.queryByText('Add Attachment')).not.toBeNull());
    const imageUpload = result.getByText('Upload Image').previousElementSibling as HTMLElement;
    imageUpload.style.pointerEvents = 'auto';
    await act(async () => {
      userEvent.upload(imageUpload, images);
      await flushPromises();
    });
    expect(insertTextFn).toHaveBeenLastCalledWith('\n![logo.png（17 B）](filePath)\n');

    await act(async () => {
      userEvent.upload(imageUpload, kbFile);
      await flushPromises();
    });
    expect(insertTextFn).toHaveBeenLastCalledWith('\n![small.bin（1 KB）](filePath)\n');

    await act(async () => {
      userEvent.upload(imageUpload, mbFile);
      await flushPromises();
    });
    expect(insertTextFn).toHaveBeenLastCalledWith('\n![big.bin（2 MB）](filePath)\n');

    await act(async () => {
      userEvent.upload(imageUpload, decimalFile);
      await flushPromises();
    });
    expect(insertTextFn).toHaveBeenLastCalledWith('\n![decimal.bin（1.46 KB）](filePath)\n');
    spyOnError.mockClear();
  });
});
