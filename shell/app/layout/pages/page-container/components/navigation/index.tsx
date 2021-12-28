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

import { Badge } from 'antd';
import orgStore from 'app/org-home/stores/org';
import { ErdaIcon } from 'common';
import { DOC_HELP_HOME, erdaEnv } from 'common/constants';
import i18n from 'i18n';
import layoutStore from 'layout/stores/layout';
import messageStore from 'layout/stores/message';
import React from 'react';
import { usePerm } from 'user/common';
import UserMenu from './userMenu';
import './index.scss';
import { Link } from 'react-router-dom';

const usePlatformEntries = () => {
  const permMap = usePerm((s) => s.org);
  const appList = layoutStore.useStore((s) => s.appList);
  const currentOrg = orgStore.useStore((s) => s.currentOrg);
  const { switchToApp } = layoutStore.reducers;
  const [visible, setVisible] = React.useState(false);

  const openMap = {
    orgCenter: permMap.entryOrgCenter.pass,
    cmp: permMap.cmp.showApp.pass,
    dop: permMap.dop.read.pass,
    fdp: permMap.entryFastData.pass && currentOrg.openFdp,
    msp: permMap.entryMsp.pass,
    ecp: erdaEnv.ENABLE_EDGE === 'true' && permMap.ecp.view.pass && currentOrg.type === 'ENTERPRISE',
  };
  const dataSource = appList.filter((app) => openMap[app.key]);

  return dataSource;
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
      className="erda-global-nav-item relative flex items-center justify-center cursor-pointer flex-col w-full h-11"
      onClick={onClick}
    >
      <div className="relative h-6 w-6">{icon}</div>
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
  const { switchMessageCenter } = layoutStore.reducers;
  const unreadCount = messageStore.useStore((s) => s.unreadCount);
  const current = window.localStorage.getItem('locale') || 'zh';
  const platformEntries = usePlatformEntries();
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
      <ErdaIcon type="gerengongzuotai" size={32} className="m-3" />
      <ErdaIcon type="gerengongzuotai" size={24} className="m-3" />
      {platformEntries.map((item) => {
        return (
          <div
            key={item.key}
            className="erda-global-nav-item relative flex items-center justify-center cursor-pointer flex-col w-full h-11"
          >
            <NavItem
              label={item.name}
              link={item.href}
              icon={
                <>
                  <ErdaIcon className="absolute icon active-icon" size={24} type={item.icon} />
                  <ErdaIcon className="absolute icon normal-icon" size={24} type={`${item.icon}-normal`} />
                </>
              }
            />
          </div>
        );
      })}
      <div className={`w-full flex flex-1 flex-col items-center justify-end`}>
        {bottomItems.map((item) => (
          <NavItem key={item.label} label={item.label} icon={item.icon} onClick={item.onClick} />
        ))}
        <div className={`erda-global-nav-avatar-item rounded-2xl my-4 flex items-center justify-center cursor-pointer`}>
          <UserMenu />
        </div>
      </div>
    </div>
  );
};

export default Navigation;
