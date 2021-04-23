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
import { Link } from 'react-router-dom';
import { Icon as CustomIcon } from 'common';
import { Button, Spin } from 'app/nusi';
import i18n from 'i18n';
import { goTo } from 'common/utils'
import userStore from 'app/user/stores';


import './error-page.scss';

const NoAuth = () => {
  const authContact = userStore.useStore(s => s.authContact);
  return (
    <div className="no-auth-page basic-error-page">
      <div className="info">
        <CustomIcon type="no-auth" color />
        <div className="desc">
          <span>{i18n.t('layout:sorry, you do not have access to this page')}</span>
          {
            authContact
              ? (
                <>
                  <span className="contact-info">{i18n.t('please contact')} {authContact}</span>
                  <Link to={goTo.resolve.workBenchRoot()}>
                    <Button size="large" type="primary">{i18n.t('layout:back to workBench')}</Button>
                  </Link>
                </>
              )
              : (
                <Link to={goTo.resolve.orgRoot()}>
                  <Button size="large" type="primary">{i18n.t('layout:back to home')}</Button>
                </Link>
              )
          }
        </div>
      </div>
    </div>
  );
};

const NotFound = ({ message, force } : { message?: string, force?: boolean }) => {
  const { _master } = window;
  if (_master && _master.isLoadingModule()) {
    return (
      <div className="basic-error-page center-flex-box">
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
          {
            force // 当fdp挂掉的时候用Link返回因为会判断当前平台还是fdp。跳回的首页还是会挂，这里用a标签来强刷
              ? (
                <a href={goTo.resolve.orgRoot()}>
                  <Button size="large" type="primary">{i18n.t('back to home')}</Button>
                </a>
              )
              : (
                <Link to={goTo.resolve.orgRoot()}>
                  <Button size="large" type="primary">{i18n.t('back to home')}</Button>
                </Link>
              )
          }
        </div>
      </div>
    </div>
  );
};

const NotJoinOrg = () => {
  const joinOrgTip = userStore.useStore(s => s.joinOrgTip);

  return (
    <div className="basic-error-page">
      <div className="info">
        <CustomIcon type="no-auth" color />
        <div className="desc">
          <span>{i18n.t("you haven't join current organization")}</span>
          <span className="contact-info">{i18n.t('please contact')} {joinOrgTip}</span>
        </div>
      </div>
    </div>
  );
};


export {
  NoAuth,
  NotFound,
  NotJoinOrg,
};
