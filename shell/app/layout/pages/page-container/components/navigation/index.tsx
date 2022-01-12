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

import { Badge, message } from 'antd';
import orgStore from 'app/org-home/stores/org';
import { ErdaIcon } from 'common';
import { DOC_HELP_HOME, erdaEnv } from 'common/constants';
import i18n from 'i18n';
import layoutStore from 'layout/stores/layout';
import messageStore from 'layout/stores/message';
import React from 'react';
import { usePerm } from 'user/common';
import { goTo } from 'common/utils';
import routeStore from 'core/stores/route';
import UserMenu from './user-menu';
import './index.scss';
import { Link } from 'react-router-dom';
import OrgSelector from 'app/org-home/pages/org-selector';

const usePlatformEntries = () => {
  const permMap = usePerm((s) => s.org);
  const appList = layoutStore.useStore((s) => s.appList);
  const currentOrg = orgStore.useStore((s) => s.currentOrg);
  const openMap = {
    orgCenter: permMap.entryOrgCenter.pass,
    cmp: permMap.cmp.showApp.pass,
    dop: permMap.dop.read.pass,
    fdp: permMap.entryFastData.pass && currentOrg.openFdp,
    msp: permMap.entryMsp.pass,
    ecp: erdaEnv.ENABLE_EDGE === 'true' && permMap.ecp.view.pass && currentOrg.type === 'ENTERPRISE',
  };
  return appList.filter((app) => openMap[app.key]);
};

export interface NavItemProps {
  label: string;
  icon: React.ReactNode;
  link?: string;
  onClick?: () => void;
}

export const NavItem = ({ icon, label, link, onClick }: NavItemProps) => {
  const content = (
    <div
      key={label}
      className="erda-global-nav-item relative flex-all-center cursor-pointer w-full h-11"
      onClick={onClick}
    >
      {icon}
      <div className="name px-3 text-white shadow-card-lg rounded-sm">{label}</div>
    </div>
  );
  return link ? (
    <Link to={link} className="w-full">
      {content}
    </Link>
  ) : (
    content
  );
};

const Navigation = () => {
  const currentApp = layoutStore.useStore((s) => s.currentApp);
  const { switchMessageCenter } = layoutStore.reducers;
  const unreadCount = messageStore.useStore((s) => s.unreadCount);
  const current = window.localStorage.getItem('locale') || 'zh';
  const [currentOrg, orgs] = orgStore.useStore((s) => [s.currentOrg, s.orgs]);
  const platformEntries = usePlatformEntries();
  const isIn = routeStore.getState((s) => s.isIn);
  const isAdminRoute = isIn('sysAdmin');
  const curOrgName = currentOrg.name;
  const bottomItems = [
    {
      icon: <ErdaIcon type="bangzhuwendang" className="text-normal" size={20} />,
      label: i18n.t('layout:view doc'),
      onClick: () => {
        window.open(DOC_HELP_HOME);
      },
    },
    {
      icon: <ErdaIcon type={current === 'zh' ? 'zhongwen' : 'yingwen'} className="text-normal" size={20} />,
      label: i18n.t('default:switch language'),
      onClick: () => {
        const next = current === 'zh' ? 'en' : 'zh';
        window.localStorage.setItem('locale', next);
        window.location.reload();
      },
    },
    {
      icon: (
        <Badge
          size="small"
          count={unreadCount}
          offset={[0, 2]}
          className="message-icon select-none"
          style={{ boxShadow: 'none' }}
        >
          <ErdaIcon type="xiaoxi" className="text-normal" size={20} />
        </Badge>
      ),
      label: i18n.t('default:message center'),
      onClick: () => {
        switchMessageCenter(null);
      },
    },
  ];

  return (
    <div className={`erda-global-nav flex flex-col items-center relative`}>
      <div className="logo-wrap relative min-h-[32px] w-8 h-8 m-3 cursor-pointer">
        <ErdaIcon type="gerengongzuotai" size={32} className="absolute erda-global-logo" />
        <ErdaIcon
          type="gerengongzuotaihover"
          className="absolute workbench-icon"
          size={32}
          onClick={() => {
            layoutStore.reducers.switchMessageCenter(false);
            const isIncludeOrg = !!orgs.find((x) => x.name === curOrgName);
            if (isAdminRoute) {
              const lastOrg = window.localStorage.getItem('lastOrg');
              const isInLastOrg = !!orgs.find((x: Obj) => x.name === lastOrg);
              if (isInLastOrg) {
                goTo(goTo.pages.orgRoot, { orgName: lastOrg });
              } else {
                goTo(goTo.pages.landPage);
              }
            } else if (isIncludeOrg) {
              goTo(goTo.pages.orgRoot);
            } else {
              goTo(goTo.pages.landPage);
            }
          }}
        />
      </div>
      <div className="py-2 relative left-1">
        <OrgSelector mode="simple" size="middle" />
      </div>
      {platformEntries.map((item) => {
        return (
          <NavItem
            key={item.key}
            label={item.name}
            link={item.href}
            onClick={() => {
              layoutStore.reducers.switchMessageCenter(false);
              layoutStore.reducers.switchToApp(item.key);
            }}
            icon={
              currentApp.key === item.key ? (
                <ErdaIcon className="absolute icon active-icon opacity-100" size={24} type={item.icon} />
              ) : (
                <>
                  <ErdaIcon className="absolute icon active-icon" size={24} type={item.icon} />
                  <ErdaIcon className="absolute icon normal-icon" size={24} type={`${item.icon}-normal`} />
                </>
              )
            }
          />
        );
      })}
      <div className={`w-full flex flex-1 flex-col items-center justify-end`}>
        {bottomItems.map((item) => (
          <NavItem key={item.label} label={item.label} icon={item.icon} onClick={item.onClick} />
        ))}
        <div className={`erda-global-nav-avatar-item my-4 flex-all-center cursor-pointer`}>
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
