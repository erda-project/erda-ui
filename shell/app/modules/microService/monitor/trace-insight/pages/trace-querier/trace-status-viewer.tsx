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
import { Icon, Tooltip } from 'app/nusi';
import { isEmpty } from 'lodash';
import { Icon as CustomIcon, EmptyHolder } from 'common';
import { notify } from 'common/utils';
import PureTraceDetail from './trace-detail';
import i18n from 'i18n';
import './trace-status-viewer.scss';

const TraceStatusViewer = ({
  traceStatusDetail,
  cancelTraceStatus,
  spanDetailContent,
  traceDetailContent,
  isTraceDetailContentFetching,
  getSpanDetailContent,
}: any) => {
  if (isEmpty(traceStatusDetail)) {
    return <EmptyHolder />;
  }

  const {
    requestId,
    status,
    statusName,
  } = traceStatusDetail;

  const handleCancelRequestPending = (id: string) => {
    try {
      cancelTraceStatus({ requestId: id });
    } catch (error) {
      notify('error', error);
    }
  };

  // 状态，0：初始化、1：成功、2：失败、3：主动取消 对应 statusNodeList 数组下标
  const statusNodeList = [
    (
      <div className="request-status-wp pending">
        <span className="request-status-text">
          <Icon type="loading" /> { statusName }
        </span>
        <Tooltip title={i18n.t('microService:cancel')}>
          <span
            className="request-status-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleCancelRequestPending(requestId);
            }}
          >
            <Icon type="pause-circle" />
          </span>
        </Tooltip>
      </div>
    ),
    (
      <PureTraceDetail
        spanDetailContent={spanDetailContent}
        traceDetailContent={traceDetailContent}
        isTraceDetailContentFetching={isTraceDetailContentFetching}
        getSpanDetailContent={getSpanDetailContent}
      />
    ),
    (
      <div className="request-status-wp failure">
        <span className="request-status-text">
          <CustomIcon className="failure" type="guanbi-fill" /> { statusName }
        </span>
      </div>
    ),
    (
      <div className="request-status-wp cancel">
        <span className="request-status-text">
          <Icon type="minus-circle" theme="filled" /> { statusName }
        </span>
      </div>
    ),
  ];
  return (
    <div className="trace-status-viewer">
      { statusNodeList[status] }
    </div>
  );
};

export default TraceStatusViewer;
