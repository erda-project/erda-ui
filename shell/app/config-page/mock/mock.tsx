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
import DiceConfigPage, { useMock } from 'app/config-page';
import routeInfoStore from 'core/stores/route';

const Mock = () => {
  const query = routeInfoStore.useStore((s) => s.query);
  const comProps = {
    cpu1Chart: {
      props: {
        grayBg: true,
        size: 'small',
      },
    },
    cpu2Chart: {
      props: {
        grayBg: true,
        size: 'small',
      },
    },
  };
  return (
    <DiceConfigPage
      showLoading
      scenarioType="mock"
      customProps={comProps}
      scenarioKey={'mock'}
      useMock={useMock(query.page || 'project-list-protocol')}
      forceMock
    />
  );
};
export default Mock;
