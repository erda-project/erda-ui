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

import { apiCreator } from 'core/service';

const apis = {
  getServiceTypes: {
    api: '/api/opus-types',
    mock() {
      return {
        list: [
          { name: 'Action', type: 'action', displayName: 'Action' },
          { name: 'Addon', displayName: 'Addon', type: 'addon' },
          { name: 'App', displayName: 'App', type: 'app' },
        ],
      };
    },
  },
  getServiceList: {
    api: '/api/opus',
    mock(payload) {
      console.log('------req', payload);
      const numberMap = {
        all1: [10, 13],
        all2: [3, 13],
        action1: [5, 5],
        addon1: [10, 21],
        addon2: [10, 21],
        addon3: [1, 21],
        app1: [0, 0],
      };
      const number = numberMap[`${payload.type || 'all'}${payload.pageNo}`];
      return {
        list: new Array(number[0]).fill('').map((item, idx) => ({
          id: `${idx}`,
          orgName: 'Erda',
          type: 'Action',
          name: `${idx + (payload.pageNo - 1) * payload.pageSize}-name`,
          version: '1.0',
          displayName: `${idx + (payload.pageNo - 1) * payload.pageSize}-${payload.type}`,
          summary: '测试测试测试测试测试测试测试测试测试测试测试测试',
          labels: ['aaa', 'bbbbbbbbbbbbb', 'cccc', 'dd'],
          logoURL:
            'https://terminus-paas.oss-cn-hangzhou.aliyuncs.com/paas-doc/2020/02/14/58faae51-f602-45c3-95e9-d2b4fe4a369c.png',
          presentation: {
            desc: 'git-checkout action 提供对 Git 代码仓库的克隆能力，包括设置 depth、submodules 等功能。',
            contactName: ['', 'zhangxj'][idx % 2],
            contactURL: ['', 'https//erda.com'][idx % 2],
            contactEmail: '12@126.com',
            isOpenSourced: [true, false][idx % 2],
            opensourceURL: ['https://github.com/erda-project'][idx % 2],
            homepageName: 'Erda',
            homepageURL: 'www.erda.com',
            isDownloadable: [true, false][idx % 2],
            downloadURL: 'https://sss.com',
            readme:
              '### 项目文化和契约\n* 我们采用围绕 事项 的 透明 、 非同步 的协同工作方式 （事项是用来协同你和别人，不只是用来记录你的事情）\n* 我们要求事事（事项）有 DEADLINE ，事事（事项）有 反馈\n* 我们追求事事有 文档\n* 我们崇尚事事 自动化\n### 发布计划\n* 每两周发布一个大版本（大版本：是包含产品新特性的版本）\n* 一个大版本的中间周可以发布个小版本（小版本：以 bug 修改和小改善为主）\n\n### 知识库\n1. 设计文档\n*  [产品原型设计文档](https://ucd8gi.axshare.com/)    pwd：Erda@2021\n*  [UI设计文档](https://done.alibaba-inc.com/detail/project/O3JC9ES8p8GK/6eQAGNB0Ky7o/file?categoryId=all)\n\n2. 项目规范文档\n*  [项目协作规范](https://yuque.antfin.com/dice/zs3zid/pp9h5f)\n*  [缺陷管理规范](https://yuque.antfin-inc.com/dice/tgte9y/io411g)\n*  [Go 开发规范](https://yuque.antfin-inc.com/dice/zs3zid/dkr3ym)\n* [前端开发规范](https://yuque.antfin-inc.com/dice/tgte9y/rzyy6b)\n* [SQL 规约](https://yuque.antfin-inc.com/dice/zs3zid/qk9lvf)\n* [镜像管理规范](https://yuque.antfin-inc.com/dice/zs3zid/mbasyr)\n* [高效本地联调](https://yuque.antfin-inc.com/dice/dw1o47/bgh5b0)\n\n3. 新人帮助文档\n* [新人培训文档](https://yuque.antfin-inc.com/dice/tgte9y/tnwx6g)\n* [工作环境搭建](https://yuque.antfin-inc.com/dice/tgte9y/epwumz)\n\n"',
          },
        })),
        total: number[1],
      };
    },
  },
  getServiceDetail: {
    api: '/api/opus/:id/versions',
    mock() {
      return {
        catalog: '',
        createdAt: '2022-05-10T07:40:11Z',
        creatorID: '2',
        defaultVersionID: '98d57e4f-58a9-4715-a53f-e5814d482b81',
        displayName: 'go-demo',
        id: 'c4b840e5-2337-4bfb-bff5-bd0e561df415',
        latestVersionID: '98d57e4f-58a9-4715-a53f-e5814d482b81',
        level: 'org',
        name: 'Erda Artifacts',
        orgID: 1,
        orgName: 'erda',
        type: 'erda/artifacts/project',
        updatedAt: '2022-05-10T07:40:11Z',
        updaterID: '2',
        versions: [
          {
            contactEmail: 'rainchan365@163.com',
            contactName: 'ChenZhongrun',
            contactURL: '',
            createdAt: '2022-05-10T07:40:11Z',
            creatorID: '2',
            desc: 'go-demo 是一个测试用的项目',
            downloadURL:
              'https://erda.dev.terminus.io/api/erda/releases/d42aa202c8b649cbb60e1b7070665aff/actions/download',
            homepageLogoURL: '',
            homepageName: 'Erda Cloud',
            homepageURL: 'https://www.erda.com',
            id: '98d57e4f-58a9-4715-a53f-e5814d482b81',
            isDownloadable: true,
            isOpenSourced: false,
            isValid: true,
            labels: [],
            licenceName: '',
            licenceURL: '',
            logoURL:
              'https://terminus-paas.oss-cn-hangzhou.aliyuncs.com/paas-doc/2020/02/14/58faae51-f602-45c3-95e9-d2b4fe4a369c.png',
            opensourceURL: '',
            readme: '# go-demo 项目制品\n\n## 版本\n\n1+20220302083857\n\n- [x] 应用A\n- [x] 应用B\n',
            readmeLang: 'unknown',
            readmeLangName: 'unknown',
            ref: '',
            summary: 'go-demo 是一个测试用的项目',
            updatedAt: '2022-05-10T07:40:11Z',
            updaterID: '2',
            version: '1+20220302083857',
          },
        ],
      };
    },
  },
};

export const getServiceTypes = apiCreator<() => IPagingResp<MARKET.Type>>(apis.getServiceTypes);

export const getServiceList = apiCreator<(p: MARKET.ServiceReq) => IPagingResp<MARKET.Service>>(apis.getServiceList);

export const getServiceDetail = apiCreator<(p: { id: string }) => MARKET.Detail>(apis.getServiceDetail);
