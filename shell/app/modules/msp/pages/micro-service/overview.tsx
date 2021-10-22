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
import { Spin } from 'antd';
import { Holder, PureBoardGrid } from 'common';
import { useUpdate } from 'common/use-hooks';
import { TimeSelectWithStore } from 'msp/components/time-select';
import { getDashboard } from 'msp/services';
import { isEmpty } from 'lodash';
import DC from '@erda-ui/dashboard-configurator/dist';
import monitorCommonStore from 'common/stores/monitorCommon';

const DashBoard = React.memo(PureBoardGrid);

interface IState {
  layout: DC.Layout;
  loading: boolean;
}

const Overview = () => {
  const [{ layout, loading }, updater] = useUpdate<IState>({ layout: [], loading: false });
  const timeSpan = monitorCommonStore.useStore((s) => s.globalTimeSelectSpan.range);
  const globalVariable = {
    startTime: timeSpan.startTimeMs,
    endTime: timeSpan.endTimeMs,
  };

  const gerMetaData = async () => {
    updater.loading(true);
    try {
      const { success, data } = await getDashboard({ type: 'msp_overview' });
      if (success) {
        updater.layout(data?.viewConfig);
      }
    } finally {
      updater.loading(false);
    }
  };
  React.useEffect(() => {
    gerMetaData();
  }, []);
  return (
    <Spin spinning={loading}>
      <div className="flex justify-end mb-3">
        <TimeSelectWithStore />
      </div>
      <Holder when={isEmpty(layout)}>
        <DashBoard layout={layout} globalVariable={globalVariable} />
      </Holder>
    </Spin>
  );
};

export default Overview;
