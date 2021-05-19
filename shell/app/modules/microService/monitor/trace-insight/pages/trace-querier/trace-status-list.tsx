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
import { map as _map } from 'lodash';
import moment from 'moment';
import { Spin, Tooltip, Pagination } from 'app/nusi';
import { Icon as CustomIcon, EmptyHolder } from 'common';
import { goTo, notify } from 'common/utils';
import i18n from 'i18n';
import './trace-status-list.scss';
import { PauseOne, Loading, ReduceOne } from '@icon-park/react';


const TraceStatusList = (props: any) => {
  const {
    dataSource,
    isFetching,
    traceStatusListPaging,
    setTraceStatusListPaging,
    getTraceStatusList,
    cancelTraceStatus,
  } = props;
  const { page, total } = traceStatusListPaging;

  const handleChangePage = (curPage: number, curSize?: number) => {
    getTraceStatusList({
      page: curPage,
      size: curSize,
    });
  };

  const handleShowSizeChange = (curPage: number, curSize: number) => {
    handleChangePage(curPage, curSize);
    setTraceStatusListPaging({ size: curSize });
  };

  const handleCancelRequestPending = (id: string) => {
    try {
      cancelTraceStatus({ id });
    } catch (error) {
      notify('error', error);
    }
  };

  const renderListItem = ({
    id,
    status,
    statusName,
    updateTime,
    requestId,
  }: any) => {
    // 状态，0：初始化、1：成功、2：失败、3：主动取消 对应 statusNodeList 数组下标
    const statusNodeList = [
      {
        className: 'pending',
        node: (
          <span>
            <span className="request-status-text">
              <Loading /> { statusName }
            </span>
            <Tooltip title={i18n.t('microService:cancel')}>
              <span
                className="request-status-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCancelRequestPending(id);
                }}
              >
                <PauseOne size="20px" />
              </span>
            </Tooltip>
          </span>
        ),
      },
      {
        className: 'success',
        node: <span><CustomIcon className="success" type="yuanxingxuanzhongfill" /> { statusName }</span>,
      },
      {
        className: 'failure',
        node: <span><CustomIcon className="failure" type="guanbi-fill" /> { statusName }</span>,
      },
      {
        className: 'cancel',
        node: <span><ReduceOne theme="filled" /> { statusName }</span>,
      },
    ];

    return (
      <li
        key={id}
        onClick={() => goTo(`./${requestId}`)}
        className="trace-status-list-item"
      >
        <span className="update-time nowrap">
          { moment(updateTime).format('YYYY-MM-DD HH:mm:ss') }
        </span>
        <span className={`request-status ${statusNodeList[status].className}`}>
          { statusNodeList[status].node }
        </span>
      </li>
    );
  };

  if (dataSource.length === 0) {
    return <EmptyHolder />;
  }

  return (
    <div className="trace-status">
      <Spin spinning={isFetching}>
        <ul className="trace-status-list">
          { _map(dataSource, item => renderListItem(item)) }
        </ul>
        <Pagination
          defaultCurrent={page}
          total={total}
          showSizeChanger
          onShowSizeChange={handleShowSizeChange}
          onChange={handleChangePage}
        />
      </Spin>
    </div>
  );
};

export default TraceStatusList;
