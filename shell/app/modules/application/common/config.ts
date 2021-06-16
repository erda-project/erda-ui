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

import i18n from 'i18n';
import ywyy_svg from 'app/images/ywyy.svg';
import android_svg from 'app/images/android.svg';
import kyy_svg from 'app/images/kyy.svg';
import dsjyy_svg from 'app/images/dsjyy.svg';
import githubImg from 'app/images/resources/github.png';
import gitlabImg from 'app/images/resources/gitlab.png';
import codingImg from 'app/images/resources/coding.png';

export const appMode = {
  SERVICE: 'SERVICE',
  MOBILE: 'MOBILE',
  LIBRARY: 'LIBRARY',
  BIGDATA: 'BIGDATA',
  ABILITY: 'ABILITY',
  PROJECT_SERVICE: 'PROJECT_SERVICE',
};

export const modeOptions = [
  {
    name: i18n.t('application:business app'),
    value: appMode.SERVICE,
    src: ywyy_svg,
    desc: i18n.t('application:Business-app-intro', { keySeparator: '>' }),
    groupIndex: 1,
  },
  {
    name: i18n.t('application:mobile app'),
    value: appMode.MOBILE,
    src: android_svg,
    desc: i18n.t('application:Mobile-app-intro.', { keySeparator: '>' }),
    groupIndex: 1,
  },
  {
    name: i18n.t('application:library app'),
    value: appMode.LIBRARY,
    src: kyy_svg,
    desc: i18n.t('application:Library-app-intro', { keySeparator: '>' }),
    groupIndex: 1,
  },
  {
    name: i18n.t('application:bigData app'),
    value: appMode.BIGDATA,
    src: dsjyy_svg,
    desc: 'big data app',
    groupIndex: 1,
  },
  {
    name: i18n.t('application:ability app'),
    value: appMode.ABILITY,
    src: dsjyy_svg,
    desc: 'ability app',
    groupIndex: 1,
  },
  {
    name: i18n.t('application:project level app'),
    value: appMode.PROJECT_SERVICE,
    src: dsjyy_svg,
    desc: i18n.t('application:project-level-app-form-tip'),
    groupIndex: 2,
  },
];

export const approvalStatus = {
  pending: i18n.t('application:approval pending'),
  approved: i18n.t('application:approved'),
  denied: i18n.t('application:denied'),
  cancel: i18n.t('application:cancel'),
};

export enum RepositoryMode {
  Internal = 'internal',
  General = 'general',
  GitLab = 'gitlab',
  GitHub = 'github',
  Coding = 'coding',
}

export const repositoriesTypes = {
  [RepositoryMode.Internal]: {
    name: i18n.t('project:System built-in Git repository'),
    value: RepositoryMode.Internal,
    displayname: '',
    logo: githubImg,
    usable: true,
    desc: null,
  },
  [RepositoryMode.General]: {
    name: i18n.t('project:external general Git repository'),
    value: RepositoryMode.General,
    displayname: 'Git',
    logo: githubImg,
    usable: true,
    desc: i18n.t('project:tips of external general repository'),
  },
  // 3.16 只做外置通用git仓库
  [RepositoryMode.GitLab]: {
    name: i18n.t('project:connect to {type}', { type: 'GitLab' }),
    value: RepositoryMode.GitLab,
    displayname: 'GitLab',
    logo: gitlabImg,
    usable: false,
    desc: i18n.t('project:tips of external general repository'),
  },
  [RepositoryMode.GitHub]: {
    name: i18n.t('project:connect to {type}', { type: 'GitHub' }),
    value: RepositoryMode.GitHub,
    displayname: 'GitHub',
    logo: githubImg,
    usable: false,
    desc: i18n.t('project:tips of external general repository'),
  },
  [RepositoryMode.Coding]: {
    name: i18n.t('project:connect to Coding'),
    value: RepositoryMode.Coding,
    displayname: 'Coding',
    logo: codingImg,
    usable: false,
    desc: i18n.t('project:tips of external general repository'),
  },
};
