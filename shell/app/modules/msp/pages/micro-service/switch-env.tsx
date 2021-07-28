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
import { goTo } from 'common/utils';

const { Option } = Select;

const SwitchEnv = () => {
  const [{ relationship, id }] = mspStore.useStore((s) => [s.currentProject]);
  const [{ env }] = routeInfoStore.useStore((s) => [s.params]);
  const [currentEnv, setEnv] = React.useState(env);
  React.useEffect(() => {
    setEnv(env);
  }, [env]);
  const handleChangeEnv = (val: string) => {
    const selectEnv = relationship.find((item) => item.workspace);
    if (selectEnv) {
      goTo(goTo.pages.mspOverview, { tenantGroup: selectEnv.tenantId, projectId: id, env: val });
    }
  };
  return (
    <div className="px-3">
      <div className="mb-3">{env}</div>
      <Select className="w-full" value={currentEnv} onSelect={handleChangeEnv}>
        {relationship.map((item) => {
          return <Option value={item.workspace}>{item.displayWorkspace}</Option>;
        })}
      </Select>
    </div>
  );
};

export default () => <SwitchEnv />;
