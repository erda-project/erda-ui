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
import { LoadMoreSelector, Icon as CustomIcon } from 'common';
import { goTo } from 'common/utils';
import { map } from 'lodash';
import { Tooltip } from 'app/nusi';
import { getApps } from 'common/services';
import routeInfoStore from 'app/common/stores/route';
import appStore from 'application/stores/application';
import './app-selector.scss';

interface IProps{
  [pro: string]: any;
  value: string | number;
  projectId?: string;
  onClickItem: (arg?: any) => void;
}

const AppItem = (app: IApplication) => {
  return <Tooltip key={app.id} title={app.name}>{app.displayName || app.name}</Tooltip>;
};

export const AppSelector = (props: IProps) => {
  const { projectId: _projectId, ...rest } = props;
  const pId = routeInfoStore.useStore(s => s.params.projectId);
  const projectId = _projectId || pId;
  const getData = (_q: Obj = {}) => {
    if (!projectId) return;
    return getApps({ projectId, ..._q } as any).then((res: any) => res.data);
  };

  return (
    <LoadMoreSelector
      getData={getData}
      dataFormatter={({ list, total }) => ({
        total,
        list: map(list, item => ({ ...item, label: item.displayName || item.name, value: item.id })),
      })}
      optionRender={AppItem}
      {...rest}
    />
  );
};

const headAppRender = (val: any = {}) => {
  const curApp = appStore.getState(s => s.detail);
  const name = val.displayName || val.name || curApp.displayName || curApp.name || '';
  return (
    <div className='head-app-name'>
      <span className='nowrap fz16 bold'>{name}</span>
      <CustomIcon className="caret" type="caret-down" />
    </div>
  );
};

export const HeadAppSelector = () => {
  const { appId, projectId } = routeInfoStore.useStore(s => s.params);
  return (
    <div className='head-app-selector mt8'>
      <AppSelector
        valueItemRender={headAppRender}
        value={appId}
        onClickItem={(app: IApplication) => {
          goTo(goTo.pages.app, { projectId, appId: app.id }); // 切换app
        }}
      />
    </div>
  );
};
