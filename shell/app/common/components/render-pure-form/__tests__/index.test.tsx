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
import { Form } from 'antd';
import { render } from '@testing-library/react';
import RenderPureForm from '..';

type IProps = RenderPureForm['props'];

describe('RenderPureForm', () => {
  const list = [
    {
      name: 'id',
      type: 'hidden',
      subList: [
        {
          type: 'input',
          label: 'USER_ID',
          name: 'userId',
          itemProps: {},
        },
      ],
    },
    {
      type: 'input',
      label: 'NAME',
      name: 'name',
    },
    {
      label: 'INFO',
      name: 'info',
      getComp: ({ children, ...props }) => {
        return (
          <div {...props} className="custom-comp-wrap">
            {children}
          </div>
        );
      },
      subList: [
        [],
        [
          {
            type: 'input',
            label: 'AGE',
            name: 'age',
            itemProps: {},
          },
          {
            label: 'GENDER',
            name: 'gender',
            itemProps: { type: 'hidden' },
          },
        ],
      ],
    },
  ];
  const Comp = (props: Omit<IProps, 'form'>) => {
    const [form] = Form.useForm();
    return <RenderPureForm {...props} form={form} />;
  };
  it('should render well', () => {
    const result = render(<Comp list={list} />);
    expect(result.container).isExit('.ant-form-item', 3);
    expect(result.container).isExit('.custom-comp-wrap', 1);
    expect(result.container).isExit('form', 1);
    result.rerender(<Comp list={list} onlyItems />);
    expect(result.container).isExit('form', 0);
  });
});
