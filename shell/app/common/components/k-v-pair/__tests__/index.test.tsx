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
import { fireEvent, render } from '@testing-library/react';
import '@testing-library/jest-dom';
import KVPair from '..';

const DefaultComp = ({ record, keyName, update, ...rest }: any) => (
  <input
    maxLength={100}
    value={record[keyName]}
    className={rest.keydesc}
    onChange={(e) => update(e.target.value)}
    {...rest}
  />
);

describe('KVPair', () => {
  const defaultValue = [
    {
      key: 'name',
      value: 'erda-dev',
    },
    {
      key: 'env',
      value: 'dev',
    },
    {
      key: 'org',
      value: 'erda',
    },
  ];

  const defaultProps = {
    keyName: 'key',
    descName: 'desc',
    valueName: 'value',
    keyDesc: 'keyDesc',
  };

  const renderChildren = ({ CompList, fullData }) => {
    return (
      <div>
        {CompList.map((item, index) => {
          const line = `line-${index + 1}`;
          return (
            <div className="key-val-item" key={fullData[index].key || index}>
              <div className={`Key ${line}`}>{item.Key}</div>
              <div className={`Value ${line}`}>{item.Value}</div>
              <div className={`Desc ${line}`}>{item.Desc}</div>
              <div className={`KeyDescComp ${line}`}>{item.KeyDescComp}</div>
              <div className={`Op ${line}`}>{item.Op}</div>
            </div>
          );
        })}
      </div>
    );
  };

  it('should work well', () => {
    const changeFn = jest.fn();
    const result = render(
      <KVPair {...defaultProps} value={defaultValue} onChange={changeFn} autoAppend>
        {renderChildren}
      </KVPair>,
    );
    expect(result.container).isExist('.key-val-item', defaultValue.length);
    result.rerender(
      <KVPair {...defaultProps} value={defaultValue} onChange={changeFn} autoAppend compProps={{ disabled: true }}>
        {renderChildren}
      </KVPair>,
    );
    expect(result.container.querySelector('[name="delete1"]')).toHaveClass('not-allowed');
    fireEvent.click(result.container.querySelector('[name="delete1"]')!);
    expect(changeFn).toHaveBeenCalledTimes(0);
    result.rerender(
      <KVPair
        {...defaultProps}
        value={defaultValue}
        onChange={changeFn}
        autoAppend
        DescComp={DefaultComp}
        KeyDescComp={DefaultComp}
      >
        {renderChildren}
      </KVPair>,
    );
    fireEvent.click(result.container.querySelector('[name="delete1"]')!);
    expect(changeFn).toHaveBeenLastCalledWith([
      { key: 'env', value: 'dev' },
      { key: 'org', value: 'erda' },
      { desc: '', key: '', keyDesc: '', value: '' },
    ]);
  });
  it('should render with empty value', () => {
    const changeFn = jest.fn();
    const result = render(
      <KVPair
        value={[]}
        onChange={changeFn}
        emptyHolder
        autoAppend
        DescComp={DefaultComp}
        KeyDescComp={DefaultComp}
        compProps={{ disabled: true }}
      >
        {renderChildren}
      </KVPair>,
    );
    const data = {
      key: 'environment',
      value: 'test',
      desc: 'this env is used to test',
      keyDesc: 'configuration environment',
    };
    fireEvent.change(result.getAllByRole('textbox')[0], { target: { value: data.key } });
    fireEvent.change(result.getAllByRole('textbox')[1], { target: { value: data.value } });
    fireEvent.change(result.getAllByRole('textbox')[2], { target: { value: data.desc } });
    fireEvent.change(result.getAllByRole('textbox')[3], { target: { value: data.keyDesc } });
    expect(changeFn).toHaveBeenLastCalledWith([data, { key: '', value: '', desc: '', keyDesc: '' }]);
  });
});
