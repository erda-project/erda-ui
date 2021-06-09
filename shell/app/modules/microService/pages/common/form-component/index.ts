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

import { isFunction, last, get, set, unset, isArray, isPlainObject, isEmpty, uniq, head, size } from 'lodash';
import stringToPath from 'lodash/_stringToPath';
import { WrappedFormUtils } from 'core/common/interface';
import { FormFooter, FormList, TopButton } from './form-component';
import FormItem from './form-item';
import Table from './form-table';
import PureTable from './form-pure-table';
import Head from './form-head';
import Container from './container';

import './index.scss';

// 提供类似vue的api？
// 不然可能存在命名冲突，除非强规范
// 目前的约束字段
// data 迭代组件数据
// componets 跌代组件，会在form-hoc组件中和匹配到的数据组合为一个新组件，如果在data中没有找到数据即为原来的组件
// setProps 这个是个问题，model层需要取用实例化组件的props，理论上应该由组件提供，但这里的能力并非如同unstated来做状态管理，虽然两者非常相似，所有model是针对单个组件独立出来的model层，并非是做多组件状态管理
// onValuesChange rc-form的onValuesChange回调函数
// watch 需要监听的form表单变化值，当值改变时触发，这里是当前组件对onValuesChange再次封装提供的
// componentDidMount react生命周期钩子函数
// setForm 类似于setProps，需要将props注入到组件中
export default abstract class Component<State, Props> extends Container<State, Props> {
  mode: string;

  form: WrappedFormUtils;

  unmounted: boolean;

  components = {
    FormFooter,
    FormList,
    TopButton,
    FormItem,
    Table,
    PureTable,
    Head,
  };

  constructor(props: Props, mode: string) {
    super(props);
    this.mode = mode;
  }

  setForm(form: WrappedFormUtils) {
    this.form = form;
  }

  componentWillUnmount() {
    this.unmounted = true;
  }

  delaySetFieldsValue(value: any) {
    Promise.resolve().then(() => {
      if (!this.unmounted) {
        this.form.setFieldsValue(value);
      }
    });
  }

  // 全局级合并数据
  combineConfig(config: any, { key }: any) {
    const { mode, components, onDeleteTableData } = this;
    const extra = { mode } as any;
    switch (key) {
      case 'FormItem':
        extra.form = this.form;
        break;
      case 'Head':
        extra.components = components;
        break;
      case 'Table':
      case 'PureTable':
        extra.components = components;
        extra.onDeleteData = onDeleteTableData;
        break;
      default:
        break;
    }

    return {
      ...config,
      ...extra,
    };
  }

  // 组件级合并数据
  FormItem(config: any) {
    const { name } = config;
    const value = get(this.state, ['values', ...stringToPath(name)]);
    if (value !== undefined) {
      // eslint-disable-next-line no-param-reassign
      config.initialValue = value;
    }

    return config;
  }

  Table(config: any) {
    const { name } = config;
    const path = `values.${name}`;
    const dataSource = get(this.state, path);
    if (dataSource) {
      // eslint-disable-next-line no-param-reassign
      config.dataSource = dataSource;
    }

    return config;
  }

  PureTable(config: any) {
    const { name } = config;
    const tableKey = this.getTableKey(name);
    const dataSource = get(this.state, ['values', ...stringToPath(tableKey)]) || [];
    // eslint-disable-next-line no-param-reassign
    config.dataSource = dataSource;

    return config;
  }

  filterOptions(name: any, field: string, options: any[]) {
    if (!isEmpty(options)) {
      const allValue = this.form.getFieldsValue();
      const value = get(allValue, name);
      if (!isEmpty(value)) {
        const fieldValue = uniq(
          value.reduce((p: any, c: any) => {
            const v = c[field];
            if (v) {
              p.push(v);
            }
            return p;
          }, []),
        );
        return options.filter(({ value: v }) => {
          return !fieldValue.includes(v);
        });
      }
      return options;
    }
    return options;
  }

  getTableKey(name: string) {
    return `${name}`;
  }

  getListName(name: string, index: number, field: string) {
    return `${name}[${index}].${field}`;
  }

  _setTableData(keys: string[], callback?: any) {
    const rootKey = head(keys) as string;
    const value = get(this.state, rootKey);

    this.setState({ [rootKey]: value }, callback);
  }

  // 清理table数据
  onCleanTableData(names: string[], key = 'values') {
    names.forEach((name) => {
      const tableKey = this.getTableKey(name);
      const keys = isArray(key) ? key : [key];
      const paths = [...keys, ...stringToPath(tableKey)];
      unset(this.state, paths);

      this._setTableData(keys);
    });
  }

  onAddTableData(name: string, key: string | string[] = 'values', rowData?: any) {
    const tableKey = this.getTableKey(name);
    const keys = isArray(key) ? key : [key];
    const paths = [...keys, ...stringToPath(tableKey)];
    let dataSource = get(this.state, paths) as any;
    if (!isEmpty(dataSource)) {
      const { _key = 0 } = last(dataSource) as any;
      dataSource = dataSource.concat({ _key: _key + 1, ...rowData });
    } else {
      dataSource = [{ _key: 1, ...rowData }];
    }
    set(this.state, paths, dataSource);

    this._setTableData(keys);
  }

  onDeleteTableData = (name: string, index: number, key: string | string[] = 'values') => {
    const tableKey = this.getTableKey(name);
    const keys = isArray(key) ? key : [key];
    const paths = [...keys, ...stringToPath(tableKey)];
    // 必定存在
    const dataSource = get(this.state, paths) as any;
    const value = dataSource.concat();
    value.splice(index, 1);
    // 删除性能比较低，会render整个table的所有数据，原因在于table的key是动态调整的，意味这值也是动态变化的，每次触发的值是table中所有表单的值
    const formValue = this.form.getFieldValue(name);
    formValue.splice(index, 1);
    this.form.setFieldsValue({ [name]: formValue });

    set(this.state, paths, value);
    this._setTableData(keys);
  };

  onValuesChange(changed: any, allValues: any) {
    const [parseName, parseIndex, parseValue] = this.parseChangeValue(changed);
    const names = getNames(parseName, parseIndex);

    names.forEach((name) => {
      this.call(['watch', name], parseValue, parseIndex, allValues, name);
    });
  }

  // 解析改变的表单值，供watch时使用
  parseChangeValue = (map: any, name = '', parseIndex: number[] = []): any => {
    const keys = Object.keys(map);
    if (size(keys) > 1) {
      return [name, parseIndex, map];
    }
    const [k] = keys;
    const v = map[k];
    const parseName = name ? `${name}.${k}` : k;
    const parseValue = get(map, k);
    if (isArray(v)) {
      const [i] = Object.keys(v) as any;
      const o = v[i];
      if (isPlainObject(o)) {
        parseIndex.push(i);
        return this.parseChangeValue(o, parseName, parseIndex);
      }
      // parseValue = get(map, [k, i]);
    }
    return [parseName, parseIndex, parseValue];
  };

  // 调用当前类中的方法
  call(key: string | string[], ...params: any) {
    const method = get(this, key);
    if (isFunction(method)) {
      return method.apply(this, params);
    }
    return null;
  }

  // 批量创建watch函数，接受names值
  createWatch(names: string[], handle: Function) {
    return names.reduce((p, name: string, i: number) => {
      return {
        ...p,
        [name]: handle(name, i),
      };
    }, {});
  }
}

function getNames(name: string, indexs: number[]) {
  const names = name.split('.');
  const list: string[] = [];
  let value = '';
  let indValue = '';
  names.forEach((n, i) => {
    let val = n;
    if (value) val = `.${val}`;
    value += val;
    list.push(value);
    const ind = indexs[i];
    if (ind !== undefined) {
      indValue += val;
      indValue += `.${ind}`;
      list.push(indValue);
    }
  });
  return list;
}
