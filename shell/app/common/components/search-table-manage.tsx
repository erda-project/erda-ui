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
import { Table, Spin } from 'app/nusi';
import { SearchTable } from 'common';
import './search-table-manage.scss';

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
  currPage: number;
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

export class SearchTableManage extends React.PureComponent<IProps, IState> {
  constructor(props: IProps) {
    super(props);
    this.state = {
      currPage: this.props.currPage,
    };
  }

  updateOps = (opsVal: any) => {
    const currPage = opsVal.currPage ? opsVal.currPage : 1;
    this.setState({ ...opsVal, currPage });
    this.props.getTableList({ ...this.state, ...opsVal, currPage });
  };

  render() {
    const { searchList, extraItems, columns, pageSize, isFetching, tableList, tableTotal, extraProps } = this.props;
    const { currPage } = this.state;
    const searchListOps = {
      list: searchList,
      onUpdateOps: this.updateOps,
    };

    return (
      <div>
        <Spin spinning={isFetching}>
          <SearchTable searchListOps={searchListOps} extraItems={extraItems}>
            <Table
              rowKey="id"
              dataSource={tableList}
              columns={columns}
              rowClassName={() => 'pointer'}
              pagination={{
                current: currPage,
                pageSize,
                total: tableTotal,
                showSizeChanger: true,
                onChange: (page) => {
                  this.updateOps({ currPage: page });
                },
                onShowSizeChange: () => {
                  this.updateOps({ currPage: 1 });
                },
              }}
              scroll={{ x: '100%' }}
              {...extraProps}
            />
          </SearchTable>
        </Spin>
      </div>
    );
  }
}
