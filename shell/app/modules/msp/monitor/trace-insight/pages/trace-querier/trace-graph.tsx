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
import { Tree, Tooltip, Table, Modal, Ellipsis, Button } from 'core/nusi';
import { mkDurationStr } from 'trace-insight/common/utils/traceSummary';
import './trace-graph.scss';
import { Icon as CustomIcon } from 'common';
import { divide, map } from 'lodash';

function list_to_tree(arr: any[] = []) {
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

// const originTreeData = list_to_tree(data.spans);
const sapnTitleInfo = () => (
  <div>
    <div>operationName</div>
    <div>span_kind - component</div>
  </div>
);
const spanTimeInfo = (totalSpanTime: number, selfSpanTime: number) => (
  <div className="flex justify-center">
    <div className="border-0 border-r border-solid border-grey flex flex-col items-center px-6 py-1">
      <div className="flex justify-center font-semibold ">
        <span className="text-navy" style={{ fontSize: 16 }}>
          {mkDurationStr(selfSpanTime / 1000)}
        </span>
        {/* <span className="text-navy" style={{ fontSize: 14 }}>
          ms
        </span> */}
      </div>
      <div className="text-sm text-darkgray">当前 span 时间</div>
    </div>
    <div className="flex flex-col items-center px-6 py-1">
      <div className="flex justify-center font-semibold">
        <span className="text-navy" style={{ fontSize: 16 }}>
          {mkDurationStr(totalSpanTime / 1000)}
        </span>
        {/* <span className="text-navy" style={{ fontSize: 14 }}>
          ms
        </span> */}
      </div>
      <div className="text-sm text-darkgray">总 span 时间</div>
    </div>
  </div>
);

const TraceDetailInfo = ({ dataSource }) => {
  const { duration, serviceCount, depth, spanCount } = dataSource;
  return (
    <div className="bg-grey flex justify-between items-center h-20 mb-8">
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="text-xl text-sub font-semibold">{mkDurationStr(duration / 1000) || 0}</div>
        <div className="text-xs text-darkgray">Duration</div>
      </div>
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="text-xl text-sub font-semibold">{serviceCount || 0}</div>
        <div className="text-xs text-darkgray">Services</div>
      </div>
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="text-xl text-sub font-semibold">{depth || 0}</div>
        <div className="text-xs text-darkgray">Depth</div>
      </div>
      <div className="flex flex-col flex-1 items-center justify-center">
        <div className="text-xl text-sub font-semibold">{spanCount || 0}</div>
        <div className="text-xs text-darkgray">Total Spans</div>
      </div>
    </div>
  );
};
const TraceHeader = (props) => {
  const { duration } = props;
  const avg = duration / 4 / 1000;
  const [t1, t2, t3, t4] = [mkDurationStr(avg), mkDurationStr(avg * 2), mkDurationStr(avg * 3), mkDurationStr(avg * 4)];

  return (
    <div className="trace-header text-gray font-semibold text-sm pb-3 mb-4">
      <div className="left">Services</div>
      <div className="right">{`${t1}`}</div>
      <div className="right">{`${t2}`}</div>
      <div className="right">{`${t3}`}</div>
      <div className="right">{`${t4}`}</div>
    </div>
  );
};

const SpanDetail = (props: ISpanDetailProps) => {
  const { spanDetailContent, getSpanDetailContent } = props;
  const { durationStr, tags, operationName: spanName = '' } = spanDetailContent.span;
  const columns2 = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text: string) => <Ellipsis overlayClassName="trace-value-tooltips" title={text} />,
    },
  ];
  const data = map(tags, (value, key) => ({ key, value }));

  return (
    <Modal
      visible={spanDetailContent.visible}
      onCancel={() => getSpanDetailContent && getSpanDetailContent({ span: spanDetailContent, visible: false })}
      className="span-detail-modal"
      width={920}
      title={[
        spanName && spanName.length > 95 ? (
          <Tooltip key="spanName" title={spanName} overlayClassName="full-span-name">
            <h3 className="title">{spanName}</h3>
          </Tooltip>
        ) : (
          <h3 key="spanName">{spanName}</h3>
        ),
        <h4 key="aka" className="sub-title">
          AKA: {tags?.service_name} {durationStr}
        </h4>,
      ]}
      footer=""
    >
      <Table
        className="no-operation second-table"
        rowKey="key"
        columns={columns2}
        dataSource={data}
        pagination={false}
        scroll={{ x: '100%' }}
      />
    </Modal>
  );
};

export function TraceGraph(props) {
  const { dataSource = {}, spanDetailContent = {}, getSpanDetailContent } = props;

  const bg = ['#4E6097', '#498E9E', '#6CB38B', 'purple', '#F7A76B'];
  // const bg = ['#5872C0', '#ADDD8B', '#DE6E6A', '#84BFDB', '#599F76', '#ED895D', '#9165AF','#DC84C8','#F3C96B'];
  const [expandedKeys, setExpandedKeys] = React.useState([]);
  const { roots, min, max } = list_to_tree(dataSource.spans);
  const duration = max - min;
  const allKeys: string[] = [];
  function format(item: any, depth = 0) {
    item.depth = depth;
    item.key = item.id;
    allKeys.push(item.id);
    const { startTime, endTime, duration: totalDuration, selfDuration } = item;
    const f1 = (startTime - min) / duration;
    const f2 = (endTime - startTime) / duration;
    const f3 = (max - endTime) / duration;
    const showTextOnLeft = f1 > 0.2;
    const showTextOnRight = !showTextOnLeft && f3 > 0.2;
    const displaySelfDuration = mkDurationStr(selfDuration / 1000);

    item.title = (
      <div className="wrapper">
        <Tooltip title={item?.tags?.service_name}>
          <div className="left" style={{ width: 200 - 24 * depth }}>
            {item?.tags?.service_name}
          </div>
        </Tooltip>
        <div className="right text-gray" onClick={() => props.getSpanDetailContent({ span: item, visible: true })}>
          <div style={{ flex: f1 }} className="text-right text-xs self-center">
            {showTextOnLeft && displaySelfDuration}
          </div>
          <Tooltip title={spanTimeInfo(totalDuration, selfDuration)}>
            <div style={{ flex: f2, background: bg[depth % 5] }} className="rounded-sm mx-1" />
          </Tooltip>
          <div style={{ flex: f3 }} className="self-center text-left text-xs">
            {showTextOnRight && displaySelfDuration}
          </div>
        </div>
      </div>
    );
    if (item.children) {
      item.children = item.children.map((x) => format(x, depth + 1));
    }
    return item;
  }

  const onExpand = (keys: string[]) => {
    setExpandedKeys(keys);
  };

  function foo(data) {
    for (let i = 0; i < data.length; i++) {
      data[i] = format(data[i], 0);
    }

    return data;
  }

  const bar = foo(roots);

  return (
    <>
      <TraceDetailInfo dataSource={dataSource} />
      <div>
        <Button className="mr-2 text-primary" onClick={() => setExpandedKeys(allKeys)}>
          全部展开
        </Button>
        <Button className="text-primary" onClick={() => setExpandedKeys([])}>
          全部收起
        </Button>
      </div>
      <div>
        <TraceHeader duration={duration} />
        <div className="trace-graph">
          {bar.length > 0 && (
            <Tree
              showLine={{ showLeafIcon: false }}
              defaultExpandAll
              // switcherIcon={<DownOutlined />}
              switcherIcon={<CustomIcon type="caret-down" />}
              expandedKeys={expandedKeys}
              treeData={bar}
              onExpand={onExpand}
            />
          )}
        </div>
        <SpanDetail spanDetailContent={spanDetailContent} getSpanDetailContent={getSpanDetailContent} />
      </div>
    </>
  );
}
