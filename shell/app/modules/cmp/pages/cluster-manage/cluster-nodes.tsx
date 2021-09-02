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
import { Button, Drawer } from 'core/nusi';
import { getUrlQuery } from 'config-page/utils';
import { updateSearch } from 'common/utils';
import i18n from 'i18n';
import K8sClusterTerminal from './cluster-terminal';

const ClusterNodes = () => {
  const [{ clusterName }, query] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [urlQuery, setUrlQuery] = React.useState(query);
  const [consoleVis, setConsoleVis] = React.useState(false);

  React.useEffect(() => {
    updateSearch({ ...urlQuery });
  }, [urlQuery]);

  const inParams = { clusterName, ...urlQuery };

  const urlQueryChange = (val: Obj) => setUrlQuery((prev: Obj) => ({ ...prev, ...getUrlQuery(val) }));

  return (
    <>
      <div className="top-button-group">
        <Button onClick={() => setConsoleVis(true)}>控制台</Button>
      </div>
      <DiceConfigPage
        scenarioType={'cmp-dashboard-nodes'}
        scenarioKey={'cmp-dashboard-nodes'}
        inParams={inParams}
        customProps={{
          filter: {
            onFilterChange: urlQueryChange,
          },
          cpuTable: {
            onStateChange: urlQueryChange,
          },
          memTable: {
            onStateChange: urlQueryChange,
          },
          podTable: {
            onStateChange: urlQueryChange,
          },
          tableTabs: {
            onStateChange: urlQueryChange,
          },
        }}
      />

      <Drawer
        visible={consoleVis}
        onClose={() => setConsoleVis(false)}
        title={`${i18n.t('cluster')} ${clusterName} ${i18n.t('console')}`}
        width={'80%'}
      >
        <K8sClusterTerminal clusterName={clusterName} />
      </Drawer>
    </>
  );
};

export default ClusterNodes;
