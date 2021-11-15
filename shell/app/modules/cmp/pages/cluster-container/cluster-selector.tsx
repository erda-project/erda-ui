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
import clusterStore from 'cmp/stores/cluster';
import { Select } from 'antd';
import { goTo } from 'common/utils';
import { TYPE_K8S_AND_EDAS, EMPTY_CLUSTER, replaceContainerCluster } from 'cmp/pages/cluster-manage/config';
import i18n from 'i18n';

const ClusterSelector = () => {
  const [list, chosenCluster] = clusterStore.useStore((s) => [s.list, s.chosenCluster]);
  const { setChosenCluster } = clusterStore.reducers;

  const useList = list?.filter((item: ORG_CLUSTER.ICluster) => TYPE_K8S_AND_EDAS.includes(item.type));

  return (
    <div className="flex items-center">
      <span className="flex items-center font-bold text-lg">{i18n.t('container resource')}</span>
      <span className="bg-dark-2 mx-5" style={{ width: 1, height: 12 }} />
      <Select
        bordered={false}
        dropdownMatchSelectWidth={false}
        className={'hover:bg-hover-gray-bg rounded'}
        getPopupContainer={() => document.body}
        value={chosenCluster === EMPTY_CLUSTER ? undefined : chosenCluster}
        placeholder={i18n.t('choose cluster')}
        onChange={(v) => {
          setChosenCluster(v);
          goTo(replaceContainerCluster(v));
        }}
      >
        {useList?.map((item: ORG_CLUSTER.ICluster) => (
          <Select.Option key={item.id} value={item.name}>
            {item.displayName || item.name}
          </Select.Option>
        ))}
      </Select>
    </div>
  );
};

export default ClusterSelector;
