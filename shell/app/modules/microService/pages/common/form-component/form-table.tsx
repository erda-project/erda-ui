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
import { toArray, isEmpty } from 'lodash';
import { Table } from 'app/nusi';
import i18n from 'i18n';

export default class FormTable extends React.Component<any, any> {
  headIndex: number;

  tableIndex = 0;

  constructor(props: any) {
    super(props);
    const { dataSource = [] } = props;

    this.state = {
      dataSource,
    };
  }

  static getDerivedStateFromProps(nextProps: any, prevState: any) {
    const { dataSource } = nextProps;
    if (dataSource && isEmpty(prevState.dataSource)) {
      return {
        ...prevState,
        dataSource,
      };
    }
    return null;
  }

  onAdd = (extra?: { rowType: string }) => {
    const { dataSource } = this.state;
    const len = dataSource.length;
    if (this.tableIndex < len) {
      this.tableIndex = len;
    }
    dataSource.push({ key: this.tableIndex, ...extra });
    this.tableIndex += 1;

    this.setState({ dataSource });
  };

  createFieldValue(name: string, values: any) {
    return values.reduce((p: any, c: any, i: number) => {
      const key = `${name}.${i}`;
      return {
        ...p,
        [key]: c,
      };
    }, {});
  }

  onDelete(index: number) {
    const { dataSource } = this.state;
    dataSource.splice(index, 1);
    const { name, form } = this.props;

    const valueMap = form.getFieldValue(name);
    if (!isEmpty(valueMap)) {
      let values = toArray(valueMap);
      values.splice(index, 1);
      values = this.createFieldValue(name, values);

      form.setFieldsValue(values);
    }
    this.setState({ dataSource });
  }

  onClean = () => {
    this.setState({ dataSource: [] });
  };

  EditableCell = (config: any) => {
    const { dataSource } = this.state;
    const { name, components } = this.props;
    const { editable, index, formProps = {}, operation, dataIndex, title, combineConfig } = config;
    const { FormItem } = components;
    let { children } = config;

    const _extra = {
      name,
      index,
      dataIndex,
      dataSource,
    };
    if (operation) {
      const { onDelete } = this;
      const operationProps = {
        onDelete: onDelete.bind(this, index),
        _extra,
      };
      children = operation(operationProps);
    } else if (editable) {
      const _config = {
        type: 'input',
        required: true,
        label: title,
        ...formProps,
        name: `${name}[${index}].${dataIndex}`,
        extraProps: {
          className: 'no-margin',
        },
        // table组件额外提供的配置信息，供联动表单使用，传入combineConfig可做联动
        // 带_开头的配置最后传入到组件都会被过滤掉
        _extra,
      };
      children = (
        <FormItem _config={_config} combineConfig={combineConfig} fromTable />
      );
    }

    return (
      <td>
        {children}
      </td>
    );
  };

  combineConfig = (config: any, { index }: any) => {
    if (this.headIndex === undefined) {
      this.headIndex = index;
    }
    const { headConfig = {} } = this.props;
    const { onClick } = headConfig;

    return {
      ...config,
      onClick: () => {
        if (onClick) {
          onClick(this.onAdd);
        } else {
          this.onAdd();
        }
      },
    };
  };

  resetHeadIndex() {
    const { publish } = this.props;
    // 局部重置head的索引
    if (this.headIndex !== undefined) {
      this.headIndex = publish('Head', { index: this.headIndex });
    }
  }

  render() {
    const { headConfig, columns, mode, components, props } = this.props;
    const { dataSource } = this.state;
    const { Head } = components;
    this.resetHeadIndex();

    return (
      <React.Fragment>
        <Head {...headConfig} onAdd={this.onAdd} combineConfig={this.combineConfig} />
        <Table
          className="form-hoc-table"
          components={{
            body: {
              cell: this.EditableCell,
            },
          }}
          dataSource={dataSource}
          pagination={false}
          locale={{
            emptyText: i18n.t('microService:no data'),
          }}
          // TODO: 这个props很容易混淆，需要注意
          {...props}
          columns={getColumns(columns, mode)}
        />
      </React.Fragment>
    );
  }
}

function getColumns(columns: any[], mode: string) {
  return columns.reduce((p: any, col: any) => {
    const { editable, operation, dataIndex } = col;
    if (mode === 'detail' && dataIndex === 'operation' && operation) return p;

    if (editable || operation) {
      p.push({
        ...col,
        onCell: (record: any, index: number) => {
          return {
            index,
            record,
            ...col,
          };
        },
      });
    } else {
      p.push(col);
    }
    return p;
  }, []);
}

