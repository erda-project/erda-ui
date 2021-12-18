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
  type: 'BaseList',
  name: 'list',
  state: {
    // "pageNo": false
  },
  data: {
    title: '集群列表',
    list: [
      {
        id: '1',
        label: [
          {
            status: 'success',
            key: '在线',
          },
        ],
        logo: '',
        title: 'Dev 集群',
        description: '这是 dev 集群的描述',
        backgroundImg: 'k8s_cluster_bg',
        operations: [
          {
            key: 'addMachine',
            meta: {
              name: 'terminus-dev',
            },
            reload: false,
            show: true,
            text: '添加机器',
          },
          {
            key: 'star',
            meta: {
              name: 'terminus-dev',
            },
            reload: false,
            show: true,
            text: '添加收藏',
            icon: 'star',
          },
          {
            key: 'unstar',
            meta: {
              name: 'terminus-dev',
            },
            reload: false,
            show: true,
            text: '取消收藏',
            icon: 'unstar',
          },
        ],
        extra: {
          piechart: {
            _meta: {
              title: '单个',
            },
            type: 'PieChart',
            name: 'cpuChart',
            props: {},
            state: {},
            data: {
              data: [
                {
                  color: 'primary8',
                  formatter: '92.7 Core',
                  name: '已分配',
                  value: 92.76,
                },
                {
                  color: 'primary5',
                  formatter: '142.4 Core',
                  name: '剩余分配',
                  value: 142.44,
                },
                {
                  color: 'primary2',
                  formatter: '4.8 Core',
                  name: '不可分配',
                  value: 4.8,
                },
              ],
              label: 'CPU',
            },
            operations: {},
          },
          kv: {
            data: {
              icon: 'machine',
              key: '节点数量',
              value: '23',
              unit: '个',
              tooltip: '节点数量',
            },
            rowNum: 0,
            type: 'kv',
          },
        },
      },
    ],
  },
  operations: {},
};

export default mockData;
