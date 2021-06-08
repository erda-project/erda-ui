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

import React, { PureComponent } from 'react';
import { map, forEach, cloneDeep, isEqual, set } from 'lodash';
import { Input, Select, Radio, Tooltip } from 'app/nusi';
import i18n from 'i18n';
import './task-resource-field.scss';

const { Option } = Select;
const { Group } = Radio;
const methodKeys = ['get', 'put'];

interface IVariableInputGroupProps {
  value: any;
  resources: any;
  actions: any[];
  required?: boolean;
  isCreateTask?: boolean;
  label: string;
  placeholder?: string;
  isAggregate: boolean;
  onChange: (options: any[]) => void;
}

const defaultValue = {
  resource: {},
  stage: {},
};

export default class extends PureComponent<IVariableInputGroupProps, any> {
  state = {
    value: defaultValue,
    validTaskName: true,
    createViewData: {
      type: null,
      name: '',
      taskKey: null,
      isAggregate: false,
    },
    resources: [],
  };

  static getDerivedStateFromProps(nextProps: IVariableInputGroupProps, prevState: any): any {
    if (isEqual(nextProps.resources, prevState.resources) || isEqual(nextProps.value, nextProps.value)) {
      if (nextProps.isCreateTask) {
        return prevState;
      }

      const name = nextProps.value.get || nextProps.value.put;
      const resources = prevState.resources.length ? prevState.resources : nextProps.resources;
      const resource = resources.find((i: any) => i.name === name);
      return {
        value: {
          ...nextProps.value,
          resource: nextProps.value.resource || {},
        } || defaultValue,
        createViewData: nextProps.isCreateTask ?
          prevState.createViewData : {
            ...resource,
            isAggregate: nextProps.isAggregate,
            taskKey: nextProps.value.get ? 'get' : (nextProps.value.put ? 'put' : null),
          },
        resources: nextProps.isCreateTask ? prevState.resources : nextProps.resources,
      };
    }

    return null;
  }

  triggerChange = (changedValue: any) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { isCreateTask } = this.props;
    return (
      <div>
        {isCreateTask ? this.renderCreateContent() : this.renderEditContent()}
      </div>
    );
  }

  private renderCreateContent() {
    const { actions } = this.props;
    const { validTaskName } = this.state;
    const { resource = {} } = this.state.value;
    const { type, name, taskKey, isAggregate } = this.state.createViewData;

    const action = actions.find((a: any) => a.type === type) || {};
    const newResource = this.mergeActionAndResource(action, resource, {});
    const { support } = newResource;
    let defaultKey: any = taskKey;
    if (support && support.get) {
      defaultKey = 'get';
    } else if (support && support.put) {
      defaultKey = 'put';
    }

    return (
      <React.Fragment>
        <div>
          <span className="resource-input-group-label">
            <span className="ant-form-item-required" />
            Task Name:
          </span>
          <Input onChange={(e) => this.changeCreateValue(e.target.value, 'name')} placeholder={`${i18n.t('application:please enter')} Resource`} />
          <div className="resource-error">{validTaskName === true ? null : i18n.t('application:resource already exists, please change one')}</div>
        </div>
        <span className="resource-input-group-label">
          <span className="ant-form-item-required" />
          Task Type:
        </span>
        <Select value={type} onChange={(e: any) => this.changeCreateValue(e, 'type')} placeholder={i18n.t('application:please select the task type')} >
          {actions.map((a: any) => <Option key={a.type} value={a.type}>{a.type}</Option>)}
        </Select>
        <div>
          <span className="resource-input-group-label">
            <span className="ant-form-item-required" />
            {this.renderTooltip(i18n.t('application:is it a parallel task'), 'Aggregate')}
          </span>
          <Group value={isAggregate} onChange={(e: any) => this.changeCreateValue(e.target.value, 'isAggregate')}>
            <Radio value>是</Radio>
            <Radio value={false}>否</Radio>
          </Group>
        </div>
        {(type && name && validTaskName) ? (
          <div>
            {defaultKey ? (
              <React.Fragment>
                <span className="resource-input-group-label">
                  <span className="ant-form-item-required" />
                  Task Method:
                </span>
                <Select value={defaultKey} onChange={(e) => this.changeCreateValue(e, 'taskKey')} placeholder={i18n.t('application:please select method')} >
                  {support.get ? <Option value="get">get</Option> : null}
                  {support.put ? <Option value="put">put</Option> : null}
                </Select>
              </React.Fragment>
            ) : null}
            <div>{this.renderObject(newResource)}</div>
          </div>
        ) : null}
      </React.Fragment>
    );
  }

  private changeCreateValue = (v: any, type: string) => {
    const { createViewData } = this.state;
    let { value, validTaskName } = this.state;
    const { resources, actions } = this.props;
    let defaultKey: any = createViewData.taskKey;

    if (type === 'type') {
      const action = actions.find((a: any) => a.type === v) || {};
      const newResource = this.mergeActionAndResource(action, value.resource || {}, {});
      const { support } = newResource;
      value.stage = {
        ...(value.stage || {}),
        name: createViewData.name,
      };

      if (support && support.get) {
        defaultKey = 'get';
      } else if (support && support.put) {
        defaultKey = 'put';
      }
    } else if (type === 'name') {
      const resourceResult: any = resources.filter((r: any) => r.name === v) || [];
      const originResource: any = resources.find((r: any) => r.name === createViewData.name);
      if (!resourceResult.length) {
        validTaskName = true;
      } else {
        validTaskName = false;
      }

      if (originResource) {
        originResource.name = v;
      }
    }

    if (validTaskName) {
      createViewData[type] = v;
      createViewData.taskKey = defaultKey;
      value = {
        ...value,
        // @ts-ignore
        name: createViewData.name,
        [defaultKey]: createViewData.name,
        resource: {
          ...value.resource,
          ...createViewData,
        },
      };
      this.setState({
        value,
        validTaskName,
        createViewData,
        resources: cloneDeep(resources),
      });
    } else {
      this.setState({
        value,
        validTaskName,
      });
    }

    if (!value.stage) {
      value.stage = {
        [defaultKey]: createViewData.name,
      };
    } else {
      value.stage[defaultKey] = createViewData.name;
    }

    this.triggerChange(value);
  };

  private renderEditContent = () => {
    const { actions } = this.props;
    const { value, resources } = this.state;

    return map(value, (v: any, key: string) => {
      if (methodKeys.includes(key)) {
        const resource: any = resources.find((r: any) => r.name === v);
        const action = actions.find((a: any) => a.type === resource.type) || {};
        const newResource = this.mergeActionAndResource(action, resource, value);
        return (
          <div key={key}>
            {this.renderSubTitle(newResource)}
            <div>{this.renderObject(newResource, v)}</div>
          </div>
        );
      }

      if (key === 'aggregate') {
        return v.map((aggregate: any) => {
          const aggregateKey = aggregate.put ? 'put' : 'get';
          const resource: any = resources.find((r: any) => r.name === aggregate[aggregateKey]);
          const action = actions.find((a: any) => a.type === resource.type) || {};
          const newResource = this.mergeActionAndResource(action, resource, value);
          return (
            <div key={aggregate[aggregateKey]}>
              {this.renderSubTitle(newResource)}
              <div>{this.renderObject(newResource, aggregate[aggregateKey])}</div>
            </div>
          );
        });
      }
    });
  };

  private renderSubTitle(newResource: any) {
    const { actions } = this.props;
    const { createViewData } = this.state;
    return (
      <React.Fragment>
        <div className="resource-input-group-label">
          Name:
          <Input
            defaultValue={createViewData.name || ''}
            onChange={(e) => this.changeCreateValue(e.target.value, 'name')}
            placeholder={`${i18n.t('application:please enter')} Resource`}
          />
        </div>
        <span className="resource-input-group-label">
          type:
          <Select
            value={newResource.type}
            onChange={(e: any) => this.changeCreateValue(e, 'type')}
            placeholder={i18n.t('application:please select the task type')}
          >
            {actions.map((a: any) => <Option key={a.type} value={a.type}>{a.type}</Option>)}
          </Select>
        </span>
        <span className="resource-input-group-label">
          <span className="ant-form-item-required" />
          {this.renderTooltip(i18n.t('application:is it a parallel task'), 'Aggregate')}
        </span>
        <Group value={createViewData.isAggregate || false} onChange={(e: any) => this.changeCreateValue(e.target.value, 'isAggregate')}>
          <Radio value>{i18n.t('application:yes')}</Radio>
          <Radio value={false}>{i18n.t('application:no')}</Radio>
        </Group>
      </React.Fragment>
    );
  }

  private renderTooltip(message: string, text: string) {
    return (
      <Tooltip title={message}>
        <span>{text}</span>
      </Tooltip>
    );
  }

  private renderObject = (resource: any, taskName?: string, parentKey?: string): any => {
    if (resource.data instanceof Array) {
      return resource.data.map((item: any, key: string) => {
        return (
          <div key={item.name} className="resource-input-group">
            <span className="resource-input-group-label">
              {item.required ? <span className="ant-form-item-required" /> : null}
              {this.renderTooltip(item.desc, item.name)}:
            </span>
            <Input
              className="resource-input-group-input"
              value={item.value || item.default}
              onChange={(e: any) => this.changeValue(e.target.value, item.name, parentKey || key, taskName)}
              placeholder={i18n.t('application:please input the value')}
            />
          </div>
        );
      });
    }
    return map(resource.data, (item: any, key: string) => {
      const content = map(item, (value: any, itemKey: string) => {
        if (!this.isObject(value.type)) {
          return (
            <div key={itemKey} className="resource-input-group">
              <span className="resource-input-group-label">
                {value.required ? <span className="ant-form-item-required" /> : null}
                {this.renderTooltip(value.desc, itemKey)}:
              </span>
              <Input
                className="resource-input-group-input"
                value={value.value || item.default}
                onChange={(e: any) => this.changeValue(e.target.value, itemKey, parentKey || key, taskName)}
                placeholder={i18n.t('application:please input the value')}
              />
            </div>
          );
        }

        const parentKey1 = parentKey ? `${parentKey}.${key}.${itemKey}` : `${key}.${itemKey}`;
        return (
          <div key={itemKey}>
            <span className="resource-input-group-title">{itemKey}: </span>
            <div>
              {this.renderObject({ data: item[itemKey].struct }, taskName, parentKey1)}
            </div>
          </div>
        );
      });

      return (
        <div key={key}>
          <div className="resource-input-group-title">{key}: </div>
          {content}
        </div>
      );
    });
  };

  private isObject(type: string) {
    return type === 'struct_array';
  }

  private mergeActionAndResource = (action: any, resource: any, params: any) => {
    const result: any = {
      desc: action.desc,
      type: action.type,
      support: action.support,
      data: {},
    };

    if (action.params || resource.params) {
      result.data.params = {};
      if (!resource.params) {
        set(resource, 'params', {});
      }
      if (action.params) {
        forEach(action.params, (value: any) => {
          result.data.params[value.name] = {
            ...value,
            value: resource.params ? resource.params[value.name] : (params.params ? params.params[value.name] : null),
          };
        });
      } else {
        forEach(resource.params, (value: any, key: string) => {
          result.data.params[key] = {
            value: value || params.params[key],
            type: 'string',
          };
        });
      }
    }

    if (action.source || resource.source) {
      result.data.source = {};
      if (!resource.source) {
        set(resource, 'source', {});
      }
      if (action.source) {
        forEach(action.source, (value: any) => {
          if (value.type === 'struct_array') {
            if (!resource.source[value.name]) {
              set(resource, `source.${value.name}`, []);
            }

            if (!result.data.source[value.name]) {
              result.data.source[value.name] = {
                ...value,
                struct: [],
              };
            }

            value.struct.forEach((struct: any) => {
              const structItem = {
                ...struct,
              };
              const resourceResult = resource.source[value.name].find((m: any) => {
                const keys = Object.keys(m);
                return structItem.name === keys[0];
              });
              if (resourceResult) {
                structItem.value = resourceResult[structItem.name];
              }
              result.data.source[value.name].struct.push(structItem);
            });
          } else {
            result.data.source[value.name] = {
              ...value,
              value: resource.source ? resource.source[value.name] : null,
            };
          }
        });
      } else {
        forEach(resource.source, (value: any, key: string) => {
          result.data.source[key] = {
            value,
            type: 'string',
          };
        });
      }
    }

    return result;
  };

  private convertResourceByParentKey(resource: any, parentKey?: string) {
    let result = resource || {};
    if (!parentKey) {
      return result;
    }

    if (parentKey.includes('.')) {
      const splits = parentKey.split('.');
      splits.forEach((split: string) => {
        if (result[split]) {
          result = result[split];
        } else {
          result[split] = {};
          result = result[split];
        }
      });

      return result;
    } else {
      if (!result[parentKey]) {
        result[parentKey] = {};
      }
      return result[parentKey];
    }
  }

  private changeValue = (v: any, key: string, parentKey?: string, taskName?: string) => {
    const { isCreateTask } = this.props;
    const { value, resources, createViewData } = this.state;
    const { name, type, taskKey } = createViewData;
    const resourceResult: any = resources.find((r: any) => r.name === (isCreateTask ? name : taskName));
    let resource = isCreateTask ? value.resource : resourceResult;

    if (!resourceResult && !value.resource) {
      resource = {
        name,
        type,
      };
      // resources.push(resource);
    }
    const newResource = this.convertResourceByParentKey(resource, parentKey);
    if (newResource instanceof Array) {
      const result = newResource.find((i: any) => {
        const keys = Object.keys(i);
        return keys[0] === key;
      });
      if (result) {
        const keys = Object.keys(result);
        result[keys[0]] = v;
      } else {
        newResource.push({
          [key]: v,
        });
      }
    } else {
      // @ts-ignore
      newResource[key] = v;
    }

    const state = {
      value: {
        ...value,
        resource: isCreateTask ? cloneDeep({
          ...resource,
          name,
          type,
        }) : null,
        resources,
      },
    };

    if (isCreateTask) {
      state.value.stage = {
        // @ts-ignore
        [taskKey]: name,
      };
    }

    this.setState(state);
    this.triggerChange(state.value);
  };
}
