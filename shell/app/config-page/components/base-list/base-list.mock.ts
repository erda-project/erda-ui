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

const mockData: CP_BASE_LIST.Spec = {
  type: 'List',
  version: '2',
  data: {
    pageNo: 1,
    pageSize: 10,
    total: 10,
    title: '项目列表',
    summary: '12',
    filterValue: '',
    list: [
      {
        id: '1', // 唯一id, eg: appid
        logo: 'https://erda.cloud/api/files/302d582a7c054ad2be9d59ef8334da96', // url 地址或 icon 的 key
        title: '项目 A',
        star: true, // 当前是否已收藏
        labels: [
          {
            // color: 'green',
            status: 'success',
            label: '研发项目',
          },
        ],
        // description: '这是项目 A 的描述',
        backgroundImg: '//背景水印图片的 url 地址',
        metaInfos: [
          {
            label: '已过期',
            value: '2',
            icon: '', // 如果配了 icon，优先展示 iocn 代替 key
            tip: '提示信息',
            operations: {
              clickGotoExpired: {
                serverData: {
                  params: {
                    projectId: 1,
                  },
                  query: {
                    issueFilter__urlQuery: '',
                  },
                  target: 'projectAllIssue',
                  jumpOut: true,
                },
              },
            },
          },
          {
            label: '本日到期',
            value: '22',
            icon: '', // 如果配了 icon，优先展示 iocn 代替 key
            tip: '',
            operations: {
              clickGotoTodayExpired: {
                serverData: {
                  params: {
                    projectId: 1,
                  },
                  query: {
                    issueFilter__urlQuery: '',
                  },
                  target: 'projectAllIssue',
                  jumpOut: true,
                },
              },
            },
          },
        ],
        operations: {
          star: {
            clientData: {
              dataRef: {}, // 这个数据对象，前端提供
            },
            skipRender: true, // 是否触发后端渲染，为 true 时页面立刻响应，不等后端返回
            disabled: false,
            tip: '收藏此项目',
          },
          click: {
            serverData: {
              params: {
                projectId: 1,
              },
              query: {},
              target: 'projectAllIssue',
              jumpOut: true, // 新开页面打开
            },
          },
        },
        moreOperations: {
          operations: {
            gotoIssues: {
              text: '项目管理',
              serverData: {
                params: {
                  projectId: 1,
                },
                target: 'projectAllIssue',
                jumpOut: true,
              },
            },
          },
          operationsOrder: ['gotoIssues'], // 操作排列顺序
        },
      },
    ],
  },
  operations: {},
};

export default mockData;
