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

import { findIndex, omit, each, isObject, find, map, omitBy } from 'lodash';
import * as React from 'react';
import { Table, Input, Popconfirm, Select, Switch, Button } from 'app/nusi';
import classNames from 'classnames';
import i18n from 'i18n';
import './editable-table.scss';

const { Option } = Select;

/*
  // 配置
  const columns = [
    {
      title: '域名',
      dataIndex: 'domain',
      key: 'domain',
      width: '60%',
    },
    {
      title: '使用HTTPS',
      dataIndex: 'useHttps',
      key: 'useHttps',
      width: '20%',
    },
  ];
  // 数据
  const arr = [
    {
      domain: 'test.com',
      useHttps: true,
      _deletable: false, // 不可删除
      _freeze: true, // 不可编辑、删除
    },
    {
      domain: 'whatever.com',
      useHttps: false,
    },
  ]
  // 使用
  <EditableTable
    dataSource={arr}
    columns={columns}
    operations={{
      add: row => this.addRow(row), // 操作都可选，不加则没有对应按钮
      edit: this.edit,
      delete: this.deleteRow,
    }}
    newRowDefault={{
      domain: '',
      useHttps: true,
    }}
    saveBtnText='添加'
    editableColumnsInfo={{
      domain: {
        columType: 'input',
      },
      otherColumn: {
        columType: 'select',
        list: [], // 选项数组
      },
      useHttps: {
        columType: 'component',
        getCompFn: ({ value, isEditing, handleChange }) => <Switch disabled={!isEditing} checkedChildren={'是'} unCheckedChildren={'否'} checked={!!value} size='small' onChange={checked => handleChange(checked)} />,
      },
    }}
    pagination={false} // 类似的其他属性会透传给antd table
  />
*/

class EditableCell extends React.Component {
  state = {
    value: this.props.value,
    isEditing: this.props.isEditing || false,
  };

  UNSAFE_componentWillReceiveProps({ isEditing, status }) {
    if (isEditing !== this.state.isEditing) {
      this.setState({ isEditing });
      if (isEditing) {
        this.oldValue = this.state.value;
      }
    }
    if (status && status !== this.props.status) {
      if (status === 'update') {
        this.props.onChange(this.state.value);
      } else if (status === 'cancel') {
        this.setState({ value: this.oldValue });
        this.props.onChange(this.oldValue);
      }
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps.isEditing !== this.state.isEditing ||
      nextState.value !== this.state.value;
  }

  handleChange = (value) => {
    this.props.onChange(value);
    this.setState({ value });
  };

  renderEditingCell = () => {
    const { columType, list, getCompFn } = this.props.columInfo || {};
    const { value } = this.state;
    let ItemComp = null;
    switch (columType) {
      case 'select':
        ItemComp = (
          <Select
            className="full-width"
            value={`${value}`}
            onChange={val => this.handleChange(val)}
          >
            {list.map((single) => {
              return <Option key={`${single.value}`}>{single.name}</Option>;
            })}
          </Select>
        );
        break;
      case 'switch':
        ItemComp = <Switch checked={!!value} size="small" onChange={e => this.handleChange(e.target.value)} />;
        break;
      case 'component':
        ItemComp = getCompFn({ value, isEditing: true, handleChange: this.handleChange });
        break;
      default:
        ItemComp = <Input value={value} onChange={e => this.handleChange(e.target.value)} />;
    }
    return ItemComp;
  };

  renderNormalCell = () => {
    const { columType, list, getCompFn } = this.props.columInfo || {};
    const { value } = this.state;
    let ItemComp = null;
    const index = findIndex(list, single => `${single.value}` === `${value}`); // value统一为字符串
    switch (columType) {
      case 'select':
        if (index > -1) {
          ItemComp = list[index].name;
        }
        break;
      case 'switch':
        ItemComp = <Switch checked={!!value} size="small" onChange={e => this.handleChange(e.target.value)} />;
        break;
      case 'component':
        ItemComp = getCompFn({ value, isEditing: false, handleChange: this.handleChange });
        break;
      default:
        ItemComp = value;
    }
    return ItemComp || '';
  };

  render() {
    const { isEditing } = this.state;
    return (
      <div> { isEditing ? this.renderEditingCell() : this.renderNormalCell()} </div>
    );
  }
}

const convertToEditabelColumns = ({
  columns, editabelColumns = [], renderColumns, columTypeInfo = {},
}) => {
  return columns.map(({ dataIndex, render, ...other }) => {
    return {
      dataIndex,
      ...other,
      render: (text, record, index) => {
        if (editabelColumns.includes(dataIndex)) {
          return renderColumns(index, dataIndex, render ? render(text, record, index) : text, columTypeInfo[dataIndex]);
        } else if (render) {
          return render(text, record, index);
        }
        return text;
      },
    };
  });
};

const innerAttrList = ['_key', '_isNewRow', '_deletable', '_freeze'];

const convertToRowInfo = (before, now) => {
  const object = omit(before, innerAttrList);
  each(now, (value, key) => {
    isObject(value) && (object[key] = value.value);
  });
  return object;
};

const getNewNum = (() => {
  let row = 0;
  return () => {
    row += 1;
    return row;
  };
})();

const getNewRowData = ({ columns, editableColumnsInfo, newRowDefault = {} }) => {
  const newRow = {
    _key: `$new-row-${getNewNum()}`,
    _isNewRow: true,
  };
  columns.forEach(({ key }) => {
    let defaultValue = i18n.t('common:no default value');
    const current = editableColumnsInfo[key];
    if (current && current.columType === 'select') {
      defaultValue = current.list[0].name;
    }
    newRow[key] = notUnf(newRowDefault[key]) ? newRowDefault[key] : defaultValue;
  });
  return newRow;
};

const addExtraRow = (data, props) => {
  if (find(data, '_isNewRow')) {
    return;
  }
  data.push(getNewRowData(props));
};

const notUnf = (value) => {
  return typeof value !== 'undefined';
};

const mergeEditable = (dataSource, editabelColumns) => {
  return map(dataSource, (item) => {
    const obj = { ...item };
    editabelColumns.forEach((key) => {
      obj[key] = {
        value: obj[key],
        _freeze: obj._freeze,
        isEditing: !!obj._isNewRow,
      };
    });
    return obj;
  });
};

const addInnerKey = (arr) => {
  return map(arr, obj => ({
    ...obj,
    _key: getNewNum(),
  }));
};

export default class EditableTable extends React.Component {
  constructor(props) {
    super(props);
    const dataSource = addInnerKey([...props.dataSource]);
    const operations = Object.keys(this.props.operations || {});
    const showAddRow = operations.includes('add');
    showAddRow && addExtraRow(dataSource, props);
    this.editabelColumns = Object.keys(props.editableColumnsInfo || {});
    const data = mergeEditable(dataSource, this.editabelColumns) || [];

    this.state = {
      data,
      dataSource,
      showAddRow,
      showEditBtn: operations.includes('update'),
      showDeleteBtn: operations.includes('delete'),
    };
    this.columns = convertToEditabelColumns({
      columns: props.columns,
      columTypeInfo: props.editableColumnsInfo,
      editabelColumns: this.editabelColumns,
      renderColumns: this.renderColumns,
    }).concat(this.getOperateColumn());
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { props } = this;
    const { dataSource: prevDataSource, operations } = props;
    const { dataSource: nextDataSource } = nextProps;
    if (prevDataSource !== nextDataSource) {
      const dataSource = addInnerKey([...nextDataSource]);
      const showAddRow = Object.keys(operations || {}).includes('add');
      showAddRow && addExtraRow(dataSource, props);
      const data = mergeEditable(dataSource, this.editabelColumns);
      this.setState({
        data,
        dataSource,
      });
    }
  }

  getOperateColumn = () => {
    const { saveBtnText } = this.props;
    const { showEditBtn, showDeleteBtn } = this.state;
    return {
      title: i18n.t('common:operation'),
      dataIndex: 'operation',
      render: (text, record, index) => {
        const { data } = this.state;
        const { isEditing } = data[index][this.editabelColumns[0]];
        const { _isNewRow, _freeze, _deletable } = data[index];
        return (
          <div className="editable-row-operations">
            {
              _freeze ? null :
                isEditing ?
                  _isNewRow ?
                    <Button className="row-btn row-save" onClick={() => this.editDone(index, 'add')}>{saveBtnText || i18n.t('common:save')}</Button>
                    :
                    <span>
                      <Popconfirm title={`${i18n.t('common:confirm cancel editing')}?`} onConfirm={() => this.editDone(index, 'cancel')}>
                        <Button className="row-btn row-cancel">{i18n.t('common:cancel')}</Button>
                      </Popconfirm>
                      <Button type="primary" className="row-btn row-save" onClick={() => this.editDone(index, 'update')}>{saveBtnText || i18n.t('common:save')}</Button>
                    </span>
                  :
                    <span>
                      {showDeleteBtn && _deletable !== false ?
                        <Popconfirm title={`${i18n.t('common:confirm deletion')}?`} onConfirm={() => this.editDone(index, 'delete')}>
                          <Button type="danger" className="row-btn row-delete">{i18n.t('common:delete')}</Button>
                        </Popconfirm> : null}
                      {showEditBtn ? <Button type="primary" className="row-btn row-edit" onClick={() => this.edit(index)}>{i18n.t('common:edit')}</Button> : null}
                    </span>
            }
          </div>
        );
      },
    };
  };

  handleChange(key, index, value) {
    const { data } = this.state;
    data[index][key].value = value;
    this.setState({ data });
  }

  edit(index) {
    const { data } = this.state;
    const current = data[index];
    map(current, (value) => {
      if (value && notUnf(value.isEditing)) {
        value.isEditing = true;
      }
    });
    this.setState({ data });
  }

  editDone(index, action) {
    const { operations } = this.props;
    const { data, dataSource } = this.state;
    const current = data[index];
    const toggleEditStatus = () => {
      map(current, (value) => {
        if (value && notUnf(value.isEditing)) {
          value.isEditing = false;
          value.status = action;
        }
      });
      this.setState({ data }, () => {
        omitBy(current, notUnf);
      });
    };
    (operations[action] || toggleEditStatus)({ data: convertToRowInfo(dataSource[index], current), toggleEditStatus });
  }

  renderColumns = (index, key, text, columInfo) => {
    const { isEditing, status } = this.state.data[index][key];
    if (isEditing === 'undefined') {
      return text;
    }
    return (
      <EditableCell
        isEditing={isEditing}
        value={text}
        columInfo={columInfo}
        onChange={value => this.handleChange(key, index, value)}
        status={status}
      />
    );
  };

  render() {
    const { showAddRow, dataSource } = this.state;

    const classes = classNames({
      'show-add-row': showAddRow,
      'editable-table': true,
    });
    return <Table {...this.props} className={classes} rowKey="_key" dataSource={dataSource} columns={this.columns} />;
  }
}
