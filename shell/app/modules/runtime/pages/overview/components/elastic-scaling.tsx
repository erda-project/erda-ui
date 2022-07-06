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
import cn from 'classnames';
import { Button, Drawer, Input, InputNumber, message, Modal, Select, Tag } from 'antd';
import { Form, ArrayFieldType, Table, Schema } from '@erda-ui/components';
import { filter, forEach, isNumber, map, pick } from 'lodash';
import { toJS } from '@formily/reactive';
import { IFormFeedback } from '@formily/core';
import { createScaledRules, getScaledRules, updateScaledRules, applyCancelRules } from '../../../services/runtime';
import routeInfoStore from 'core/stores/route';
import { useUnmount } from 'react-use';
import runtimeStore from 'runtime/stores/runtime';

import './elastic-scaling.scss';

const {
  createForm,
  createFields,
  useFieldSchema,
  useField,
  observer,
  RecursionField,
  onFieldReact,
  isField,
  onFieldValueChange,
} = Form;

interface IProps {
  visible: boolean;
  serviceName: string;
  onClose: () => void;
}

const typeOptions = [
  { value: 'cpu', label: 'CPU' },
  { value: 'memory', label: '内存' },
  { value: 'cron', label: 'Cron' },
];

const StatusTitle = ({
  started,
  runtimeId,
  ruleId,
  toggleStatus,
}: {
  started: boolean;
  runtimeId: number;
  ruleId: string | null;
  toggleStatus: () => void;
}) => {
  const takeAction = async (isCancel: boolean) => {
    await applyCancelRules({
      runtimeId,
      actions: [{ ruleId: ruleId!, action: isCancel ? 'cancel' : 'apply' }],
      $options: { successMsg: '操作成功' },
    });
    toggleStatus();
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex">
        <div>自动扩缩容</div>
        <div className="ml-4">
          {!ruleId ? null : (
            <Tag className={cn('border-0 text-white', { 'bg-green-deep': started, 'bg-red-deep': !started })}>
              {started ? '启用中' : '已停止'}
            </Tag>
          )}
        </div>
      </div>
      <div className="mr-8">
        {!ruleId ? null : started ? (
          <Button type="primary" onClick={() => takeAction(true)}>
            停止
          </Button>
        ) : (
          <Button type="primary" onClick={() => takeAction(false)}>
            启用
          </Button>
        )}
      </div>
    </div>
  );
};

const TriggersConfig = observer(
  (props: {
    value: ({ type: string; metadata: RUNTIME.Metadata } | { type: string; metadata: RUNTIME.CronMetadata })[];
  }) => {
    const schema = useFieldSchema();
    const field = useField<ArrayFieldType>();

    const [visible, setVisible] = React.useState(false);
    const [tableDataSource, setTableDataSource] = React.useState<{ type: string; value: string }[]>([]);
    const [previousValue, setPreviousValue] = React.useState<null | RUNTIME.Trigger[]>(null);
    const [isEditing, setIsEditing] = React.useState(false);
    const [currentIndex, setCurrentIndex] = React.useState(0);

    const setDataSource = () => {
      const data = map(props.value, (item, index) => {
        if (!item.type) {
          return null;
        }
        if (item.type === 'cron') {
          return { type: 'Cron', value: '', index };
        }
        return { index, type: item.type === 'cpu' ? 'CPU' : '内存', value: (item.metadata as RUNTIME.Metadata).value };
      }).filter((item): item is { type: string; value: string; index: number } => !!item);
      setTableDataSource(data);
    };

    useUnmount(() => {
      setTableDataSource([]);
    });

    React.useEffect(() => {
      if (!visible) {
        setDataSource();
      }
    }, [visible, props.value]);

    React.useEffect(() => {
      if (visible) {
        const currentTypes = props.value.reduce<string[]>((acc, item) => {
          item.type && acc.push(item.type);
          return acc;
        }, []);
        const currentTypeField = field.query(`triggers[${currentIndex}].type`).take();
        currentTypeField.setComponentProps({
          options: filter(
            typeOptions,
            ({ value }) =>
              !currentTypes.includes(value) || (isField(currentTypeField) && currentTypeField.value === value),
          ),
        });
      }
    }, [visible, props.value, currentIndex]);

    const columns = [
      {
        dataIndex: 'type',
        title: '类型',
      },
      {
        dataIndex: 'value',
        title: '目标值',
      },
    ];

    const onAddRule = () => {
      field.push({});
      setVisible(true);
      setIsEditing(false);
      setCurrentIndex(field.value.length - 1);
    };

    const onOk = async () => {
      await field.validate();
      setVisible(false);
    };

    const onClose = () => {
      if (isEditing) {
        field.setValue(previousValue!);
      } else {
        setCurrentIndex(0);
        field.remove(currentIndex);
      }
      setVisible(false);
    };

    const actions = {
      render: (_record: unknown, index: number) => {
        return [
          {
            title: '编辑',
            onClick: () => {
              setPreviousValue(toJS(field.value));
              setVisible(true);
              setIsEditing(true);
              setCurrentIndex(index);
            },
          },
          {
            title: '删除',
            onClick: () => {
              field.remove(index);
              setDataSource();
            },
          },
        ];
      },
    };

    return (
      <div>
        <Button type="ghost" onClick={onAddRule} className="mb-4">
          添加触发器
        </Button>
        <Table
          rowKey="index"
          columns={columns}
          dataSource={tableDataSource}
          extraConfig={{ hideHeader: true, hideColumnConfig: true }}
          actions={actions}
          pagination={false}
        />
        <Modal
          visible={visible}
          onCancel={onClose}
          onOk={onOk}
          closable={false}
          title={isEditing ? '编辑触发器' : '新建触发器'}
        >
          <RecursionField schema={schema.items as Schema} name={currentIndex} />
        </Modal>
      </div>
    );
  },
);

const ReplicaCount = observer(() => {
  const { properties } = useFieldSchema();

  return (
    <>
      <div className="mt-4 mb-2">服务实例数</div>
      <div className="flex items-center replicas-count mb-8">
        <div className="w-32">
          <RecursionField schema={properties?.minReplicaCount as Schema} name="minReplicaCount" />
        </div>
        <div className="bg-default-06 leading-[30px] px-2">至</div>
        <div className="w-32">
          <RecursionField schema={properties?.maxReplicaCount as Schema} name="maxReplicaCount" />
        </div>
      </div>
    </>
  );
});

const ElasticScaling = ({ visible, onClose, serviceName }: IProps) => {
  const { runtimeId } = routeInfoStore.useStore((s) => s.params);
  const scaledRules = getScaledRules.useData();
  const [started, setStarted] = React.useState(false);

  const isEditing = React.useMemo(() => !!scaledRules && !!scaledRules.rules.length, [scaledRules]);

  React.useEffect(() => {
    if (visible) {
      getScaledRules.fetch({ runtimeId: +runtimeId, services: serviceName });
    }
  }, [visible]);

  React.useEffect(() => {
    if (scaledRules && scaledRules.rules.length) {
      setStarted(scaledRules.rules[0].isApplied === 'Y');
    }
  }, [scaledRules]);

  const form = React.useMemo(() => {
    if (visible) {
      return createForm({
        effects: () => {
          onFieldReact('triggers.*.type', (field) => {
            if (isField(field)) {
              const { value } = field;
              const metadataPath = field.address.pop().concat('metadata.layout.grid');
              const valueField = field.query(metadataPath.concat('value')).take();
              const startField = field.query(metadataPath.concat('start')).take();
              const endField = field.query(metadataPath.concat('end')).take();
              const desiredReplicasField = field.query(metadataPath.concat('desiredReplicas')).take();
              const subTypePathField = field.query(metadataPath.concat('type')).take();
              const timezoneField = field.query(metadataPath.concat('timezone')).take();
              if (!value) {
                valueField?.setDisplay('none');
                startField?.setDisplay('none');
                endField?.setDisplay('none');
                desiredReplicasField?.setDisplay('none');
              } else if (value !== 'cron') {
                valueField?.setDisplay('visible');
                startField?.setDisplay('none');
                endField?.setDisplay('none');
                desiredReplicasField?.setDisplay('none');
                subTypePathField?.setDisplay('hidden');
                isField(subTypePathField) && subTypePathField?.setValue('Utilization');
                timezoneField?.setDisplay('none');
              } else {
                valueField?.setDisplay('none');
                startField?.setDisplay('visible');
                endField?.setDisplay('visible');
                desiredReplicasField?.setDisplay('visible');
                subTypePathField?.setDisplay('none');
                timezoneField?.setDisplay('hidden');
                isField(timezoneField) && timezoneField?.setValue('Asia/Shanghai');
              }
            }
          });
          onFieldValueChange('triggers.*.*.value', (field) => {
            // @ts-ignore TODO
            field.setValue(isNumber(field.value) ? `${field.value}` : field.value);
          });
          onFieldValueChange('triggers.*.*.desiredReplicas', (field) => {
            // @ts-ignore TODO
            field.setValue(isNumber(field.value) ? `${field.value}` : field.value);
          });
        },
      });
    }
    return createForm();
  }, [visible]);

  React.useEffect(() => {
    if (scaledRules && scaledRules.rules.length) {
      const { rules } = scaledRules;
      const { scaledConfig } = rules[0];
      const values = pick(scaledConfig, ['maxReplicaCount', 'minReplicaCount', 'triggers']);
      values.triggers = map(values.triggers, (trigger) => pick(trigger, ['metadata', 'type']));
      form.setValues(values);
    }
  }, [scaledRules]);

  const fieldsConfig = createFields([
    {
      component: TriggersConfig,
      name: 'triggers',
      type: 'array',
      validator: [
        {
          required: true,
          message: '至少有一条触发器',
        },
      ],
      items: [
        {
          component: Select,
          name: 'type',
          title: '类型',
          required: true,
        },
        {
          type: 'object',
          name: 'metadata',
          component: undefined,
          properties: [
            {
              name: 'type',
              component: undefined,
              display: 'none',
              defaultValue: 'Utilization',
            },
            {
              name: 'timezone',
              component: undefined,
              display: 'none',
              defaultValue: 'Asia/Shanghai',
            },
            {
              name: 'value',
              component: InputNumber,
              title: '目标值',
              required: true,
              display: 'none',
              customProps: {
                min: 0,
                max: 100,
              },
              validator: {
                validator: (v: string) => +v > 0 && +v < 100,
                message: '数值必须大于0小于100',
              },
            },
            {
              name: 'start',
              component: Input,
              title: '开始',
              required: true,
              display: 'none',
            },
            {
              name: 'end',
              component: Input,
              title: '结束',
              required: true,
              display: 'none',
            },
            {
              name: 'desiredReplicas',
              component: InputNumber,
              title: 'desiredReplicas',
              required: true,
              display: 'none',
            },
          ],
        },
      ],
    },
    {
      component: ReplicaCount,
      type: 'void',
      name: 'void',
      title: '扩缩容范围',
      noPropertyLayoutWrapper: true,
      properties: [
        {
          name: 'minReplicaCount',
          component: InputNumber,
          wrapperProps: {
            feedbackLayout: 'none',
          },
          validator: [
            {
              required: true,
              message: '服务实例数最小值是必填项',
            },
          ],
          customProps: {
            placeholder: '最小值',
            min: 0,
            max: 100,
          },
        },
        {
          name: 'maxReplicaCount',
          component: InputNumber,
          required: true,
          wrapperProps: {
            feedbackLayout: 'none',
          },
          validator: [
            {
              required: true,
              message: '服务实例数最大值是必填项',
            },
          ],
          customProps: {
            placeholder: '最大值',
            min: 1,
            max: 100,
          },
        },
      ],
    },
  ]);

  const onSubmit = async () => {
    try {
      await form.validate();
    } catch (errs) {
      forEach(errs as IFormFeedback[], (err) => {
        message.error(err?.messages?.join(', '));
      });
      return;
    }
    const values = toJS(form.values) as RUNTIME.ScaledConfig;
    values.triggers = values.triggers.filter(({ type }) => !!type);
    if (isEditing) {
      updateScaledRules({
        runtimeId: +runtimeId,
        rules: [
          {
            ruleId: scaledRules?.rules[0].ruleId!,
            scaledConfig: values,
          },
        ],
        $options: { successMsg: '更新成功' },
      });
    } else {
      await createScaledRules({
        runtimeId: +runtimeId,
        services: [
          {
            serviceName,
            scaledConfig: values,
          },
        ],
        $options: { successMsg: '创建成功' },
      });
    }
    runtimeStore.getRuntimeDetail({ runtimeId, forceUpdate: true });
  };

  return (
    <Drawer
      width={800}
      visible={visible}
      title={
        <StatusTitle
          runtimeId={+runtimeId}
          ruleId={scaledRules ? scaledRules?.rules[0]?.ruleId : null}
          started={started}
          toggleStatus={() => setStarted(!started)}
        />
      }
      bodyStyle={{ display: 'flex', flexDirection: 'column' }}
      onClose={onClose}
      destroyOnClose
    >
      <div className="flex flex-col justify-between flex-1">
        <Form form={form} fieldsConfig={fieldsConfig} />
        <div className="flex justify-end items-center">
          <Button onClick={onSubmit} className="mr-2" type="primary">
            保存
          </Button>
          <Button onClick={onClose}>关闭</Button>
        </div>
      </div>
    </Drawer>
  );
};

export default ElasticScaling;
