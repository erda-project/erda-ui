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

/* eslint-disable no-template-curly-in-string */
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import ConfigProvider from '../../src/context-provider';
import Pagination from '../../src/pagination';
import zhCN from '../../src/locale/zh_CN';

describe('ConfigProvider', () => {
  it('should render en well', async () => {
    const onChange = jest.fn();
    render(
      <ConfigProvider>
        <Pagination total={99} pageSize={10} onChange={onChange} current={1} />
      </ConfigProvider>,
    );
    expect(screen.getByText('Totally 99 items')).toBeInTheDocument();
  });
  it('should render zh well', async () => {
    const onChange = jest.fn();
    render(
      <ConfigProvider locale={zhCN}>
        <Pagination total={99} pageSize={10} onChange={onChange} current={1} />
      </ConfigProvider>,
    );
    expect(screen.getByText('共 99 条')).toBeInTheDocument();
  });
  it('should render zh custom well', async () => {
    const onChange = jest.fn();
    render(
      <ConfigProvider locale={{ ...zhCN, Pagination: { ...zhCN.Pagination, totalText: '我这里有${total}个东西' } }}>
        <Pagination total={99} pageSize={10} onChange={onChange} current={1} />
      </ConfigProvider>,
    );
    expect(screen.getByText('我这里有99个东西')).toBeInTheDocument();
  });
});
