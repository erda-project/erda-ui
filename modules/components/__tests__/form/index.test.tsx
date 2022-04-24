import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import Form, { ArrayFieldType } from 'src/form';
import { Input, Select, Space, Button } from 'antd';

const {
  createForm,
  takeAsyncDataSource,
  connect,
  mapProps,
  observer,
  RecursionField,
  useFieldSchema,
  useField,
  createFields,
  createTabsField,
  createFormStep,
  createStepField,
  FormProvider,
  FormConsumer,
  ArrayTabs,
} = Form;

describe('erda form test', () => {
  it('render basic form', async () => {
    const form = createForm();
    const fieldsConfig = [
      {
        component: Input,
        title: '姓名',
        name: 'username',
        customProps: {
          placeholder: '请输入姓名',
        },
      },
    ];

    const { getByText } = render(<Form form={form} fieldsConfig={fieldsConfig} />);
    expect(getByText('姓名')).toBeInTheDocument();
  });

  it('render async form', async () => {
    const FormSelect = connect(
      Select,
      mapProps({
        dataSource: 'options',
      }),
    );
    const form = createForm({
      effects: () => {
        takeAsyncDataSource<Array<{ label: string; value: string }>>(
          'province',
          (_field) =>
            new Promise<Array<{ value: string; label: string }>>((resolve) => {
              resolve([
                {
                  value: 'zhejiang',
                  label: '浙江',
                },
                {
                  value: 'taiwan',
                  label: '台湾',
                },
              ]);
            }),
        );
      },
    });
    const fieldsConfig = [
      {
        component: FormSelect,
        title: '省份',
        name: 'province',
        customProps: {
          placeholder: '请选择省份',
        },
      },
    ];

    const { getByText } = render(<Form form={form} fieldsConfig={fieldsConfig} />);
    userEvent.click(getByText('请选择省份'));
    await waitFor(() => expect(screen.getByText('台湾')).toBeInTheDocument());
  });

  it('render array field', async () => {
    interface DataType {
      name: string;
      age: string;
    }
    const ArrayItems = observer((props: { value: DataType[] }) => {
      const schema = useFieldSchema();
      const field = useField<ArrayFieldType>();
      return (
        <div>
          {props.value?.map((_item, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <div key={index} style={{ marginBottom: 10 }}>
              <Space>
                <RecursionField schema={schema.items! as any} name={index} />
                <Button
                  onClick={() => {
                    field.remove(index);
                  }}
                  style={{ marginBottom: '22px' }}
                >
                  Remove
                </Button>
                <Button
                  onClick={() => {
                    field.moveUp(index);
                  }}
                  style={{ marginBottom: '22px' }}
                >
                  Up
                </Button>
                <Button
                  onClick={() => {
                    field.moveDown(index);
                  }}
                  style={{ marginBottom: '22px' }}
                >
                  Down
                </Button>
              </Space>
            </div>
          ))}
          <Button
            onClick={() => {
              field.push({});
            }}
          >
            Add
          </Button>
        </div>
      );
    });
    const form = createForm();
    const fieldsConfig = createFields([
      {
        type: 'array',
        component: ArrayItems,
        name: 'arrayField',
        items: [
          {
            component: Input,
            name: 'name',
            title: '姓名',
          },
          {
            component: Input,
            name: 'age',
            label: '年龄',
          },
        ],
      },
    ]);

    const { container } = render(<Form form={form} fieldsConfig={fieldsConfig} />);
    userEvent.click(screen.getByText('Add'));
    userEvent.click(screen.getByText('Add'));
    expect(container.getElementsByClassName('ant-input')).toHaveLength(4);
  });

  it('render custom field', async () => {
    const form = createForm();
    const CustomComp = ({
      value,
      onChange,
    }: {
      value: string;
      onChange: React.ChangeEventHandler<HTMLInputElement>;
    }) => {
      const [count, setCount] = React.useState(0);

      React.useEffect(() => {
        setCount(value?.length);
      }, [value]);

      return (
        <div style={{ display: 'flex', paddingLeft: '16px' }}>
          <div>{count}</div>
          <Input value={value} onChange={onChange} />
        </div>
      );
    };

    const fieldsConfig = createFields([
      {
        title: '自定义组件',
        component: CustomComp,
        name: 'customValue',
      },
      {
        title: '自定义组件2',
        component: CustomComp,
        name: 'customValue2',
      },
    ]);

    render(<Form form={form} fieldsConfig={fieldsConfig} />);
    expect(screen.getByText('自定义组件2')).toBeInTheDocument();
  });

  it('render step form', async () => {
    const form = createForm();
    const formStep = createFormStep();
    const fieldsConfig = createStepField(
      [
        {
          stepName: 'first',
          layoutConfig: { layout: 'vertical' },
          fields: [
            {
              component: Input,
              title: '姓名',
              name: 'username',
              customProps: {
                placeholder: '请输入姓名',
              },
              required: true,
            },
          ],
          customProps: {
            title: '第一步',
          },
        },
        {
          stepName: 'second',
          layoutConfig: { layout: 'horizontal' },
          fields: [
            {
              component: Input,
              title: '年龄',
              name: 'age',
              customProps: {
                placeholder: '请输入年龄',
              },
            },
          ],
          customProps: {
            title: '第二步',
          },
        },
        {
          stepName: 'third',
          gridConfig: { minColumns: 2 },
          fields: [
            {
              component: Input,
              title: '性别',
              name: 'sex',
              customProps: {
                placeholder: '请输入性别',
              },
            },
            {
              component: Input,
              title: '学历',
              name: 'education',
              customProps: {
                placeholder: '请输入学历',
              },
            },
          ],
          customProps: {
            title: '第三步',
          },
        },
      ],
      {
        formStep,
        name: 'formSteps',
      },
    );

    const { getByText, container } = render(
      <FormProvider form={form}>
        <Form style={{ width: '80%' }} form={form} fieldsConfig={[fieldsConfig]} />
        <FormConsumer>
          {() => {
            return (
              <div>
                {formStep?.allowBack && (
                  <Button
                    onClick={() => {
                      formStep.back();
                    }}
                  >
                    上一步
                  </Button>
                )}
                {formStep?.allowNext && (
                  <Button
                    onClick={() => {
                      formStep.next();
                    }}
                  >
                    下一步
                  </Button>
                )}
                {!formStep?.allowNext && <Button>提交</Button>}
              </div>
            );
          }}
        </FormConsumer>
      </FormProvider>,
    );
    expect(getByText('姓名')).toBeInTheDocument();
    userEvent.click(screen.getByText('下一步'));
    await waitFor(() => expect(getByText('The field value is required')).toBeInTheDocument());
    userEvent.type(container.querySelector('.ant-input')!, '张三');
    userEvent.click(screen.getByText('下一步'));
    await waitFor(() => expect(getByText('年龄')).toBeInTheDocument());
    userEvent.click(screen.getByText('下一步'));
    await waitFor(() => expect(getByText('性别')).toBeInTheDocument());
    expect(getByText('学历')).toBeInTheDocument();
  });

  it('test render tabs', async () => {
    const form = createForm();
    const fieldsConfig = createFields([
      {
        component: Input,
        title: '基本信息',
        name: 'info',
        customProps: {
          placeholder: '请输入基本信息',
        },
      },
      createTabsField({
        name: 'tabsField',
        customProps: {
          tabPosition: 'left',
        },
        tabs: [
          {
            tab: 'Tab1',
            fields: createFields([
              {
                component: Input,
                title: '姓名',
                name: 'name',
                customProps: {
                  placeholder: '请输入姓名',
                },
              },
              {
                component: Input,
                title: '年龄',
                name: 'age',
                customProps: {
                  placeholder: '请输入年龄',
                },
              },
            ]),
          },
          {
            tab: 'Tab2',
            fields: createFields([
              {
                component: Input,
                title: '性别',
                name: 'sex',
              },
              {
                component: Input,
                title: '学历',
                name: 'education',
              },
            ]),
          },
        ],
      }),
    ]);
    render(<Form style={{ width: '50%' }} form={form} fieldsConfig={fieldsConfig} />);
    expect(screen.getByText('Tab1')).toBeInTheDocument();
    expect(screen.getByText('Tab2')).toBeInTheDocument();
    expect(screen.getByText('基本信息')).toBeInTheDocument();
    expect(screen.getByText('姓名')).toBeInTheDocument();
    expect(screen.getByText('性别')).toBeInTheDocument();
  });
  it('test render array tabs', async () => {
    const form = createForm();

    form.setValues({
      arrayTabs: [
        {
          name: '张三',
          age: 22,
        },
        {
          name: '李四',
          age: 33,
        },
      ],
    });

    const fieldsConfig = createFields([
      {
        type: 'array',
        customProps: {
          tabPosition: 'left',
          type: 'line',
          tabTitle: (item) => {
            return item?.name;
          },
        },
        gridConfig: { minColumns: 2 },
        name: 'arrayTabs',
        component: ArrayTabs,
        items: [
          {
            component: Input,
            title: '姓名',
            name: 'name',
            customProps: {
              placeholder: '请输入姓名',
            },
          },
          {
            component: Input,
            title: '年龄',
            name: 'age',
            customProps: {
              placeholder: '请输入年龄',
            },
            wrapperProps: {
              gridSpan: 2,
            },
          },
        ],
      },
    ]);
    render(<Form form={form} fieldsConfig={fieldsConfig} />);
    expect(screen.queryAllByLabelText('张三')).toHaveLength(1);
    expect(screen.queryAllByText('张三')).toHaveLength(1);
  });
});
