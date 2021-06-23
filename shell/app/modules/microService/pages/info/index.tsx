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

import { PureAddonSettings } from 'app/common/components/addon-settings';
import { useLoading } from 'app/common/stores/loading';
import { Copy, SettingsTabs } from 'common';
import { isZh } from 'i18n';
import * as React from 'react';
import { useEffectOnce } from 'react-use';
import microServiceInfoStore from '../../stores/info';
import routeInfoStore from 'common/stores/route';

const MSComponentInfo = () => {
  const infoList = microServiceInfoStore.useStore((s) => s.infoList);
  const { getMSComponentInfo } = microServiceInfoStore.effects;
  const { clearMSComponentInfo } = microServiceInfoStore.reducers;
  const [loading] = useLoading(microServiceInfoStore, ['getMSComponentInfo']);
  const insId = routeInfoStore.useStore((s) => s.params.insId);

  useEffectOnce(() => {
    getMSComponentInfo();
    return clearMSComponentInfo;
  });

  const dataSource = infoList.map((info) => {
    return {
      tabTitle: isZh() ? info.cnName : info.enName,
      tabKey: info.addonName,
      content: <PureAddonSettings insId={insId} addonConfig={info} isFetching={loading} />,
    };
  });
  return (
    <>
      <SettingsTabs dataSource={dataSource} />
      <Copy selector=".cursor-copy" />
    </>
  );
};

export default MSComponentInfo;
