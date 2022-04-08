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
import { ErdaIcon } from 'common';
import routeInfoStore from 'core/stores/route';

export const ProjectAppList = () => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const permMap = usePerm((s) => s.project);

  return (
    <div>
      <div className="top-button-group">
        <WithAuth pass={permMap.addApp} disableMode={false} tipProps={{ placement: 'bottom' }}>
          <Button type="primary" onClick={() => goTo('./createApp')}>
            {i18n.t('Add-application')}
          </Button>
        </WithAuth>
      </div>
      <DiceConfigPage
        fullHeight={false}
        scenarioType={'app-list-all'}
        scenarioKey={'app-list-all'}
        inParams={{
          projectId,
        }}
        customProps={{
          list: {
            props: {
              wrapperClassName: 'mt-0',
              hideHead: true,
              defaultLogo: <ErdaIcon type="morenyingyong" size={28} />,
            },
          },
          content: {
            props: {
              className: 'bg-white p-0 mb-4',
            },
          },
          filter: {
            props: {
              className: 'px-4 py-2 bg-default-02',
            },
          },
        }}
      />
    </div>
  );
};
