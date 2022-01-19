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
import i18n from 'i18n';
import { ErdaAlert } from 'common';
import ReleaseProtocol from './release-protocol';
import releaseStore from 'project/stores/release';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';

import './application.scss';

const ProjectRelease = () => {
  const [params, { appReleaseIDs }] = routeInfoStore.useStore((s) => [s.params, s.query]);
  const [appList] = releaseStore.useStore((s) => [s.appList]);
  const { getAppList } = releaseStore.effects;
  const [applicationId, setApplicationId] = React.useState<number>(0);
  const [loading] = useLoading(releaseStore, ['getAppList']);
  React.useEffect(() => {
    getAppList({ projectId: params.projectId });
  }, [params.projectId, getAppList]);

  return (
    <div className="h-full flex flex-col">
      <ErdaAlert showOnceKey="application-release-list" message={i18n.t('dop:Applications release list top desc')} />

      <div className="flex-1 flex bg-white min-h-0 mb-4">
        <div className="release-app-list overflow-y-auto px-2">
          <Spin spinning={loading}>
            <div className="px-2 py-4 leading-4 font-medium">{i18n.t('dop:applications')}</div>
            <div
              className={`px-2 py-1.5 mb-1 leading-5 hover:bg-default-04 cursor-pointer rounded-sm ${
                applicationId ? '' : 'text-purple-deep'
              }`}
              onClick={() => setApplicationId(0)}
            >
              {i18n.t('dop:all')}
            </div>
            {appList.map((item) => (
              <div
                className={`px-2 py-1.5 mb-1 leading-5 hover:bg-default-04 cursor-pointer rounded-sm ${
                  applicationId === item.id ? 'text-purple-deep' : ''
                }`}
                onClick={() => setApplicationId(item.id)}
              >
                {item.displayName}
              </div>
            ))}
          </Spin>
        </div>

        <div className="release-right flex-1 mt-2">
          <ReleaseProtocol applicationID={applicationId} isProjectRelease={false} appReleaseIDs={appReleaseIDs} />
        </div>
      </div>
    </div>
  );
};

export default ProjectRelease;
