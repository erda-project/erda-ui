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
import i18n from 'i18n';
import { Select } from 'antd';
import { priorityList } from 'project/pages/test-manage/constants';
import { UserInfo } from 'common';
import moment from 'moment';

const { Option } = Select;

interface IProps {
  dataSource: {
    priority: TEST_CASE.Priority;
    createdAt: string;
    creatorID: string;
  };
  onBlurCapture: (e: React.FocusEvent) => void;
  onChange: (key: string, value: any, autoSave: boolean) => void;
}

const CaseMeta = ({ onBlurCapture, onChange, dataSource }: IProps) => {
  return (
    <div onBlurCapture={onBlurCapture}>
      <p className="text-desc my-0">{i18n.t('dop:Priority')}</p>
      <div className="mt-2 mb-5">
        <Select
          style={{ width: '100%' }}
          value={dataSource.priority}
          onChange={(v: any) => onChange('priority', v, true)}
        >
          {priorityList.map((p) => (
            <Option key={p} value={p}>
              {p}
            </Option>
          ))}
        </Select>
      </div>
      <p className="text-desc my-0">{i18n.t('Creator')}</p>
      <p className="mt-2 mb-5">
        <UserInfo.RenderWithAvatar id={dataSource.creatorID} />
      </p>
      <p className="text-desc my-0">{i18n.t('create time')}</p>
      <p className="mt-2 mb-5">
        {dataSource.createdAt ? moment(dataSource.createdAt).format('YYYY-MM-DD HH:mm:ss') : ''}
      </p>
    </div>
  );
};
export default CaseMeta;
