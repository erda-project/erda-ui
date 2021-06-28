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

import React, { Component } from 'react';
import classnames from 'classnames';
import { Form, Spin } from 'app/nusi';
import { result, set } from 'lodash';
import BindComponent from './bind-component';

const getComponents = (instance: any, model: any) => {
  const { components } = model;
  const data = model.data();

  return Object.keys(components).reduce((p, key) => {
    const config = data[key];
    let component = components[key];
    if (config) {
      component = BindComponent(instance, model, key, component, config);
    } else {
      // eslint-disable-next-line no-console
      console.warn(`Did not find the configuration of the ${key} component, check the incoming data method?`);
    }
    return {
      ...p,
      [key]: component,
    };
  }, {} as any);
};

interface IProps {
  model: any;
  props: any;
  param?: any[];
  loading: boolean;
  children: any;
  className?: string;
  formProps?: any;
}

const DUMMY_STATE = {};

const createFormComponent = (model: any, View: any) => {
  let changData = {} as any;
  class FormComponent extends Component<any, any> {
    _subscribers: any;

    unmounted: boolean;

    constructor(props: any) {
      super(props);
      const { form } = props;
      model.setForm(form);
      model.unsubscribe(this.onUpdate, this.onForceUpdate);
      model.subscribe(this.onUpdate, this.onForceUpdate);
      // 注册进当前实例组件
      set(model, 'components', getComponents(this, model));
    }

    onValidate = () => {
      const { validateFieldsAndScroll, getFieldsValue } = this.props.form;
      return new Promise((resolve, reject) => {
        validateFieldsAndScroll((errors: any) => {
          if (errors) {
            reject(errors);
          } else {
            const values = filterField(getFieldsValue());
            resolve(values);
          }
        });
      });
    };

    componentDidMount() {
      result(model, 'componentDidMount');
    }

    componentWillUnmount() {
      this.unmounted = true;
      this._unsubscribe();
      result(model, 'componentWillUnmount');
    }

    _unsubscribe() {
      model.unsubscribe(this.onUpdate, this.onForceUpdate);
    }

    onForceUpdate = () => {
      this.forceUpdate();
    };

    onUpdate = () => {
      return new Promise((resolve) => {
        if (!this.unmounted) {
          this.setState(DUMMY_STATE, resolve);
        } else {
          resolve();
        }
      });
    };

    unsubscribe(key: string) {
      const handle = this._subscribers[key];
      if (!handle) {
        throw new Error(`${key} Not subscribed`);
      }

      delete this._subscribers[key];
    }

    subscribe(key: string, fn: Function) {
      if (!this._subscribers) this._subscribers = {};

      this._subscribers[key] = fn;
    }

    publish = (key: string, options: any) => {
      const handle = this._subscribers[key];
      if (!handle) {
        throw new Error(`${key} Not subscribed`);
      }
      return handle(options);
    };

    publishAll(options: any) {
      if (this._subscribers) {
        Object.keys(this._subscribers).forEach((key) => this.publish(key, options));
      }
    }

    getChangData() {
      return changData;
    }

    clearChangData() {
      changData = {};
    }

    componentDidUpdate() {
      // 清理本次变动的值
      this.clearChangData();
    }

    render() {
      // 重置所有组件计数器
      this.publishAll({ loop: true, index: 0 });
      const element = <View model={model} onValidate={this.onValidate} />;
      this.publishAll({ loop: false });
      return element;
    }
  }

  return Form.create({
    onFieldsChange(_props: any, changed: any) {
      // 记录改动，提升性能，给shouldComponentUpdate去对比使用
      changData = changed;
    },
    // 监听form表单change
    onValuesChange(_props: any, changed: any, allValues: any) {
      if (model.onValuesChange) {
        model.onValuesChange(changed, allValues);
      }
    },
  })(FormComponent);
};

// 这里提供渲染劫持，提供form表单的校验、提供迭代配置的订阅重置能力，不关心具体提供组件
// 最终的结果是要达到mvc的模式，做分离
// react组件专注于提供视图能力
// modle专注于逻辑处理
// config来做提供数据，注意：最好使用reselect来处理数据，不然函数形式的config每次都会重新生成一个新对象导致render
//   使用reselect减少使用嵌套的reselect，比如当父reselect没更新，子reselect更新了会导致子reselect数据无法更新
export default class FormHoc extends Component<IProps, any> {
  model: any;

  Component: any;

  constructor(props: any) {
    super(props);

    const { model, param, children, props: _props } = props;
    const Model = model;
    this.model = new Model(_props, ...param);
    this.Component = createFormComponent(this.model, children);
  }

  render() {
    const { loading, className, formProps, props } = this.props;
    this.model.setProps(props);

    const FormComponent = (
      <Form layout="vertical" {...formProps} className={classnames('form-hoc', className)}>
        <Spin spinning={loading}>
          <this.Component />
        </Spin>
      </Form>
    );
    return FormComponent;
  }
}

// 过滤下划线开头的对象字段
export function filterField(values: any) {
  return Object.keys(values).reduce((p, key) => {
    if (key.charAt(0) === '_') {
      return p;
    }
    const value = values[key];
    return {
      ...p,
      [key]: value,
    };
  }, {} as any);
}
