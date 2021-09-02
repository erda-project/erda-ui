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
import DiceConfigPage, { useMock } from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import { useUpdate } from 'common';
import { K8sPodTerminalConsole, K8sPodTerminalLog } from './cluster-terminal';

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
}

const ClusterNodes = () => {
  const { clusterName, podId } = routeInfoStore.useStore((s) => s.params);

  const [{ consoleVisible, podData, logVisible, logData }, updater, update] = useUpdate<IState>({
    consoleVisible: false,
    podData: null,
    logVisible: false,
    logData: null,
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
    <>
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
    </>
  );
};

export default ClusterNodes;
