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
import { Radio, Space } from 'antd';
import { Badge, Ellipsis, Pagination, EmptyHolder, Tags } from 'common';
import moment from 'moment';
import i18n from 'i18n';

interface IProps {
  list: PROJECT_DEPLOY.Release[];
  getList: (q: { pageNo?: number; pageSize?: number }) => void;
  total: number;
  pageNo: number;
  pageSize: number;
  onSelect: (r: string) => void;
  showProjectName?: boolean;
  className?: string;
  value?: string;
}

const ReleaseSelector = (props: IProps) => {
  const { getList, list, total, pageSize, pageNo, value, onSelect, showProjectName, className = '' } = props;

  return (
    <div className={`${className}`}>
      <Radio.Group
        onChange={(e) => {
          const v = e.target.value;
          onSelect(v);
        }}
        value={value}
      >
        {list.length ? (
          <Space direction="vertical">
            {list.map((item) => {
              const [status, statusText] = item.isFormal
                ? ['success', i18n.t('dop:Formal')]
                : ['error', i18n.t('dop:Informal')];
              return (
                <Radio
                  value={item.releaseId}
                  key={item.releaseId}
                  className={`p-2 text-default-8 mr-0 w-full hover:text-default hover:bg-default-06 ${
                    value === item.releaseId ? 'bg-default-06' : ''
                  }`}
                >
                  <div className="flex flex-h-center  justify-between w-[500px] ">
                    <div className="flex overflow-hidden">
                      <Ellipsis className="mx-1" title={item.version || item.releaseId} />
                      <Badge status={status} text={statusText} showDot={false} />
                    </div>
                    <div className="flex-1 mx-1">
                      {item.tags ? (
                        <Tags labels={item.tags.map((tag) => ({ color: tag.color, label: tag.name }))} />
                      ) : null}
                    </div>
                    <span className="ml-3">
                      {showProjectName ? <span className="mr-4">{item.displayname || '-'}</span> : null}
                      <span>{item.createdAt && moment(item.createdAt).format('YYYY-MM-DD HH:mm:ss')}</span>
                    </span>
                  </div>
                </Radio>
              );
            })}
          </Space>
        ) : (
          <EmptyHolder relative className={'w-[500px] text-default-6'} />
        )}
      </Radio.Group>
      {list.length ? (
        <div className="flex justify-end">
          <Pagination
            theme="dark"
            hidePageSizeChange
            total={total}
            pageSize={pageSize}
            current={pageNo}
            onChange={(pgNo: number) => getList({ pageNo: pgNo })}
          />
        </div>
      ) : null}
    </div>
  );
};

export default ReleaseSelector;
