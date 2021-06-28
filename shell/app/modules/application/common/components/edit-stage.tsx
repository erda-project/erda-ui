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

import { FormComponentProps } from 'core/common/interface';
import ListInput from 'application/common/components/list-input-group';
import VariableInput from 'application/common/components/object-input-group';
import React from 'react';
import { cloneDeep, map, isEmpty, omit, pick, get, filter, head, transform, isEqual, forEach } from 'lodash';
import { Icon as CustomIcon, useUpdate } from 'common';
import { Form, Button, Input, Popover, InputNumber, Collapse, Alert, Spin, Select } from 'app/nusi';
import './edit-service.scss';
import './task-resource-field.scss';
import { mergeActionAndResource, getResource } from '../yml-flow-util';
import ActionSelect from './action-select';
import deployStore from 'application/stores/deploy';
import i18n from 'i18n';
import { useLoading } from 'core/stores/loading';
import './edit-stage.scss';
import { Plus as IconPlus } from '@icon-park/react';

const { Item } = Form;
const { Panel } = Collapse;
const { Option } = Select;

interface IEditStageProps {
  task: IStageTask;
  editing: boolean;
  isCreateTask?: boolean;
  otherTaskAlias: string[];
  actions: IStageAction[];
  onSubmit: (options: any) => void;
}

const getDefaultVersionConfig = (actionConfigs: DEPLOY.ActionConfig[]) => {
  if (isEmpty(actionConfigs)) {
    return undefined;
  }
  const defaultConfig = actionConfigs.find((config) => config.isDefault);
  return defaultConfig || actionConfigs[0];
};

const EditStage = (props: IEditStageProps & FormComponentProps) => {
  const [state, updater] = useUpdate({
    task: {} as IStageTask | {},
    actionConfig: {} as DEPLOY.ActionConfig | {},
    resource: {},
    originType: null as null | string,
    originName: null as null | string,
  });

  const { task, actionConfig, resource, originName, originType } = state;
  const { actions, otherTaskAlias, form, editing, isCreateTask, onSubmit: handleSubmit, task: PropsTask } = props;
  const { getFieldDecorator, getFieldValue } = form;

  const actionConfigs = deployStore.useStore((s) => s.actionConfigs);
  const { getActionConfigs } = deployStore.effects;
  const [loading] = useLoading(deployStore, ['getActionConfigs']);
  React.useEffect(() => {
    if (!isEmpty(PropsTask)) {
      updater.originName(PropsTask.alias);
      updater.originType(PropsTask.type);
      updater.task(PropsTask);
    }
  }, [PropsTask, updater]);

  React.useEffect(() => {
    let config;
    if (actionConfigs.length > 0) {
      config = PropsTask.version
        ? actionConfigs.find((c) => c.version === PropsTask.version)
        : getDefaultVersionConfig(actionConfigs);
    }

    const newResource = getResource(PropsTask, config);
    updater.resource(newResource);
    updater.actionConfig(config as DEPLOY.ActionConfig);
  }, [actionConfigs, PropsTask, updater]);

  React.useEffect(() => {
    if (isCreateTask) {
      updater.actionConfig({});
    }
  }, [isCreateTask, updater]);

  if (!isCreateTask && isEmpty(actionConfig)) {
    return null;
  }

  const type = actionConfig.type || getFieldValue('resource.type');
  const taskInitName =
    originType === actionConfig.name
      ? originName
      : otherTaskAlias.includes(actionConfig.name)
      ? undefined
      : actionConfig.name;

  const changeResourceType = (value: string) => {
    const action = actions.find((a: any) => a.name === value);
    if (action) {
      getActionConfigs({ actionType: action.name }).then((result: DEPLOY.ActionConfig[]) => {
        const config = getDefaultVersionConfig(result);
        const mergedResource = mergeActionAndResource(config, {} as any);
        updater.resource({
          ...resource,
          ...mergedResource,
        });
      });
    }
  };

  const checkResourceName = (_rule: any, value: string, callback: any) => {
    const name = form.getFieldValue('resource.alias');

    if (!value) {
      return callback(i18n.t('application:please enter the task name'));
    }
    if (otherTaskAlias.includes(name)) {
      return callback(i18n.t('application:An Action with the same name exists.'));
    }
    callback();
  };

  const changeActionVersion = (version: string) => {
    const selectConfig = actionConfigs.find((config) => config.version === version) as DEPLOY.ActionConfig;
    updater.actionConfig(selectConfig);
    updater.resource(getResource(task, selectConfig));
  };

  const taskType = getFieldDecorator('resource.type', {
    initialValue: task.type,
    rules: [
      {
        required: true,
        message: `${i18n.t('application:please choose')}Task Type`,
      },
    ],
  })(
    <ActionSelect
      disabled={!editing}
      label={i18n.t('task type')}
      actions={actions}
      onChange={changeResourceType}
      placeholder={`${i18n.t('application:please choose task type')}`}
    />,
  );

  const actionVersion = getFieldDecorator('resource.version', {
    initialValue: task.version || actionConfig.version,
    rules: [
      {
        required: true,
        message: `${i18n.t('application:please choose')}Task Version`,
      },
    ],
  })(
    <Select
      disabled={!editing}
      onChange={changeActionVersion}
      placeholder={`${i18n.t('application:please choose version')}`}
    >
      {actionConfigs.map((config) => (
        <Option key={config.version} value={config.version}>
          {config.version}
        </Option>
      ))}
    </Select>,
  );

  let alert;

  if (!isCreateTask && isEmpty(resource)) {
    return null;
  }

  if (!isCreateTask && !actionConfig.type) {
    alert = (
      <Alert
        className="addon-error-tag"
        showIcon
        message={i18n.t('application:the current action does not exist, please re-select!')}
        type="error"
      />
    );
  }
  const taskName = getFieldDecorator('resource.alias', {
    initialValue: taskInitName,
    rules: [
      {
        required: true,
        validator: checkResourceName,
      },
    ],
  })(<Input autoFocus={!type} disabled={!editing} placeholder={i18n.t('application:please enter the task name')} />);

  const renderTaskTypeStructure = () => {
    if (isEmpty(resource)) {
      return null;
    }
    const { getFieldsValue } = form;
    const resourceForm = getFieldsValue(['resource.alias', 'resource.type']);
    if (!resourceForm.resource.type) {
      return null;
    }

    return renderResource(resource, 'resource');
  };

  const getDataValue = (dataSource: any, key: string) => {
    return dataSource ? dataSource[key] : null;
  };

  const renderResource = (resourceParam: any, parentKey?: string, dataSource?: any) => {
    if (resourceParam.data instanceof Array) {
      return resourceParam.data.map((item: any) => {
        const inputKey = parentKey ? `${parentKey}.${item.name}` : `${item.name}`;
        return renderObject(item, inputKey, getDataValue(dataSource, item.name));
      });
    }
    const { params, image, resources } = resourceParam.data;

    const parentObjectData = getDataValue(dataSource, 'params');
    const paramsContent = map(params, (value: any, itemKey: string) => {
      const inputKey = parentKey ? `${parentKey}.params.${itemKey}` : `params.${itemKey}`;
      return renderObject(value, inputKey, getDataValue(parentObjectData, itemKey));
    });

    return (
      <>
        {actionConfig.name === 'custom-script' ? (
          <div>{renderObject(image, 'resource.image', getDataValue(dataSource, 'image'))}</div>
        ) : null}
        <div>
          <div className="resource-input-group-title">params: </div>
          {paramsContent}
        </div>
        <div>{renderObject(resources, 'resource.resources', getDataValue(dataSource, 'resources'))}</div>
      </>
    );
  };

  const renderObject = (value: any, parentKey: string, dataSource?: any) => {
    if (!isObject(value.type)) {
      return renderPropertyValue(value, parentKey, dataSource);
    }

    if (value.type === 'string_array') {
      return renderStringArray(value, parentKey);
    }

    if (value.type === 'struct_array') {
      return renderStructArray(value, parentKey);
    }

    if (value.type === 'map') {
      return renderMap(value, parentKey, dataSource);
    }

    const content = renderResource({ data: value.struct }, parentKey, dataSource);
    if (!content || !Object.values(content).some((c) => c)) return null;

    return (
      <div key={parentKey}>
        <span className="resource-input-group-title">{value.name}: </span>
        <div>{content}</div>
      </div>
    );
  };

  const renderMap = (value: any, parentKey: string, dataSource?: any) => {
    let initialValue = isCreateTask ? value.default : value.value || value.default;

    if (dataSource) {
      initialValue = dataSource;
    }

    if (!editing && !initialValue) {
      return null;
    }

    const inputField = getFieldDecorator(parentKey, {
      initialValue,
      rules: [
        {
          required: value.required,
          message: i18n.t('application:this item cannot be empty'),
        },
      ],
    })(<VariableInput disabled={!editing} label={value.name} />);
    return <Item key={parentKey}>{renderTooltip(value.desc, inputField)}</Item>;
  };

  const renderStringArray = (value: any, parentKey: string) => {
    const inputField = getFieldDecorator(parentKey, {
      initialValue: isCreateTask ? value.default : value.value || value.default,
      rules: [
        {
          required: value.required,
          message: i18n.t('application:this item cannot be empty'),
        },
      ],
    })(<ListInput disabled={!editing} label={value.name} />);
    return <Item key={parentKey}>{renderTooltip(value.desc, inputField)}</Item>;
  };

  const renderPropertyValue = (value: any, parentKey: string, dataSource?: any) => {
    let input;
    let initialValue = isCreateTask ? value.default : value.value || value.default;

    if (dataSource) {
      initialValue = dataSource;
    }

    if (!editing && !initialValue) {
      return null;
    }

    const unit = value.unit ? <span>{value.unit}</span> : null;

    switch (value.type) {
      case 'float':
      case 'int':
        input = (
          <InputNumber
            disabled={!editing || value.readOnly}
            className="full-width"
            placeholder={i18n.t('application:please enter data')}
          />
        );
        break;
      default:
        input = (
          <Input
            disabled={!editing || value.readOnly}
            placeholder={i18n.t('application:please enter data')}
            addonAfter={unit}
          />
        );
        break;
    }

    const inputField = getFieldDecorator(parentKey, {
      initialValue,
      rules: [
        {
          required: value.required,
          message: i18n.t('application:this item cannot be empty'),
        },
      ],
    })(input);
    return (
      <Item key={parentKey} label={value.name}>
        {renderTooltip(value.desc, inputField)}
      </Item>
    );
  };

  const renderStructArray = (property: any, parentKey: string) => {
    if ((!editing && !property.value) || (!editing && property.value && !property.value.length)) {
      return null;
    }
    const addBtn = editing ? (
      <IconPlus className="pointer" onClick={() => addNewItemToStructArray(property.value, property.struct[0])} />
    ) : null;
    getFieldDecorator(`${parentKey}-data`, { initialValue: property.value || [] });
    const data = getFieldValue(`${parentKey}-data`);
    const content = data.map((item: any, index: number) => {
      const keys = Object.keys(item);
      const header = (
        <div>
          <span>{typeof item[keys[0]] === 'string' ? item[keys[0]] : 'module'}</span>
          {editing ? (
            <CustomIcon
              onClick={() => deleteItemFromStructArray(index, parentKey)}
              className="icon-delete"
              type="sc1"
            />
          ) : null}
        </div>
      );
      return (
        <Panel key={`${parentKey}.${item.name}`} header={header}>
          {renderResource({ data: property.struct }, `${parentKey}[${index}]`, item)}
        </Panel>
      );
    });

    return (
      <div key={parentKey}>
        <span className="resource-input-group-title">
          {property.name}:{addBtn}
        </span>
        {data.length ? (
          <Collapse className="collapse-field" accordion>
            {content}
          </Collapse>
        ) : null}
      </div>
    );
  };

  const deleteItemFromStructArray = (index: number, parentKey: string) => {
    const formDatas = form.getFieldValue(`${parentKey}-data`);
    formDatas.splice(index, 1);

    form.setFieldsValue({
      [parentKey]: formDatas,
    });
  };

  const addNewItemToStructArray = (list: any[], struct: any) => {
    list.push({
      [struct.name]: `module-${list.length + 1}`,
    });
    updater.resource(cloneDeep(resource));
  };

  const isObject = (inputType: string) => {
    return ['map', 'string_array', 'struct_array', 'struct'].includes(inputType);
  };

  const renderTooltip = (message: string, text: any) => {
    if (!message) {
      return text;
    }
    const msgComp = <pre className="prop-popover">{message}</pre>;
    return (
      <Popover placement="leftTop" trigger={['focus']} content={msgComp}>
        {text}
      </Popover>
    );
  };

  const onSubmit = () => {
    form.validateFieldsAndScroll((error: any, values: any) => {
      if (!error) {
        let data = cloneDeep(values);
        const resources = head(filter(state.resource.data, (item) => item.name === 'resources'));
        const originResource = transform(
          get(resources, 'struct'),
          (result, item: { name: string; default: string | number }) => {
            const { name, default: d } = item;
            // eslint-disable-next-line no-param-reassign
            result[name] = +d;
          },
          {},
        );
        const editedResources = get(data, 'resource.resources');
        forEach(Object.entries(editedResources), ([key, value]) => {
          editedResources[key] = +(value as string);
        });
        const isResourceDefault = isEqual(editedResources, originResource);

        if (isResourceDefault) {
          data = omit(data, ['resource.resources']);
        }
        if (values.type !== 'custom-script') {
          data = omit(data, ['resource.image']);
        }
        const filledFieldsData = clearEmptyField(data);
        handleSubmit(filledFieldsData);
      }
    });
  };

  const clearEmptyField = (ObjData: any) => {
    const filledFields: string[] = [];
    const findData = (obj: any, parentArray: string[]) => {
      Object.keys(obj).forEach((key) => {
        const currentParent = [...parentArray, key];
        const value = get(obj, key);
        if (typeof value === 'object') {
          findData(value, currentParent);
        } else if (value || value === 0) {
          filledFields.push(currentParent.join('.'));
        }
      });
    };
    findData(ObjData, []);
    return pick(ObjData, filledFields);
  };

  return (
    <Spin spinning={loading}>
      <Form className="edit-service-container">
        {alert}
        <Item>{taskType}</Item>
        {type ? <Item label={i18n.t('application:task name')}>{taskName}</Item> : null}
        <Item label="version">{actionVersion}</Item>
        {renderTaskTypeStructure()}
        {editing ? (
          <Button type="primary" ghost onClick={onSubmit}>
            {i18n.t('application:save')}
          </Button>
        ) : null}
      </Form>
    </Spin>
  );
};

export default Form.create()(EditStage);
