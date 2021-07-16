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
import { GlobalNavigation, Shell, Badge, Tooltip, message } from 'app/nusi';
import { usePerm } from 'user/common';
import i18n from 'i18n';
import { Icon as CustomIcon, ImgHolder, ErdaCustomIcon } from 'common';
import userStore from 'user/stores';
import messageStore from 'layout/stores/message';
import layoutStore from 'layout/stores/layout';
import { theme } from 'app/themes';
import { goTo, ossImg, insertWhen } from 'common/utils';
import { useMount } from 'react-use';
import { FULL_DOC_DOMAIN } from 'common/constants';
import diceEnv from 'dice-env';
import Logo from 'app/images/Erda.svg';
import orgStore from 'app/org-home/stores/org';
import { Help as IconHelp, Remind as IconRemind, Logout as IconLogout } from '@icon-park/react';
import './sidebar.scss';

const { AppCenter } = Shell;
const dataEngineerInfo = process.env.dataEngineerInfo as unknown as { indexUrl: string; name: string };

const AppCenterEl = () => {
  const permMap = usePerm((s) => s.org);
  const appList = layoutStore.useStore((s) => s.appList);
  const currentOrg = orgStore.useStore((s) => s.currentOrg);
  const { switchToApp } = layoutStore.reducers;
  const [visible, setVisible] = React.useState(false);

  const iconMap = {
    dop: 'devops1',
    sysAdmin: 'guanli',
    cmp: 'duoyun',
    msp: 'weifuwu1',
    orgCenter: 'guanli',
    [dataEngineerInfo.name]: 'dataEngineer',
    ecp: 'bianyuanjisuan',
    apiManage: 'apijishi',
  };

  const openMap = {
    orgCenter: permMap.entryOrgCenter.pass,
    cmp: permMap.cmp.showApp.pass,
    dop: permMap.dop.read.pass,
    [dataEngineerInfo.name]: permMap.entryFastData.pass && currentOrg.openFdp, // this is backend attribute can't remove
    msp: permMap.entryMsp.pass,
    ecp: permMap.ecp.view.pass && currentOrg.type === 'ENTERPRISE',
    // apiManage: permMap.entryApiManage.pass,
  };
  const dataSource = appList
    .filter((app) => openMap[app.key])
    .map((app: LAYOUT.IApp) => {
      return {
        key: app.href || app.key,
        app,
        name: app.name,
        title: (
          <>
            <ImgHolder
              src={''}
              bg={theme.primaryColor}
              fg="FFFFFF"
              text={app.name.slice(0, 1)}
              rect="24x24"
              alt="app-logo"
            />
            <span>{app.name}</span>
          </>
        ),
      };
    });
  const onVisibleChange = (vis: boolean) => {
    if (currentOrg.id) {
      setVisible(vis);
    }
  };

  return (
    <AppCenter
      visible={visible}
      className="app-list"
      titleProp="name"
      node={
        <Tooltip
          title={
            currentOrg?.id
              ? ''
              : i18n.t('layout:there is no organization information, please select an organization first')
          }
          placement="right"
        >
          <ErdaCustomIcon type="appstore" color="white" size="20px" />
        </Tooltip>
      }
      linkRender={(_linkTo: any, _children: any, { app }: { app: LAYOUT.IApp }) => {
        return (
          <a
            className="app-list-item"
            onClick={() => {
              switchToApp(app.key);
              goTo(app.href);
              setVisible(false);
            }}
          >
            <CustomIcon type={iconMap[app.key]} />
            <span>{app.name}</span>
          </a>
        );
      }}
      dataSource={dataSource}
      onVisible={onVisibleChange}
    />
  );
};

/*
Display rule of avatar chars:
1) 王小刚 --> 小刚
2）diceop  --> dice
3）miwMio  --> miw
4) micW  --> micW

comment: letter like m, w, M, W is wider than others , so we limit the counts of these
*/
const getAvatarChars = (name: string) => {
  const pattern = /[\u4e00-\u9fa5]/;

  if (pattern.test(name)) {
    return name.slice(-2);
  } else {
    const longLetterPattern = new RegExp(/[mwMW]/g);
    const longLetterCount = name.match(longLetterPattern)?.length || 0;
    const maxLength = longLetterCount > 2 ? 3 : 4;
    return name.slice(0, maxLength);
  }
};

const SideBar = () => {
  const loginUser = userStore.useStore((s) => s.loginUser);
  const [currentOrg, orgs] = orgStore.useStore((s) => [s.currentOrg, s.orgs]);
  const { switchMessageCenter } = layoutStore.reducers;
  const unreadCount = messageStore.useStore((s) => s.unreadCount);
  // 清掉旧版本缓存
  window.localStorage.removeItem('dice-sider');
  const curOrgName = currentOrg.name;
  const customIconStyle = { fontSize: 20, marginRight: 'unset' };
  const current = window.localStorage.getItem('locale') || 'zh';
  const operations = [
    {
      show: true,
      icon: (
        <Tooltip title={i18n.t('layout:view doc')} placement="right">
          <IconHelp className="mr0" size="20px" />
        </Tooltip>
      ),
      onClick: () => {
        window.open(FULL_DOC_DOMAIN);
      },
    },
    {
      show: true,
      icon: (
        <Tooltip title={i18n.t('default:switch language')} placement="right">
          <ErdaCustomIcon type={current === 'zh' ? 'chinese' : 'english'} style={customIconStyle} />
        </Tooltip>
      ),
      onClick: () => {
        const next = current === 'zh' ? 'en' : 'zh';
        window.localStorage.setItem('locale', next);
        window.location.reload();
      },
    },
    {
      show: !loginUser.isSysAdmin,
      icon: (
        <Badge
          size="small"
          count={unreadCount}
          offset={[-5, 2]}
          className="message-icon unselectable"
          style={{ boxShadow: 'none' }}
        >
          <IconRemind className="mr0" size="20px" style={customIconStyle} />
        </Badge>
      ),
      onClick: () => switchMessageCenter(null),
    },
  ].filter((a) => a.show);

  useMount(() => {
    orgStore.effects.getJoinedOrgs();
  });

  const useMenuOperations = [
    ...insertWhen(!!diceEnv.UC_PUBLIC_URL, [
      {
        icon: <ErdaCustomIcon type="user-config" />,
        title: i18n.t('layout:personal settings'),
        onClick: () => {
          window.open(diceEnv.UC_PUBLIC_URL);
        },
      },
    ]),
    {
      icon: <IconLogout />,
      title: i18n.t('layout:logout'),
      onClick: userStore.effects.logout,
    },
  ];

  const userMenu = {
    name: loginUser.nick || loginUser.name,
    avatar: {
      src: loginUser.avatar ? ossImg(loginUser.avatar, { w: 48 }) : undefined,
      chars: getAvatarChars(loginUser.nick || loginUser.name),
      limitChars: 0,
    },
    operations: useMenuOperations,
  };

  return (
    <GlobalNavigation
      layout="vertical"
      verticalBrandIcon={
        loginUser.isSysAdmin ? null : (
          <img
            className="mr0 pointer"
            src={Logo}
            style={{
              width: '19px',
              height: '19px',
            }}
            onClick={() => {
              const isIncludeOrg = !!orgs.find((x: Obj) => x.name === curOrgName);
              if (isIncludeOrg) {
                goTo(goTo.pages.orgRoot);
              } else if (!orgs?.length) {
                // skipping warning when the user doesn't join any organization.
                goTo(goTo.pages.orgRoot, { orgName: '-' });
              } else {
                message.warning(i18n.t('default:org-jump-tip'), 2, () => goTo(goTo.pages.orgRoot, { orgName: '-' }));
              }
            }}
          />
        )
      }
      operations={operations}
      userMenu={userMenu}
      slot={{
        title: ({ compact }: any) => (compact ? <AppCenterEl /> : null),
        element: <AppCenterEl />,
      }}
    />
  );
};

export default SideBar;
