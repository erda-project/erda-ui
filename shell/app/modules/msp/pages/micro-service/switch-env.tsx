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
import { Dropdown, Menu } from 'antd';
import mspStore from 'msp/stores/micro-service';
import { ErdaIcon } from 'common';
import { goTo } from 'common/utils';

const SwitchEnv = () => {
  const [{ relationship, id }] = mspStore.useStore((s) => [s.currentProject]);
  const [{ env }] = routeInfoStore.useStore((s) => [s.params]);
  const [currentEnv, setEnv] = React.useState(env);
  React.useEffect(() => {
    setEnv(env);
  }, [env]);
  const [menu, envName] = React.useMemo(() => {
    const handleChangeEnv = ({ key }: { key: string }) => {
      const selectEnv = relationship.find((item) => item.workspace === key);
      if (selectEnv && key !== currentEnv) {
        goTo(goTo.pages.mspOverview, { tenantGroup: selectEnv.tenantId, projectId: id, env: key });
      }
    };
    const { displayWorkspace, workspace } = relationship?.find((t) => t.workspace === currentEnv) ?? {};
    return [
      <Menu onClick={handleChangeEnv} className="bg-default text-white hover:bg-default">
        {relationship?.map((item) => {
          const checked = workspace === item.workspace;
          return (
            <Menu.Item key={item.workspace} className={` hover:bg-white-08 ${checked ? 'bg-white-08' : ''}`}>
              <div className={` px-2 ${checked ? ' text-white' : 'text-white-6'} flex`}>
                <span>{item.displayWorkspace}</span>
                <span className="flex">
                  {checked ? <ErdaIcon type="check" className="ml-2 text-purple-deep" /> : null}
                </span>
              </div>
            </Menu.Item>
          );
        })}
      </Menu>,
      displayWorkspace,
    ];
  }, [relationship, currentEnv]);
  return (
    <div className="px-3 mt-2">
      <Dropdown overlay={menu} trigger={['click']}>
        <div className="text-base h-8 rounded border border-solid border-transparent flex justify-center cursor-pointer ">
          <span className="self-center">{envName}</span>
          <ErdaIcon className="self-center text-default-3 hover:text-default" type="caret-down" size="16" />
        </div>
      </Dropdown>
    </div>
  );
};

export default SwitchEnv;
