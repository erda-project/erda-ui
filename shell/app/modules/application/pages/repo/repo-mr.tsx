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

import { Button, Card } from 'antd';
import React from 'react';
import { find } from 'lodash';
import { goTo } from 'common/utils';
import { RepoMrTable } from './components/repo-mr-table';
import i18n from 'i18n';
import repoStore, { getAppDetail } from 'application/stores/repo';
import { getAppMRStatsCount } from 'application/services/repo';
import { WithAuth, usePerm } from 'user/common';
import { ErdaAlert, RadioTabs } from 'common';

const PureRepoMR = () => {
  const info = repoStore.useStore((s) => s.info);
  const mrStatsCount = getAppMRStatsCount.useData();
  const permObj = usePerm((s) => s.app.repo.mr);
  const [mrType, setMrType] = React.useState('open');

  React.useEffect(() => {
    getAppDetail().then((res) => {
      const [projectName, appName] = res.gitRepoAbbrev.split('/');
      getAppMRStatsCount.fetch({ projectName, appName });
    });
  }, [mrType]);

  const getMrTypeCount = (type: string) => {
    return mrStatsCount ? find(mrStatsCount.stats, (item) => item.state === type)?.total : 0;
  };

  const openCount = Number(getMrTypeCount('open'));
  const closedCount = Number(getMrTypeCount('closed'));
  const mergedCount = Number(getMrTypeCount('merged'));
  const allCount = openCount + closedCount + mergedCount;

  const options = [
    {
      value: 'all',
      label: (
        <span>
          {i18n.t('All')}
          <span className="ml-1">({allCount})</span>
        </span>
      ),
    },
    {
      value: 'open',
      label: (
        <span>
          {i18n.t('dop:Open')}
          <span className="ml-1">({openCount})</span>
        </span>
      ),
    },
    {
      value: 'merged',
      label: (
        <span>
          {i18n.t('dop:have merged')}
          <span className="ml-1">({mergedCount})</span>
        </span>
      ),
    },
    {
      value: 'closed',
      label: (
        <span>
          {i18n.t('Closed')}
          <span className="ml-1">({closedCount})</span>
        </span>
      ),
    },
  ];
  return (
    <div>
      <div className="top-button-group">
        <WithAuth pass={permObj.create} tipProps={{ placement: 'bottom' }}>
          <Button
            disabled={info.empty || info.isLocked}
            type="primary"
            onClick={() => goTo('./createMR', { forbidRepeat: true })}
          >
            {i18n.t('dop:Add-merge-request')}
          </Button>
        </WithAuth>
      </div>

      <RadioTabs
        options={options}
        value={mrType}
        onChange={(v?: string | number) => setMrType(v as string)}
        className="mb-2"
      />
      <Card>
        <If condition={info.isLocked}>
          <ErdaAlert message={i18n.t('lock-repository-tip')} type="error" />
        </If>
        <RepoMrTable key={mrType} type={mrType as REPOSITORY.MrState} />
      </Card>
    </div>
  );
};

export default PureRepoMR;
