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
