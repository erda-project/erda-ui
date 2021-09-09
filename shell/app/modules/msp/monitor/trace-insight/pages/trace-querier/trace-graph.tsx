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
import { Tree, Tooltip } from 'core/nusi';
import './trace-graph.scss';

const data = {
  spans: [
    {
      id: '4c4abb30-836c-4b26-88ec-b406824a2cc3',
      traceId: 'c0a76619c77e780a31ecefb3bc69067b',
      operationName: 'Mysql/PreparedStatement/execute',
      startTime: 1630844521577000000,
      endTime: 1630844524578000000,
      parentSpanId: 'e9e27c56-c2f4-44a3-91bd-834f409bc27d',
      timestamp: 0,
      tags: {
        application_id: '15',
        application_name: 'apm-demo',
        cluster_name: 'terminus-dev',
        component: 'Mysql',
        db_instance: 'mysql',
        db_statement: 'SELECT SLEEP(?);',
        db_type: 'Mysql',
        host: 'mysql-master.group-addon-mysql--w525151b176404e549e876ac3ccf10676.svc.cluster.local:3306',
        host_ip: '10.0.6.219',
        operation_name: 'Mysql/PreparedStatement/execute',
        org_id: '2',
        org_name: 'terminus',
        parent_span_id: 'e9e27c56-c2f4-44a3-91bd-834f409bc27d',
        peer_hostname: 'mysql-master.group-addon-mysql--w525151b176404e549e876ac3ccf10676.svc.cluster.local:3306',
        project_id: '13',
        project_name: 'apm-demo-testwushan',
        runtime_id: '9',
        runtime_name: 'feature/simple',
        service_id: '15_feature/simple_apm-demo-api',
        service_name: 'apm-demo-api',
        span_id: '4c4abb30-836c-4b26-88ec-b406824a2cc3',
        span_kind: 'client',
        span_layer: 'db',
        terminus_key: '58ee69adccbb4a42a638b2de6b8eac7c',
        trace_id: 'c0a76619c77e780a31ecefb3bc69067b',
        workspace: 'DEV',
      },
      duration: 3001000000,
      selfDuration: 3001000000,
    },
    {
      id: 'e9e27c56-c2f4-44a3-91bd-834f409bc27d',
      traceId: 'c0a76619c77e780a31ecefb3bc69067b',
      operationName: 'GET http://apm-demo-api-0418e7149b.project-13-dev.svc.cluster.local:8095/api/mysql/sleep',
      startTime: 1630844521575000000,
      endTime: 1630844524579000000,
      parentSpanId: '40ba5110-e6ef-474d-bced-8da7321c4a9a',
      timestamp: 0,
      tags: {
        application_id: '15',
        application_name: 'apm-demo',
        cluster_name: 'terminus-dev',
        component: 'SpringBoot',
        host: 'apm-demo-api-0418e7149b.project-13-dev.svc.cluster.local:8095',
        host_ip: '10.0.6.219',
        http_method: 'GET',
        http_path: '/api/mysql/sleep',
        http_status_code: '200',
        http_url: 'http://apm-demo-api-0418e7149b.project-13-dev.svc.cluster.local:8095/api/mysql/sleep',
        operation_name: 'GET http://apm-demo-api-0418e7149b.project-13-dev.svc.cluster.local:8095/api/mysql/sleep',
        org_id: '2',
        org_name: 'terminus',
        parent_span_id: '40ba5110-e6ef-474d-bced-8da7321c4a9a',
        project_id: '13',
        project_name: 'apm-demo-testwushan',
        runtime_id: '9',
        runtime_name: 'feature/simple',
        service_id: '15_feature/simple_apm-demo-api',
        service_name: 'apm-demo-api',
        span_id: 'e9e27c56-c2f4-44a3-91bd-834f409bc27d',
        span_kind: 'server',
        span_layer: 'http',
        terminus_key: '58ee69adccbb4a42a638b2de6b8eac7c',
        trace_id: 'c0a76619c77e780a31ecefb3bc69067b',
        workspace: 'DEV',
      },
      duration: 3004000000,
      selfDuration: 3000000,
    },
    {
      id: '40ba5110-e6ef-474d-bced-8da7321c4a9a',
      traceId: 'c0a76619c77e780a31ecefb3bc69067b',
      operationName: 'server /api/mysql/sleep?seconds=3',
      startTime: 1630844521679000000,
      endTime: 1630844523380000000,
      parentSpanId: '3554d375-e9f7-43ea-8389-95930f41c879',
      timestamp: 0,
      tags: {
        application_id: '15',
        application_name: 'apm-demo',
        cluster_name: 'terminus-dev',
        component: 'NodeJs',
        host: 'telegraf-app-00e2f41199-shfs7',
        host_ip: '10.0.6.216',
        http_method: 'GET',
        http_path: 'apm-demo-ui-dev.dev.terminus.io/api/mysql/sleep?seconds=3',
        http_status_code: '200',
        http_url: 'http://apm-demo-api-0418e7149b.project-13-dev.svc.cluster.local:8095/api/mysql/sleep?seconds=3',
        instance_id: '78ceeed3-6f35-4f21-9e63-bf9c447aeea1',
        operation_name: 'server /api/mysql/sleep?seconds=3',
        org_id: '2',
        org_name: 'erda',
        parent_span_id: '3554d375-e9f7-43ea-8389-95930f41c879',
        peer_hostname: 'undefined',
        peer_port: '8095',
        project_id: '13',
        project_name: 'apm-demo-testwushan',
        runtime_id: '9',
        runtime_name: 'feature/simple',
        service_id: '15_feature/simple_apm-demo-ui',
        service_instance_id: '78ceeed3-6f35-4f21-9e63-bf9c447aeea1',
        service_ip: '10.112.0.7',
        service_name: 'apm-demo-ui',
        'source-addon-id': 'ApiGateway',
        'source-addon-type': 'ApiGateway',
        source_application_id: '15',
        source_application_name: 'apm-demo',
        source_instance_id: '78ceeed3-6f35-4f21-9e63-bf9c447aeea1',
        source_org_id: '2',
        source_project_id: '13',
        source_project_name: 'apm-demo-testwushan',
        source_runtime_id: '9',
        source_runtime_name: 'feature/simple',
        source_service_id: '15_feature/simple_apm-demo-ui',
        source_service_name: 'apm-demo-ui',
        source_terminus_key: '58ee69adccbb4a42a638b2de6b8eac7c',
        source_workspace: 'DEV',
        span_host: 'undefined',
        span_id: '40ba5110-e6ef-474d-bced-8da7321c4a9a',
        span_kind: 'server',
        span_layer: 'http',
        terminus_app: 'apm-demo-ui',
        terminus_key: '58ee69adccbb4a42a638b2de6b8eac7c',
        terminus_logid: 'c0a76619c77e780a31ecefb3bc69067b',
        trace_id: 'c0a76619c77e780a31ecefb3bc69067b',
        workspace: 'DEV',
      },
      duration: 3011000064,
      selfDuration: 7000064,
    },
  ],
  duration: 3011000064,
  serviceCount: 2,
  depth: 3,
  spanCount: 3,
};

function list_to_tree(arr: any[]) {
  const list = arr.map((x) => ({ ...x, children: [] }));
  const map = {};
  const roots = [];
  const existIds = [];
  let min = Infinity;
  let max = -Infinity;

  for (let i = 0; i < list.length; i++) {
    map[list[i].id] = i;
    existIds.push(list[i].id);
    min = Math.min(min, list[i].startTime);
    max = Math.max(max, list[i].endTime);
  }

  for (let i = 0; i < list.length; i += 1) {
    const node = list[i];
    if (node.parentSpanId !== '' && existIds.includes(node.parentSpanId)) {
      list[map[node.parentSpanId]].children.push(node);
    } else {
      roots.push(node);
    }
  }

  return { roots, min, max };
}

const originTreeData = list_to_tree(data.spans);
const spanTimeInfo = (totalSpanTime, selfSpanTime) => (
  <div className="flex justify-center">
    <div className="border-0 border-r border-solid border-grey flex flex-col items-center px-6 py-1">
      <div className="flex justify-center font-semibold ">
        <span className="text-navy" style={{ fontSize: 16 }}>
          1990,88
        </span>
        <span className="text-navy" style={{ fontSize: 14 }}>
          ms
        </span>
      </div>
      <div className="text-sm text-darkgray">当前 span 时间</div>
    </div>
    <div className="flex flex-col items-center px-6 py-1">
      <div className="flex justify-center font-semibold">
        <span className="text-navy" style={{ fontSize: 16 }}>
          1990,88
        </span>
        <span className="text-navy" style={{ fontSize: 14 }}>
          ms
        </span>
      </div>
      <div className="text-sm text-darkgray">总 span 时间</div>
    </div>
  </div>
);
export function TraceGraph(props) {
  const { dataSource = [] } = props;

  const bg = ['#4E6097', '#498E9E', '#6CB38B', 'purple', '#F7A76B'];
  // const bg = ['red', 'pink', 'green', 'purple', 'blue'];

  const { roots, min, max } = list_to_tree(dataSource);
  const duration = max - min;
  function format(item: any, depth = 0) {
    item.depth = depth;
    item.key = item.id;
    const { startTime, endTime } = item;
    const f1 = (startTime - min) / duration;
    const f2 = (endTime - startTime) / duration;
    const f3 = (max - endTime) / duration;

    const showTextOnLeft = f1 > 0.2;
    const showTextOnRight = !showTextOnLeft && f3 > 0.2;

    item.title = (
      <div className="wrapper">
        <Tooltip title={item?.tags?.service_name}>
          <div className="left" style={{ width: 200 - 24 * depth }}>
            {item?.tags?.service_name}
          </div>
        </Tooltip>
        <div className="right">
          {/* TODO:显示毫秒微妙格式化 */}
          <div style={{ flex: f1 }}>{showTextOnLeft && '19'}</div>
          <Tooltip title={spanTimeInfo}>
            <div style={{ flex: f2, background: bg[depth % 5] }} className="rounded-sm" />
          </Tooltip>
          <div style={{ flex: f3 }}>{showTextOnRight && '46'}</div>
        </div>
      </div>
    );
    if (item.children) {
      item.children = item.children.map((x) => format(x, depth + 1));
    }
    return item;
  }

  function foo(data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = format(data[i], 0);
    }

    return data;
  }

  const bar = foo(roots);

  return <Tree className="trace-graph" showLine defaultExpandAll selectedKeys={[]} treeData={bar} />;
}
