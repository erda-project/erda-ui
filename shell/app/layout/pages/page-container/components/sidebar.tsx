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
import { GlobalNavigation, Shell, Badge, Icon, Tooltip, Popover, Menu } from 'app/nusi';
import { usePerm } from 'user/common';
import i18n from 'i18n';
import { Icon as CustomIcon, IF, ImgHolder } from 'common';
import userStore from 'user/stores';
import messageStore from 'layout/stores/message';
import layoutStore from 'layout/stores/layout';
import { theme } from 'app/themes';
import { goTo, ossImg } from 'common/utils';
import { find, get, map } from 'lodash';
import { FULL_DOC_DOMAIN } from 'common/constants';
import diceEnv from 'dice-env';
import Logo from 'app/images/Erda.svg';
import orgStore from 'app/org-home/stores/org';

import './sidebar.scss';

const { AppCenter } = Shell;

const AppCenterEl = () => {
  const permMap = usePerm(s => s.org);
  const appList = layoutStore.useStore(s => s.appList);
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const { switchToApp } = layoutStore.reducers;
  const [visible, setVisible] = React.useState(false);

  const openMap = {
    orgCenter: permMap.entryOrgCenter.pass,
    dataCenter: permMap.dataCenter.showApp.pass,
    workBench: permMap.workBench.read.pass,
    diceFdp: permMap.entryFastData.pass && currentOrg.openFdp,
    microService: permMap.entryMicroService.pass,
    edge: permMap.edge.view.pass,
    // apiManage: permMap.entryApiManage.pass,
  };
  const dataSource = appList.filter(app => openMap[app.key])
    .map((app: LAYOUT.IApp) => {
      return {
        key: app.href,
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
    if(currentOrg.id){
      setVisible(vis);
    }
  };
  return (
    <AppCenter
      visible={visible}
      className='app-list'
      titleProp='name'
      node={(
        <Tooltip title={ currentOrg?.id ? '' : i18n.t('layout:there is no organization information, please select an organization first')} placement='right'>
          <CustomIcon type='appstore' className='fz20' />
        </Tooltip>
      )}
      linkRender={(_linkTo: any, children: any, { app }: { app: LAYOUT.IApp }) => {
        return (
          <a
            className="app-list-item"
            onClick={() => {
              switchToApp(app.key);
              goTo(app.href);
              setVisible(false);
            }}
          >
            {children}
          </a>
        );
      }}
      dataSource={dataSource}
      onVisible={onVisibleChange}
    />
  );
};

const SideBar = () => {
  const loginUser = userStore.useStore((s) => s.loginUser);
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const { switchMessageCenter } = layoutStore.reducers;
  const unreadCount = messageStore.useStore(s => s.unreadCount);
  // 清掉旧版本缓存
  window.localStorage.removeItem('dice-sider');
  
  const customIconStyle = { fontSize: 20, marginRight: 'unset' };
  const operations = [
    {
      show: true,
      icon: (
        <Tooltip title={i18n.t('layout:view doc')} placement="right">
          <Icon type="question-circle" className='fz18' />
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
          <CustomIcon type="i18n" style={customIconStyle} />
        </Tooltip>
      ),
      onClick: () => {
        const current = window.localStorage.getItem('locale') || 'zh';
        const next = current === 'zh' ? 'en' : 'zh';
        window.localStorage.setItem('locale', next);
        window.location.reload();
      },
    },
    {
      show: !loginUser.isSysAdmin && currentOrg.id,
      icon: (
        <Badge dot count={unreadCount} offset={[-5, 2]} style={{ width: '4px', height: '4px', boxShadow: 'none' }}>
          <Icon type="bell" style={customIconStyle} />
        </Badge>
      ),
      onClick: () => switchMessageCenter(null),
    },
  ].filter(a => a.show);

  const userMenu = {
    name: loginUser.nick || loginUser.name,
    // subtitle: 'slogan here',
    avatar: {
      src: loginUser.avatar ? ossImg(loginUser.avatar, { w: 48 }) : undefined,
      chars: (loginUser.nick || loginUser.name).slice(0, 1),
    },
    operations: [
      {
        icon: <CustomIcon type="gerenshezhi" />,
        title: i18n.t('layout:personal settings'),
        onClick: () => {
          window.open(diceEnv.UC_PUBLIC_URL);
        },
      },
      {
        icon: <CustomIcon type="logout" />,
        title: i18n.t('layout:logout'),
        onClick: userStore.effects.logout,
      },
    ],
  };

  return (
    <GlobalNavigation
      layout="vertical"
      verticalBrandIcon={
        <img
          className='mr0 pointer'
          src={Logo}
          onClick={() => {
            goTo(goTo.pages.orgRoot);
          }}
        />
      }
      // appName=''
      // horizontalBrandIcon={ // 横向sidebar待定
      //   <div className='flex-box'>
      //     <img
      //       className='mr24 pointer'
      //       src='/images/erda-logo.svg'
      //       style={{ height: '24px' }}
      //       onClick={() => {
      //         goTo(goTo.pages.orgHome);
      //       }}
      //     />
      //     {
      //       isErdaHome ? (
      //         <Tooltip title={i18n.t('please select your organization or public organization to start your Erda journey')} placement='right'>
      //           <CustomIcon type='appstore' className='side-app-center ml4 fz20' />
      //         </Tooltip>
      //       ) : (
      //         <PopoverSelector
      //           options={[
      //             { key: 'a', name: 'DevOps平台' },
      //             { key: 'b', name: '微服务治理平台' },
      //             { key: 'c', name: '快数据平台' },
      //             { key: 'd', name: '多云管理平台' },
      //             { key: 'e', name: '边缘计算平台' },
      //             { key: 'e', name: '管理中心' },
      //           ]}
      //           value="a"
      //           onChange={() => {}}
      //         />
      //       )
      //     }
      //   </div>
      // }
      operations={operations}
      userMenu={userMenu}
      slot={{
        title: ({ compact }: any) => (compact ? <AppCenterEl /> : null),
        element: <AppCenterEl />,
      }}
    />
  );
};

interface IPopoverSelectorProps {
  value: string;
  options: Array<{key:string, name:string}>
  onChange: () => void;
}

const PopoverSelector = (props: IPopoverSelectorProps) => {
  const { options, value } = props;
  const valueName = get(find(options, { key: value }), 'name') || value;
  const ValueRender = (
    <div className=' v-align side-app-center flex-box pointer' onClick={(e: any) => e.stopPropagation()}>
      {/* <div className='v-align bold'>
        {valueName || <span className=''>{i18n.t('unset')}</span>}
      </div> */}
      <CustomIcon type='appstore' className='fz20 ml4' />
    </div>
  );

  const onClick = (e: any) => {
    e.domEvent.stopPropagation();
  };
  const menu = (
    <Menu onClick={onClick}>
      {map(options, (op) => (
        <Menu.Item key={op.key} className='app-center-item'>
          {/* <span className='v-align'> */}
          {op.name}
          {/* </div> */}
        </Menu.Item>
      ))}
    </Menu>
  );
  return (
    <Popover content={menu} placement='bottom' overlayClassName='side-app-center-popover'>
      {ValueRender}
    </Popover>
  );
};

export default SideBar;
