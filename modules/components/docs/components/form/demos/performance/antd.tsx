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
import { InputNumber, Form } from 'antd';

const CustomComp = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  // eslint-disable-next-line no-console
  console.log('render child');
  return <InputNumber style={{ width: '100%' }} value={value} onChange={onChange} />;
};

const list = new Array(300)
  .toString()
  .split(',')
  .map((_item, index) => index);

export default () => {
  const [count, setCount] = React.useState(0);
  const [array, setArray] = React.useState(new Array(300));

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    const result = array.reduce((acc, item) => acc + (item || 0), 0);
    setCount(result);
  }, [array]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: '#eee',
        padding: '40px 0',
        height: '300px',
        overflow: 'auto',
      }}
    >
      <div style={{ marginBottom: '16px' }}>总和： {count}</div>
      <Form style={{ width: '70%' }}>
        {list.map((i, index) => (
          <Form.Item key={i} label={`字段${i}`} name={`field${i}`}>
            {/*  @ts-ignore no fix */}
            <CustomComp
              onChange={(v) => {
                array[index] = v;
                setArray([...array]);
              }}
            />
          </Form.Item>
        ))}
      </Form>
    </div>
  );
};
