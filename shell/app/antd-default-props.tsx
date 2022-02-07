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
import { Pagination, Modal, Spin } from 'antd';
import { Loading } from 'common';
import { isZh } from 'i18n';
import { PAGINATION } from './constants';

const setAntdDefault = () => {
  Pagination.defaultProps = {
    showSizeChanger: false,
    ...Pagination.defaultProps,
    pageSize: PAGINATION.pageSize,
    pageSizeOptions: PAGINATION.pageSizeOptions,
    showTotal: (total) => (isZh() ? `共计 ${total} 条` : `total ${total} items`),
  };

  Modal.defaultProps = {
    ...Modal.defaultProps,
    centered: true,
  };

  Spin.defaultProps = {
    ...Spin.defaultProps,
    delay: 100,
  };
  Spin.setDefaultIndicator(<Loading />);
};

export default setAntdDefault;
