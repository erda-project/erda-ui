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
import DiceConfigPage, { useMock } from 'config-page/index';
import orgStore from 'app/org-home/stores/org';
import { DropdownSelectNew, UserProfile } from 'common';
import { goTo, insertWhen } from 'common/utils';
import ScaleCard from 'config-page/components/scale-card/scale-card';
import defaultOrgIcon from 'app/images/default-org-icon.svg';
import defaultUserAvatar from 'app/images/default-user-avatar.svg';
import { useMount } from 'react-use';
import userStore from 'app/user/stores';
import { usePerm } from 'user/common';
import { erdaEnv } from 'common/constants';
import i18n from 'i18n';
import './personal-home.scss';

const PersonalHome = () => {
  const { getPublicOrgs } = orgStore.effects;
  const loginUser = userStore.useStore((s) => s.loginUser);
  const permMap = usePerm((s) => s.org);
  const [currentOrg, orgs, publicOrgs] = orgStore.useStore((s) => [s.currentOrg, s.orgs, s.publicOrgs]);
  const inParams = { orgName: currentOrg.name || '-' };

  React.useEffect(() => {
    document.title = `${i18n.t('Personal dashboard')} · Erda`;

    return () => {
      document.title = ' · Erda';
    };
  }, []);
  const openMap = {
    orgCenter: permMap.entryOrgCenter.pass,
    cmp: permMap.cmp.showApp.pass,
    dop: permMap.dop.read.pass,
    fdp: permMap.entryFastData.pass && currentOrg.openFdp,
    msp: permMap.entryMsp.pass,
    ecp: erdaEnv.ENABLE_EDGE === 'true' && permMap.ecp.view.pass && currentOrg.type === 'ENTERPRISE',
  };

  useMount(() => {
    getPublicOrgs();
  });

  if (inParams.orgName === '-') {
    return;
  }

  const changeOrg = (_: string, op: Obj) => {
    goTo(goTo.pages.orgRoot, { orgName: op.desc });
  };

  const Head = () => {
    const options = [
      {
        label: '我的组织',
        key: 'my',
        children: orgs.map((o) => ({
          key: o.name,
          label: o.displayName,
          desc: o.name,
          imgURL: o.logo || defaultOrgIcon,
        })),
      },
      ...insertWhen(!!publicOrgs.length, [
        {
          label: '公开组织',
          key: 'public',
          children: publicOrgs.map((o) => ({
            key: o.name,
            label: o.displayName,
            desc: o.name,
            imgURL: o.logo || defaultOrgIcon,
          })),
        },
      ]),
    ];
    return (
      <div>
        <div>
          <div className="font-medium text-lg text-default">上午好，麦壳，欢迎使用宇宙最强云原生产品-Erda</div>
          <div className="text-xs text-default-6">今天是 2021/09/21 周三，距离春节还有50天~</div>
        </div>
        <div className="flex ites-center justify-between ss">
          <DropdownSelectNew
            title="切换组织"
            value={currentOrg.name}
            options={options}
            onChange={changeOrg}
            width={400}
            size="big"
          />
          <ScaleCard
            onClick={(v) => {
              goTo(v.path);
            }}
            data={{
              list: [
                {
                  icon: 'DevOps-entry',
                  label: 'DevOps 平台',
                  show: openMap.dop,
                },
                {
                  icon: 'MSP-entry',
                  label: '微服务平台',
                  show: openMap.msp,
                },
                {
                  icon: 'CMP-entry',
                  label: '云管平台',
                  show: openMap.cmp,
                },
                {
                  icon: 'FDP-entry',
                  label: '快数据平台',
                  show: openMap.fdp,
                },
                {
                  icon: 'control-entry',
                  label: '管理中心',
                  show: openMap.orgCenter,
                },
              ].filter((item) => item.show),
            }}
          />
        </div>
      </div>
    );
  };

  const UserProfileComp = () => {
    return (
      <UserProfile
        data={{
          id: loginUser.id,
          name: loginUser.nick || loginUser.name,
          avatar: loginUser.avatar || defaultUserAvatar,
          email: loginUser.email,
          phone: loginUser.phone,
          lastLoginTime: loginUser.lastLoginAt,
        }}
      />
    );
  };

  return (
    <div className="px-6 pt-6 pb-2 h-full">
      <DiceConfigPage
        scenarioType="personal-workbench"
        scenarioKey="personal-workbench"
        useMock={useMock}
        forceMock
        inParams={inParams}
        customProps={{
          page: {
            props: {
              className: 'h-full personal-workbench-page',
            },
          },
          leftContent: {
            props: {
              className: 'personal-workbench-left-content',
            },
          },
          head: Head,
          userProfile: UserProfileComp,
          workContainer: {
            props: {
              className: 'bg-white',
            },
          },
        }}
      />
    </div>
  );
};

export default PersonalHome;
