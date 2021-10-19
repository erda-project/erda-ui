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

/**
 * Created by 含光<jiankang.pjk@alibaba-inc.com> on 2021/1/20 14:43.
 */
import React from 'react';
import DiceConfigPage, { useMock } from 'app/config-page';
import routeInfoStore from 'core/stores/route';

export default () => {
  const [{ projectId, spaceId }] = routeInfoStore.useStore((s) => [s.params]);
  const inParams = {
    projectId: +projectId,
    spaceId,
  };

  React.useEffect(() => {
    console.log('------mount');
  }, []);

  return (
    <DiceConfigPage
      showLoading
      scenarioKey="scenes-import-record"
      scenarioType="scenes-import-record"
      useMock={useMock('import-record')}
      forceMock
      inParams={inParams}
    />
  );
};
