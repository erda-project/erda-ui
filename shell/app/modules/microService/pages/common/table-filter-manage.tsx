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

import * as React from 'react';
import { SearchTableManage } from 'common';

interface IProps {
  searchList: Array<{
    [propName: string]: any;
  }>;
  extraItems: any;
  columns: object[];
  currPage: number;
  pageSize: number;
  isFetching: boolean;
  tableList: object[];
  tableTotal: number;
  getTableList: (payload: object) => void;
  extraProps?: any;
}

interface IState {
  modifiedAtOrder: any;
}

/** usage:
 * <SearchTableManage
    searchList={searchList} // 搜索配置项
    extraItems={extraItems} // 按钮配置项
    columns={columns} // table列配置项
    currPage={currPage}
    pageSize={pageSize}
    tableList={tableList} // table 内容
    tableTotal={tableTotal} //table 展示内容总个数
    isFetching={isFetching}
    getTableList={getTableList} // 获取table 内容
  />
 */
export class TableFilterManage extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      modifiedAtOrder: undefined,
    };
  }

  updateOps = (opsVal: any) => {
    this.setState({ ...opsVal, currPage: 1 });
    this.props.getTableList({ ...this.state, ...opsVal, currPage: 1 });
  };

  handleTableChange = (pagination: any, filters: any, sorter: {[param: string]: any; columnKey: string; order: string}) => {
    const { columnKey, order } = sorter;
    if (!columnKey || columnKey === 'modifiedAt') {
      const isDescend = order && (order !== 'descend');
      if (this.state.modifiedAtOrder !== isDescend) {
        this.setState({
          modifiedAtOrder: isDescend,
        });
        this.updateOps({
          modifiedAtOrder: isDescend,
        });
      }
    }
  };

  render() {
    const { searchList, extraItems, columns, pageSize, isFetching, tableList, tableTotal, currPage, getTableList, extraProps } = this.props;
    return (
      <SearchTableManage
        searchList={searchList}
        extraItems={extraItems}
        columns={columns}
        currPage={currPage}
        pageSize={pageSize}
        tableList={tableList}
        tableTotal={tableTotal}
        isFetching={isFetching}
        getTableList={getTableList}
        extraProps={{
          ...extraProps,
          onChange: this.handleTableChange,
        }}
      />
    );
  }
}

