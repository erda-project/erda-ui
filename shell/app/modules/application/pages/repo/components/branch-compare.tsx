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

import { Button } from 'app/nusi';
import { useUpdate } from 'common';
import { goTo } from 'common/utils';
import * as React from 'react';
import { getSplitPathBy } from '../util';
import BranchSelect from './branch-select';
import i18n from 'i18n';
import { DownOne as IconDownOne, Switch as IconSwitch } from '@icon-park/react';

import './branch-compare.scss';
import routeInfoStore from 'common/stores/route';
import repoStore from 'application/stores/repo';

const RepoBranchCompare = () => {
  const [info] = repoStore.useStore((s) => [s.info]);
  const { branches: branch = '' } = routeInfoStore.useStore((s) => s.params);
  const [from, to] = branch.split('...');
  const [state, updater, update] = useUpdate({
    from: decodeURIComponent(from) || '',
    to: decodeURIComponent(to) || '',
  });
  React.useEffect(() => {
    update({
      from: decodeURIComponent(from),
      to: decodeURIComponent(to),
    });
  }, [from, to, update]);

  const switchBranch = () => {
    update({
      from: state.to,
      to: state.from,
    });
  };
  const onChange = (type: string) => (value: string) => {
    updater[type](value);
  };
  const goToCompare = () => {
    goTo(`${getSplitPathBy('compare').before}/${encodeURIComponent(state.from)}...${encodeURIComponent(state.to)}`);
  };
  const { branches, tags } = info;
  return (
    <div className="repo-branch-compare" key={window.location.pathname}>
      <BranchSelect {...{ branches, tags, current: encodeURIComponent(state.from) }} onChange={onChange('from')}>
        <span>{i18n.t('application:base')}:</span>
        <span className="branch-name bold nowrap">{state.from || null}</span>
        {state.from ? <IconDownOne theme="filled" size="16px" /> : null}
      </BranchSelect>
      <span className="switch-branch" onClick={switchBranch}>
        <IconSwitch />
      </span>
      <BranchSelect {...{ branches, tags, current: state.to }} onChange={onChange('to')}>
        <span>{i18n.t('application:compare')}:</span>
        <span className="branch-name bold nowrap">{state.to || null}</span>
        {state.to ? <IconDownOne theme="filled" size="16px" /> : null}
      </BranchSelect>
      <Button className="compare-button" type="primary" onClick={goToCompare} disabled={!state.from || !state.to}>
        {i18n.t('application:compare')}
      </Button>
    </div>
  );
};

export default React.memo(RepoBranchCompare);
