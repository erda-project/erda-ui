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
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import { isEmpty } from 'lodash';
import { K8sPodTerminalConsole, K8sPodTerminalLog } from './cluster-terminal';
import { useUpdate, Holder, PureBoardGrid, TimeSelector } from 'common';
import { Spin } from 'core/nusi';
import CommonDashboardStore from 'common/stores/dashboard';
import { useLoading } from 'core/stores/loading';
import DC from '@erda-ui/dashboard-configurator/dist';
import monitorCommonStore from 'common/stores/monitorCommon';
import { useMount } from 'react-use';
import i18n from 'i18n';

const DashBoard = React.memo(PureBoardGrid);
interface IPodMeta {
  meta: IMetaData;
}
interface IMetaData {
  containerName: string;
  podName: string;
  namespace: string;
}

interface IState {
  consoleVisible: boolean;
  podData: IMetaData | null;
  logVisible: boolean;
  logData: IMetaData | null;
  chartLayout: DC.Layout;
}

const ClusterPodDetail = () => {
  const [{ clusterName, podId }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const { podName, namespace } = query || {};
  const timeSpan = monitorCommonStore.useStore((s) => s.timeSpan);
  const globalVariable = {
    startTime: timeSpan.startTimeMs,
    endTime: timeSpan.endTimeMs,
    podName,
    namespace,
    clusterName,
  };

  const [chartLoading] = useLoading(CommonDashboardStore, ['getCustomDashboard']);

  const [{ consoleVisible, podData, logVisible, logData, chartLayout }, updater, update] = useUpdate<IState>({
    consoleVisible: false,
    podData: null,
    logVisible: false,
    logData: null,
    chartLayout: [],
  });

  useMount(() => {
    CommonDashboardStore.getCustomDashboard({
      id: 'cmp-dashboard-podDetail',
      isSystem: true,
    }).then((res) => updater.chartLayout(res));
  });

  const closeConsole = () => {
    update({
      consoleVisible: false,
      podData: null,
    });
  };

  const closeLog = () => {
    update({
      logVisible: false,
      logData: null,
    });
  };

  const inParams = { clusterName, podId };

  return (
    <div>
      <div>
        <DiceConfigPage
          scenarioType={'cmp-dashboard-podDetail'}
          scenarioKey={'cmp-dashboard-podDetail'}
          inParams={inParams}
          customProps={{
            containerTable: {
              operations: {
                checkConsole: (op: IPodMeta) => {
                  update({
                    consoleVisible: true,
                    podData: op?.meta,
                  });
                },
                checkLog: (op: IPodMeta) => {
                  update({
                    logVisible: true,
                    logData: op?.meta,
                  });
                },
              },
            },
          }}
        />
        <K8sPodTerminalConsole
          clusterName={clusterName}
          {...(podData as IMetaData)}
          visible={consoleVisible}
          onClose={closeConsole}
        />
        <K8sPodTerminalLog
          clusterName={clusterName}
          {...(logData as IMetaData)}
          visible={logVisible}
          onClose={closeLog}
        />
      </div>
      <Spin spinning={chartLoading} wrapperClassName="-mt-4">
        <div className="text-xl font-medium mb-4">{i18n.t('cmp:resource monitor')}</div>
        <TimeSelector className="mb-4" />
        <Holder when={isEmpty(chartLayout)}>
          <DashBoard layout={chartLayout} globalVariable={globalVariable} />
        </Holder>
      </Spin>
    </div>
  );
};

export default ClusterPodDetail;
