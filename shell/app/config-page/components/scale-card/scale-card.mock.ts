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

const mockData: CP_SCALE_CARD.Spec = {
  type: 'ScaleCard',
  data: {
    list: [
      {
        icon: 'DevOps-entry',
        label: 'DevOps 平台',
        operations: {
          click: {
            serverData: {
              params: {
                projectId: 1,
              },
              query: {
                issueFilter__urlQuery: '',
              },
              target: 'projectAllIssue',
              jumpOut: true, // 新开页面打开
            },
          },
        },
      },
      {
        icon: 'MSP-entry',
        label: '微服务平台',
        link: '',
      },
      {
        icon: 'CMP-entry',
        label: '云管平台',
        link: '',
      },
      {
        icon: 'FDP-entry',
        label: '快数据平台',
        link: '',
      },
      {
        icon: 'control-entry',
        label: '管理中心',
        link: '',
      },
    ],
  },
};

export default mockData;
