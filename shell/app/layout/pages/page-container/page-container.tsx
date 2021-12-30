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
import { renderRoutes } from 'react-router-config';
import { ErrorBoundary } from 'common';
import { useUpdate } from 'common/use-hooks';
import classnames from 'classnames';
import Navigation from 'layout/pages/page-container/components/navigation';
import SideBar from 'layout/pages/page-container/components/sidebar';
import Header from 'layout/pages/page-container/components/header';
import Breadcrumb from 'layout/pages/page-container/components/breadcrumb';
import { NoAuth, NotFound } from 'app/layout/common/error-page';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useEffectOnce, useScroll } from 'react-use';
import userStore from 'app/user/stores';
import agent from 'agent';
import { MessageCenter } from './components/message/message';
import { Announcement } from './components/announcement';
import layoutStore from 'app/layout/stores/layout';
import { checkVersion } from 'app/layout/common/check-version';
import routeInfoStore from 'core/stores/route';
import { LSObserver } from 'common/utils';
import { Card } from 'antd';
import Shell from './components/shell';
import { ErrorLayout } from './error-layout';
import { eventHub } from 'common/utils/event-hub';
import orgStore from 'app/org-home/stores/org';
import './page-container.scss';

const layoutMap = {
  error: ErrorLayout,
};

interface IProps {
  route: any;
}
const PageContainer = ({ route }: IProps) => {
  const [noAuth, notFound] = userStore.useStore((s: any) => [s.noAuth, s.notFound]);
  const currentOrg = orgStore.useStore((s) => s.currentOrg);
  const [showMessage, customMain] = layoutStore.useStore((s) => [s.showMessage, s.customMain]);
  const [currentRoute, prevRouteInfo] = routeInfoStore.useStore((s) => [s.currentRoute, s.prevRouteInfo]);
  const [state, updater] = useUpdate({
    startInit: false,
  });

  const mainEle = React.useRef<HTMLDivElement>(null);
  const { y } = useScroll(mainEle);

  useEffectOnce(() => {
    const skeleton = document.querySelector('#erda-skeleton');
    const content = document.querySelector('#erda-content');
    if (skeleton && content) {
      skeleton.className += ' fade';
      content.classList.remove('hidden');
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
      agent.get('/api/users/me').catch((error: any) => {
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
    if (prevRouteInfo?.currentRoute.path !== currentRoute.path) {
      if (mainEle && mainEle.current) {
        mainEle.current.scrollTop = 0;
      }
    }
  }, [currentRoute, prevRouteInfo, mainEle]);

  const { layout } = currentRoute;
  const hideHeader = showMessage || layout?.hideHeader;
  const layoutCls = [];
  let showSidebar = !noAuth && !notFound;
  let CustomLayout;
  let noWrapper = false;
  if (typeof layout === 'object') {
    const { className, use, hideSidebar } = layout;
    if (hideSidebar) showSidebar = false;
    className && layoutCls.push(className);
    layoutMap[use] && (CustomLayout = layoutMap[use]);
    noWrapper = layout.noWrapper;
  }
  const layoutClass = classnames(layoutCls);
  if (CustomLayout) {
    return <CustomLayout layoutClass={layoutClass}>{renderRoutes(route.routes)}</CustomLayout>;
  }
  let MainContent = null;
  if (noAuth) {
    MainContent = <NoAuth />;
  } else if (notFound) {
    MainContent = <NotFound />;
  } else if (state.startInit) {
    MainContent = (
      <ErrorBoundary>
        <DndProvider backend={HTML5Backend}>
          {noWrapper ? (
            <>
              {typeof customMain === 'function' ? customMain() : customMain}
              {renderRoutes(route.routes)}
            </>
          ) : (
            <Card className={layout && layout.fullHeight ? 'h-full overflow-auto' : ''}>
              {typeof customMain === 'function' ? customMain() : customMain}
              {renderRoutes(route.routes)}
            </Card>
          )}
        </DndProvider>
      </ErrorBoundary>
    );
  }

  return (
    <Shell
      className={layoutClass}
      navigation={<Navigation />}
      sidebar={showSidebar ? <SideBar /> : undefined}
      breadcrumb={!hideHeader ? <Breadcrumb /> : undefined}
      announcement={!hideHeader ? <Announcement /> : undefined}
      mainClassName={classnames({ 'ml-4': !showSidebar, 'mt-0': hideHeader })}
    >
      {!hideHeader && <Header />}
      <div className={`main-scroll-tip ${y > 2 ? 'show' : ''}`} aria-hidden="true" />
      <div id="main" ref={mainEle} style={{ opacity: showMessage ? 0 : undefined }} className={hideHeader ? 'p-0' : ''}>
        {MainContent}
      </div>
      <MessageCenter show={showMessage} />
    </Shell>
  );
};

export default PageContainer;
