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
import { map, get, omit, difference, flatten } from 'lodash';
import { useUpdate } from 'common';
import { NodeType, externalKey, CHART_CONFIG, CHART_NODE_SIZE } from '../config';
import YmlChart from '../chart/yml-chart';
import PipelineNodeDrawer from './pipeline-node-drawer';

export interface IPurePipelineYmlEditorProps{
  chartData: any[][];
  editing: boolean;
  nameKey?: string;
  onDeleteData:(arg: any) => void;
  onAddData: (arg: any) => void;
}

const PurePipelineYmlEditor = (props: IPurePipelineYmlEditorProps) => {
  const { chartData, editing, onDeleteData, onAddData, nameKey = 'alias' } = props;
  const [{ displayData, editData, dataKey, chosenNode, isCreate, drawerVis }, updater, update] = useUpdate({
    displayData: resetData([], editing) as any[][],
    editData: [],
    dataKey: 1,
    chosenNode: null as null | IStageTask,
    isCreate: false,
    drawerVis: false,
  });

  React.useEffect(() => {
    updater.editData(chartData);
  }, [updater, chartData]);

  React.useEffect(() => {
    update(prev => ({
      displayData: resetData(editData, editing),
      dataKey: prev.dataKey + 1,
    }));
  }, [editData, editing, update]);

  const onClickNode = (nodeData: any) => {
    const { [externalKey]: externalData } = nodeData;
    update({
      isCreate: externalData.nodeType === NodeType.addRow || externalData.nodeType === NodeType.addNode,
      chosenNode: nodeData,
      drawerVis: true,
    });
  };

  const onDeleteNode = (nodeData: any) => {
    onDeleteData(nodeData);
  };

  const closeDrawer = () => {
    update({
      chosenNode: null,
      drawerVis: false,
    });
  };

  const onSubmit = (newData: any) => {
    onAddData({
      node: chosenNode,
      data: newData,
    });
    closeDrawer();
  };

  const chartConfig = {
    NODE: CHART_NODE_SIZE,
    // 编辑chart时，节点层之间新加插入节点的节点，故上下间距不一样
    MARGIN: editing ? CHART_CONFIG.MARGIN.EDITING : CHART_CONFIG.MARGIN.NORMAL,
  };

  const curNodeData = React.useMemo(() => {
    return chosenNode ? omit(chosenNode, externalKey) : chosenNode;
  }, [chosenNode]);
  const allAlias = map(flatten(editData || []), nameKey);
  // 用于排除新节点的别名同其他节点一致
  const otherTaskAlias = drawerVis ? difference(allAlias, [get(chosenNode, nameKey)]) : [];

  return (
    <>
      <YmlChart
        data={displayData}
        editing={editing}
        chartConfig={chartConfig}
        key={dataKey}
        onClickNode={onClickNode}
        onDeleteNode={onDeleteNode}
      />
      <PipelineNodeDrawer
        visible={drawerVis}
        isCreate={isCreate}
        closeDrawer={closeDrawer}
        nodeData={curNodeData as IStageTask}
        editing={editing}
        otherTaskAlias={otherTaskAlias as string[]}
        onSubmit={onSubmit}
      />
    </>
  );
};

export default PurePipelineYmlEditor;

// 非编辑状态下: 插入开始节点，后面数据不变
// 编辑状态下：插入开始节点、层与层之间插入添加行节点
export const resetData = (data: any[][] = [], isEditing = false) => {
  const reData = [
    [{ [externalKey]: { nodeType: NodeType.startNode } }], // 插入开始节点
  ] as any[][];
  if (data.length === 0) {
    isEditing && reData.push([{ [externalKey]: { nodeType: NodeType.addRow, insertPos: 0 } }]); // 中间追加添加行
  } else if (isEditing) {
    reData.push([{ [externalKey]: { nodeType: NodeType.addRow, insertX: 0 } }]); // 中间追加添加行
    map(data, (item, index) => {
      reData.push(map(item, (subItem, subIndex) => ({
        ...subItem,
        [externalKey]: { nodeType: 'pipeline', name: subItem.alias, xIndex: index, yIndex: subIndex },
      })));
      reData.push([{ [externalKey]: { nodeType: NodeType.addRow, insertPos: index + 1 } }]); // 末尾追加添加行
    });
  } else {
    map(data, (item, index) => {
      reData.push(map(item, (subItem, subIndex) => ({
        ...subItem,
        [externalKey]: { nodeType: 'pipeline', name: subItem.alias, xIndex: index, yIndex: subIndex },
      })));
    });
  }
  return reData;
};
