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
import { isArray, isFunction, isEqual, get } from 'lodash';
import { filterField } from './form-hoc';

// 配置对象可以为函数，传入实例和props来返回配置
const getValue = (value: any, params: any) => {
  return isFunction(value) ? value(...params) : value;
};

// 通过返回一个新的函数组件，来完成对目标组件所需props的迭代、管理操作
export default function bindComponent(instance: any, model: any, key: string, Component: any, data: any) {
  let configIndex = 0;
  let configLoop = true;
  instance.subscribe(key, ({ loop = configLoop, index = configIndex }: any) => {
    configIndex = index;
    configLoop = loop;

    if (!configLoop) {
      return index;
    }
  });
  const combineConfig = (configList: any[], config: any, props: any) => {
    // 合并配置的能力，分为3个级别，全局级，组件级，单独调用级，优先级为反向
    return [model, model, props].reduce((c, context, i) => {
      const combineName = i === 1 ? key : 'combineConfig';
      if (context && isFunction(context[combineName])) {
        // 保证this指向
        return context[combineName](c, { configList, model, index: configIndex, props, key });
      }
      return c;
    }, config);
  };
  const getMergeProps = (props: any) => {
    const configList = getValue(data, [model, props]);
    if (!isArray(configList)) {
      throw new SyntaxError(`${key} Property must be an array or a function that returns an array`);
    }

    // 当传入_config的prosp时，停止迭代配置而使用此值
    const { _config } = props;
    let config = _config;
    if (!config) {
      const len = configList.length;
      if (configIndex >= len) {
        configIndex = len - 1;
        throw new Error(`The number of ${key} component calls is greater than the length of the configuration list. Please check the configuration property ${key}.`);
      }
      config = configList[configIndex];
    }
    config = getValue(config, [model, props]);
    config = combineConfig(configList, config, props);

    if (!_config) configIndex += 1;

    // 合并组组件props
    return filterField({
      ...props,
      ...config,
    });
  };

  class PureComponent extends React.Component<any, any> {
    shouldComponentUpdate(nextProps: any) {
      const { name } = nextProps;
      // isEqual对比引用时并非严格对比引用地址，而是判断里面的值，这点注意，尤其是对比两个同样数据不同引用时的情况需要考虑
      // 还有一点需要注意，如果在onchange后有异步操作时，异步请求前table监听到changData会render，但在异步请求后setState的值对于table不是依赖changData也已清空所以table不render，但对于table里的formItem是依赖时此时会有问题，formItem即使重新计算会render但它依赖于父组件即table组件render，所以把依赖值要加到table里
      const isUpdate = !isEqual(nextProps, this.props);
      if (name) {
        const changData = instance.getChangData();
        const _data = get(changData, name);
        if (_data || isUpdate) {
          return true;
        }
        return false;
      }
      return isUpdate;
    }

    render() {
      return (
        <Component {...this.props} />
      );
    }
  }

  return function BindConfig(props: any) {
    const mergerProps = getMergeProps(props);

    return (
      <PureComponent {...mergerProps} />
    );
  };
}
