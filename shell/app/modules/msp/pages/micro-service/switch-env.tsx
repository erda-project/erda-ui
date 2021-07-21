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
import routeInfoStore from 'core/stores/route';
import { Select } from 'app/nusi';
import mspStore from 'msp/stores/micro-service';
import { envMap } from 'msp/config';
import { map } from 'lodash';
import { goTo } from 'common/utils';

const { Option } = Select;

const SwitchEnv = () => {
  const [{ workSpaces, id }] = mspStore.useStore((s) => [s.currentProject]);
  const [{ env }] = routeInfoStore.useStore((s) => [s.params]);
  const [currentEnv, setEnv] = React.useState(env);
  React.useEffect(() => {
    setEnv(env);
  }, [env]);
  const handleChangeEnv = (val: string) => {
    goTo(goTo.pages.mspOverview, { tenantGroup: workSpaces[val], projectId: id, env: val });
  };
  return (
    <div className="v-flex-box px12">
      <div className="mb12">{env}</div>
      <Select className="full-width" value={currentEnv} onSelect={handleChangeEnv}>
        {map(workSpaces, (_, key) => {
          return <Option value={key}>{envMap[key]}</Option>;
        })}
      </Select>
    </div>
  );
};

export default () => <SwitchEnv />;
