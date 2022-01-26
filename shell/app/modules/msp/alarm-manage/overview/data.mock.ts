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

export const enhanceMock = (mockData: any, payload: any) => {
  if (!payload.hierarchy) {
    return mockData;
  }
  return payload;
};

export const mockData = {
  scenario: {
    scenarioKey: 'project-list-my', // 后端定义
    scenarioType: 'project-list-my', // 后端定义
  },
  protocol: {
    hierarchy: {
      root: 'myPage',
      structure: {
        myPage: ['comp', 'alarmEvent', 'alertNotice', 'alarmDurationAnalysis'],
        comp: ['compContainer'],
        alarmEvent: ['alarmEventGrid'],
        alertNotice: ['alarmNoticeGrid'],
        alarmDurationAnalysis: ['alarmDurationAnalysisGrid'],
        alarmEventGrid: ['apiAndResourcesReqCountLine', 'apiAndResourcesReqDurationLine'],
        alarmNoticeGrid: ['apiAndResourcesReqCountLine', 'apiAndResourcesReqDurationLine'],
        alarmDurationAnalysisGrid: ['pageReqDurationDistributionBubble'],
        compContainer: {
          left: 'simpleChart',
          right: 'cards',
        },
        cards: [
          'kvCard@alertEvent',
          'kvCard@uv',
          'kvCard@apdex',
          'kvCard@avgPageLoadDuration',
          'kvCard@apiSuccessRate',
          'kvCard@jsErrorCount',
        ],
      },
    },
    components: {
      myPage: { type: 'Container' },
      cards: {
        type: 'Grid',
        name: 'cards',
        props: null,
        state: {},
        data: {},
        operations: {},
        options: null,
        version: '',
      },
      comp: {
        type: 'ChartBlock',
      },
      compContainer: {
        type: 'LRContainer',
      },
      alarmEvent: {
        type: 'ChartBlock',
        data: {
          title: '告警事件',
        },
      },
      alertNotice: {
        type: 'ChartBlock',
        data: {
          title: '告警通知',
        },
      },
      alarmDurationAnalysis: {
        type: 'ChartBlock',
        data: {
          title: '告警持续时间分析',
        },
      },
      simpleChart: {
        type: 'SimpleChart',
        data: {
          chart: {
            series: [
              {
                data: [
                  149, 149, 149, 161, 168, 180, 185, 185, 187, 198, 209, 210, 210, 210, 210, 210, 210, 210, 210, 210,
                  210, 210, 210, 210, 210,
                ],
                name: '',
              },
            ],
            xAxis: [
              '2022-01-01',
              '2022-01-02',
              '2022-01-03',
              '2022-01-04',
              '2022-01-05',
              '2022-01-06',
              '2022-01-07',
              '2022-01-08',
              '2022-01-09',
              '2022-01-10',
              '2022-01-11',
              '2022-01-12',
              '2022-01-13',
              '2022-01-14',
              '2022-01-15',
              '2022-01-16',
              '2022-01-17',
              '2022-01-18',
              '2022-01-19',
              '2022-01-20',
              '2022-01-21',
              '2022-01-22',
              '2022-01-23',
              '2022-01-24',
              '2022-01-25',
            ],
          },
          main: '2,394',
          sub: '未恢复告警',
        },
      },
      'kvCard@apdex': {
        type: 'KV',
        name: 'apdex',
        props: null,
        state: {},
        data: { list: [{ key: 'Apdex', subKey: '', subValue: '', tip: '', value: '1.0' }] },
        operations: {},
        options: { visible: true, asyncAtInit: false, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      'kvCard@apiSuccessRate': {
        type: 'KV',
        name: 'apiSuccessRate',
        props: null,
        state: {},
        data: { list: [{ key: '通知发送失败', subKey: '', subValue: '', tip: '', value: '100' }] },
        operations: {},
        options: { visible: true, asyncAtInit: false, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      'kvCard@avgPageLoadDuration': {
        type: 'KV',
        name: 'avgPageLoadDuration',
        props: null,
        state: {},
        data: { list: [{ key: '通知发送成功', subKey: '', subValue: '', tip: '', value: '0' }] },
        operations: {},
        options: { visible: true, asyncAtInit: false, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      'kvCard@jsErrorCount': {
        type: 'KV',
        name: 'jsErrorCount',
        props: null,
        state: {},
        data: { list: [{ key: '事件静默', subKey: '', subValue: '', tip: '', value: '0' }] },
        operations: {},
        options: { visible: true, asyncAtInit: false, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      'kvCard@alertEvent': {
        type: 'KV',
        name: 'pv',
        props: null,
        state: {},
        data: { list: [{ key: '告警事件', subKey: '', subValue: '', tip: '', value: '0' }] },
        operations: {},
        options: { visible: true, asyncAtInit: false, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      'kvCard@uv': {
        type: 'KV',
        name: 'uv',
        props: null,
        state: {},
        data: { list: [{ key: '恢复事件', subKey: '', subValue: '', tip: '', value: '0' }] },
        operations: {},
        options: { visible: true, asyncAtInit: false, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      alarmEventGrid: {
        type: 'Grid',
      },
      alarmNoticeGrid: {
        type: 'Grid',
      },
      alarmDurationAnalysisGrid: {
        type: 'Grid',
      },
      apiAndResourcesReqCountLine: {
        type: 'LineGraph',
        name: 'apiAndResourcesReqCountLine',
        props: null,
        state: {},
        data: {
          dimensions: ['API'],
          inverse: false,
          subTitle: '',
          title: '调用次数',
          xAxis: {
            values: [
              '2022-01-25 18:16:32',
              '2022-01-25 18:18:32',
              '2022-01-25 18:20:32',
              '2022-01-25 18:22:32',
              '2022-01-25 18:24:32',
              '2022-01-25 18:26:32',
              '2022-01-25 18:28:32',
              '2022-01-25 18:30:32',
              '2022-01-25 18:32:32',
              '2022-01-25 18:34:32',
              '2022-01-25 18:36:32',
              '2022-01-25 18:38:32',
              '2022-01-25 18:40:32',
              '2022-01-25 18:42:32',
              '2022-01-25 18:44:32',
              '2022-01-25 18:46:32',
              '2022-01-25 18:48:32',
              '2022-01-25 18:50:32',
              '2022-01-25 18:52:32',
              '2022-01-25 18:54:32',
              '2022-01-25 18:56:32',
              '2022-01-25 18:58:32',
              '2022-01-25 19:00:32',
              '2022-01-25 19:02:32',
              '2022-01-25 19:04:32',
              '2022-01-25 19:06:32',
              '2022-01-25 19:08:32',
              '2022-01-25 19:10:32',
              '2022-01-25 19:12:32',
              '2022-01-25 19:14:32',
            ],
          },
          xOptions: { inverse: false, structure: null },
          yAxis: [
            {
              dimension: 'API',
              values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
          ],
          yOptions: [{ dimension: 'API', inverse: false, structure: { enable: true, precision: '', type: 'number' } }],
        },
        operations: {},
        options: { visible: true, asyncAtInit: true, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      apiAndResourcesReqDurationLine: {
        type: 'LineGraph',
        name: 'apiAndResourcesReqDurationLine',
        props: null,
        state: {},
        data: {
          dimensions: ['API'],
          inverse: false,
          subTitle: 'ms',
          title: '调用平均响应时间',
          xAxis: {
            values: [
              '2022-01-25 18:16:32',
              '2022-01-25 18:18:32',
              '2022-01-25 18:20:32',
              '2022-01-25 18:22:32',
              '2022-01-25 18:24:32',
              '2022-01-25 18:26:32',
              '2022-01-25 18:28:32',
              '2022-01-25 18:30:32',
              '2022-01-25 18:32:32',
              '2022-01-25 18:34:32',
              '2022-01-25 18:36:32',
              '2022-01-25 18:38:32',
              '2022-01-25 18:40:32',
              '2022-01-25 18:42:32',
              '2022-01-25 18:44:32',
              '2022-01-25 18:46:32',
              '2022-01-25 18:48:32',
              '2022-01-25 18:50:32',
              '2022-01-25 18:52:32',
              '2022-01-25 18:54:32',
              '2022-01-25 18:56:32',
              '2022-01-25 18:58:32',
              '2022-01-25 19:00:32',
              '2022-01-25 19:02:32',
              '2022-01-25 19:04:32',
              '2022-01-25 19:06:32',
              '2022-01-25 19:08:32',
              '2022-01-25 19:10:32',
              '2022-01-25 19:12:32',
              '2022-01-25 19:14:32',
            ],
          },
          xOptions: { inverse: false, structure: null },
          yAxis: [
            {
              dimension: 'API',
              values: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            },
          ],
          yOptions: [{ dimension: 'API', inverse: false, structure: { enable: true, precision: 'ms', type: 'time' } }],
        },
        operations: {},
        options: { visible: true, asyncAtInit: true, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
      pageReqDurationDistributionBubble: {
        type: 'BubbleGraph',
        name: 'pageReqDurationDistributionBubble',
        props: null,
        state: {},
        data: {
          list: [
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:16:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:18:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:20:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:22:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:24:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:26:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:28:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:30:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:32:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:34:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:36:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:38:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:40:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:42:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:44:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:46:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:48:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:50:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:52:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:54:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:56:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 18:58:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:00:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:02:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:04:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:06:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:08:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:10:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:12:32' },
              y: { unit: '', value: 0 },
            },
            {
              dimension: 'Avg Duration',
              group: '',
              size: { structure: null, value: 0 },
              x: { unit: '', value: '2022-01-25 19:14:32' },
              y: { unit: '', value: 0 },
            },
          ],
          title: '页面加载耗时分布',
          xOptions: { structure: null },
          yOptions: [{ structure: { enable: true, precision: 'ms', type: 'time' } }],
        },
        operations: {},
        options: { visible: true, asyncAtInit: true, flatMeta: false, removeMetaAfterFlat: false },
        version: '',
      },
    },
  },
};

export const useMock = (payload: Obj) => {
  if (process.env.NODE_ENV === 'production') {
    return Promise.resolve();
  } else {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(enhanceMock(mockData, payload));
      }, 200);
    });
  }
};
