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

import { goTo } from 'common/utils';
import React from 'react';
import { Button } from 'antd';
import { WithAuth, usePerm } from 'app/user/common';
import i18n from 'i18n';
import DiceConfigPage from 'config-page/index';
import ImgMap from 'config-page/img-map';
import routeInfoStore from 'core/stores/route';

export const ProjectAppList = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const permMap = usePerm((s) => s.project);

  return (
    <React.Fragment>
      <div className="top-button-group">
        <WithAuth pass={permMap.addApp} disableMode={false} tipProps={{ placement: 'bottom' }}>
          <Button type="primary" onClick={() => goTo('./createApp')}>
            {i18n.t('add application')}
          </Button>
        </WithAuth>
      </div>
      <DiceConfigPage
        scenarioType={'app-list-all'}
        scenarioKey={'app-list-all'}
        inParams={{
          projectId,
        }}
        showLoading={false}
        customProps={{
          list: {
            props: {
              defaultLogo: ImgMap.frontImg_default_app_icon,
            },
          },
          content: {
            props: {
              className: 'bg-white pb-0 px-4 mb-4',
            },
          },
        }}
      />
    </React.Fragment>
  );
};
