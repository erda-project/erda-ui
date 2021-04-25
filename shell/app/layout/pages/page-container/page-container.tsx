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

import * as React from 'react';
import { renderRoutes } from 'react-router-config';
import { ErrorBoundary, useUpdate } from 'common';
import classnames from 'classnames';
import SideBar from 'layout/pages/page-container/components/sidebar';
import SubSideBar from 'layout/pages/page-container/components/sub-sidebar';
import Header from 'layout/pages/page-container/components/header';
import { NoAuth, NotFound } from 'app/layout/common/error-page';
import { Location } from 'interface/common';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DiceLicense } from './dice-license';
import { useEffectOnce } from 'react-use';
import userStore from 'app/user/stores';
import agent from 'superagent';
import { MessageCenter } from '../message/message';
import layoutStore from 'app/layout/stores/layout';
import { checkVersion } from 'app/layout/common/check-version';
import routeInfoStore from 'app/common/stores/route';
import { LSObserver } from 'common/utils';
import { Carousel, Card, Shell } from 'app/nusi';
import { ErrorLayout } from './error-layout';
import { eventHub } from 'common/utils/event-hub';
import orgStore from 'app/org-home/stores/org';
import './page-container.scss';

const layoutMap = {
  error: ErrorLayout,
};

interface IProps {
  route: any;
  location: Location;
  params: object;
}
const PageContainer = ({ route }: IProps) => {
  const [loginUser, noAuth, notFound] = userStore.useStore((s: any) => [s.loginUser, s.noAuth, s.notFound]);
  const currentOrg = orgStore.useStore(s => s.currentOrg);
  const [showMessage, customMain, announcementList] = layoutStore.useStore(s => [s.showMessage, s.customMain, s.announcementList]);
  const [currentRoute, isIn] = routeInfoStore.useStore(s => [s.currentRoute, s.isIn]);
  const [state, updater] = useUpdate({
    startInit: false,
  });

  const mainEle = React.useRef(null);

  let prevPathName: string;

  useEffectOnce(() => {
    const skeleton = document.querySelector('#dice-skeleton');
    const content = document.querySelector('#dice-content');
    if (skeleton && content) {
      skeleton.className += ' fade';
      content.classList.remove('hide');
      setTimeout(() => {
        skeleton.remove();
        const scriptDom = document.querySelector('#init-script');
        if (scriptDom) {
          scriptDom.remove();
        }
      }, 500);
    }
    eventHub.emit('layout/mount');

    if (process.env.NODE_ENV === 'production') {
      checkVersion();
    }
    const checkLoginStatus = () => {
      agent.get('/api/users/me')
        .catch((error: any) => {
          const { statusCode } = error.response;
          if ([401].includes(statusCode)) {
            userStore.effects.login();
          }
        });
    };

    // 注册并监听登录状态的变化
    LSObserver.watch('diceLoginState', (val: any) => {
      if (val.toString() === 'false' && currentOrg.id) {
        setTimeout(() => {
          checkLoginStatus();
        }, 0);
      }
    });

    // wait for layout complete
    setTimeout(() => {
      updater.startInit(true);
    }, 0);
  });

  React.useEffect(() => {
    const curPathName = window.location.pathname;
    if (prevPathName !== curPathName) {
      if (mainEle && mainEle.current) {
        (mainEle.current as any).scrollTop = 0;
      }
    }
    prevPathName = curPathName;
  }, [window.location.pathname, mainEle]);

  const { layout } = currentRoute;
  const hideHeader = showMessage || layout?.hideHeader;
  const layoutCls = ['dice-layout'];
  const noticeWrap = ['notice-wrap'];
  if (announcementList.length) {
    layoutCls.push('has-notice');
    if (announcementList.length === 1) {
      layoutCls.push('has-notice-only-one');
      noticeWrap.push('only-one');
    }
  }
  let showSubSidebar = !noAuth && !notFound;
  let CustomLayout;
  let noWrapper = false;
  if (typeof layout === 'object') {
    const { className, use, showSubSidebar: layoutShowSubSiderBar } = layout;
    if (showSubSidebar && layoutShowSubSiderBar === false) showSubSidebar = false;
    className && layoutCls.push(className);
    layoutMap[use] && (CustomLayout = layoutMap[use]);
    noWrapper = layout.noWrapper;
  }
  const layoutClass = classnames(layoutCls);
  const noticeClass = classnames(noticeWrap);
  if (CustomLayout) {
    return <CustomLayout layoutClass={layoutClass}>{renderRoutes(route.routes)}</CustomLayout>;
  }
  let MainContent = null;
  if (noAuth) {
    MainContent = <NoAuth />;
  } else if (notFound) {
    MainContent = <NotFound />;
  } else if (state.startInit) {
    const Inner = (
      <ErrorBoundary>
        <DndProvider backend={HTML5Backend}>
          {typeof customMain === 'function' ? customMain() : customMain}
          {renderRoutes(route.routes)/* 这里必须始终调用，不用根据customMain判断 */}
        </DndProvider>
      </ErrorBoundary>
    );
    MainContent = noWrapper
      ? Inner
      : (
        <Card className={(layout && layout.fullHeight) ? 'full-height auto-overflow' : ''}>
          {Inner}
        </Card>
      );
  }

  return (
    <>
      {
        announcementList.length ? (
          <div className={noticeClass}>
            <Carousel arrows autoplay autoplaySpeed={5000}>
              {
                announcementList.map(announcement => {
                  return <div key={announcement.id}>{announcement.content}</div>;
                })
              }
            </Carousel>
          </div>
        ) : null
      }
      <div className={layoutClass}>
        <Shell
          layout='vertical'
          fixed
          className='dice-main-shell'
          theme='BL'
          globalNavigation={<SideBar />}
          sideNavigation={showSubSidebar ? <SubSideBar /> : undefined}
          pageHeader={!hideHeader ? <Header /> : undefined}
        >
          <div id="main" ref={mainEle} style={{ opacity: showMessage ? 0 : undefined }} className={hideHeader ? 'pa0' : ''}>
            {MainContent}
          </div>
          {!loginUser.isSysAdmin && <MessageCenter show={showMessage} />}
        </Shell>
        <DiceLicense />
      </div>
    </>
  );
};

export default PageContainer;
