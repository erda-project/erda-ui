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
import { omit } from 'lodash';
import { Table } from 'app/nusi';
import i18n from 'i18n';

export default class FormPureTable extends Component<any, any> {
  EditableCell = (config: any) => {
    const { components, onDeleteData, name } = this.props;
    const { editable, index, formProps = {}, operation, dataIndex, title, combineConfig } = config;
    const { FormItem } = components;
    let { children } = config;

    const _extra = {
      name,
      index,
      dataIndex,
    };
    if (operation) {
      const operationProps = {
        onDelete: onDeleteData,
        extra: _extra,
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
      children = <FormItem _config={_config} combineConfig={combineConfig} fromTable />;
    }

    return <td>{children}</td>;
  };

  // shouldComponentUpdate(nextProps: any): boolean {
  //   return false;
  // }

  render() {
    const { columns, mode } = this.props;

    return (
      <Table
        className="form-hoc-table"
        pagination={false}
        locale={{
          emptyText: i18n.t('msp:no data'),
        }}
        rowKey={(_, i) => `${i}`}
        {...omit(this.props, ['components', 'onDeleteData', 'name', 'mode'])}
        components={{
          body: {
            cell: this.EditableCell,
          },
        }}
        columns={getColumns(columns, mode)}
        scroll={{ x: '100%' }}
      />
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
