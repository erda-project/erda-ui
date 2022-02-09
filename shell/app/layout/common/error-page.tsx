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
import { Link } from 'react-router-dom';
import { Icon as CustomIcon } from 'common';
import { Button, Spin } from 'antd';
import i18n from 'i18n';
import { goTo } from 'common/utils';
import userStore from 'app/user/stores';
import permStore from 'user/stores/permission';
import { once } from 'core/event-hub';
import { getGlobal, GLOBAL_KEY } from 'core/global-space';

import './error-page.scss';

const NoAuth = () => {
  const authContact = userStore.useStore((s) => s.authContact);
  const permProject = permStore.useStore((s) => s.project);
  const permApp = permStore.useStore((s) => s.app);
  // permProject or permApp is newPermObj, the type is not inconsistent with state[scope]
  const hasCurProject = permProject.access;
  // isProjectOwner: is the owner of the current project
  const isProjectOwner = permProject?.roles?.includes('Owner');
  // when the user has no auth enter the current project, back-end will return projectName
  const { projectName: noAuthProjectName } = permProject?.scopeInfo || {};
  // when the user has no auth enter the current app, back-end will return projectName and appName
  const { appName, projectName } = permApp?.scopeInfo || {};

  return (
    <div className="no-auth-page basic-error-page">
      <div className="info">
        <CustomIcon type="no-auth" color />
        <div className="desc">
          <div>
            <span>{i18n.t('layout:sorry, you do not have access to this page')} </span>
            {noAuthProjectName && <span>({noAuthProjectName || ''})</span>}
            {appName && (
              <span>
                ({projectName || ''}/{appName || ''})
              </span>
            )}
          </div>
          {authContact ? (
            <>
              <span className="contact-info">
                {i18n.t('please contact')} {authContact}
              </span>
              {hasCurProject ? (
                <div>
                  {isProjectOwner && (
                    <Link to={goTo.resolve.projectMemberManagement()} className="mr-2">
                      <Button size="large" type="primary">
                        {i18n.t('setting permissions')}
                      </Button>
                    </Link>
                  )}
                  <Link to={goTo.resolve.projectApps()}>
                    <Button size="large" type={`${isProjectOwner ? 'ghost' : 'primary'}`}>
                      {i18n.t('layout:back to application list')}
                    </Button>
                  </Link>
                </div>
              ) : (
                <Link to={goTo.resolve.dopRoot()}>
                  <Button size="large" type="primary">
                    {i18n.t('layout:back to dop')}
                  </Button>
                </Link>
              )}
            </>
          ) : (
            <div>
              {isProjectOwner && (
                <Link to={goTo.resolve.projectMemberManagement()} className="mr-2">
                  <Button size="large" type="primary">
                    {i18n.t('setting permissions')}
                  </Button>
                </Link>
              )}
              <Link to={goTo.resolve.landPage()}>
                <Button size="large" type={`${isProjectOwner ? 'ghost' : 'primary'}`}>
                  {i18n.t('back to home')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NotFound = ({ message, force }: { message?: string; force?: boolean }) => {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    // incase after the first load, useEffect of inner component will trigger first, useEffect of root component will trigger in the end
    // so setGlobal at root can't exec before this useEffect, we need move this logic to next tick
    setTimeout(() => {
      const isLoadingModule = getGlobal(GLOBAL_KEY.LOADING_MODULE);
      if (!isLoadingModule) {
        setReady(true);
      }
      once('loadingModuleFailed', () => setReady(true));
    });
  }, []);

  if (!ready) {
    return (
      <div className="basic-error-page flex flex-wrap justify-center items-center">
        <Spin spinning size="large" tip={i18n.t('please wait, the module is loading')} />
      </div>
    );
  }

  return (
    <div className="not-found-page basic-error-page">
      <div className="info">
        <CustomIcon type="404" color />
        <div className="desc">
          <span>{message || i18n.t('layout:page-not-found')}</span>
          {force ? ( // force jump to erda root
            <a href={goTo.resolve.landPage()}>
              <Button size="large" type="primary">
                {i18n.t('back to home')}
              </Button>
            </a>
          ) : (
            <Link to={goTo.resolve.landPage()}>
              <Button size="large" type="primary">
                {i18n.t('back to home')}
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export { NoAuth, NotFound };
