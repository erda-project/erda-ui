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
import { Popover } from 'antd';
import { YmlChart } from 'yml-chart/chart';
import { externalKey, NodeType, NodeEleMap } from 'yml-chart/config';
import { map } from 'lodash';
import { useUpdate } from 'common/use-hooks';
import PipelineNode from './pipeline-node';
import i18n from 'i18n';

interface IProps {
  changeType: string;
  data: PIPELINE.IPipelineDetail;
  onClickNode: (node: BUILD.PipelineNode, mark: string) => void;
}

const notUpdateChanges = ['flow', 'stage'];
const CHART_NODE_SIZE = {
  pipeline: {
    WIDTH: 280,
    HEIGHT: 74,
  },
};

const { startNode: StartNode, endNode: EndNode } = NodeEleMap;

export const AppPipelineChart = (props: IProps) => {
  const { data, onClickNode, changeType } = props;
  const [{ displayData, stagesData, dataKey }, updater, update] = useUpdate({
    displayData: resetData({}) as any[][],
    stagesData: [],
    dataKey: 1,
  });

  React.useEffect(() => {
    if (notUpdateChanges.includes(changeType)) {
      return;
    }
    const { pipelineStages = [], pipelineTaskActionDetails = {} } = data || {};
    const stageTask = [] as PIPELINE.ITask[][];
    map(pipelineStages, ({ pipelineTasks }) => {
      stageTask.push(
        map(pipelineTasks, (item) => {
          const node = { ...item } as any;
          if (pipelineTaskActionDetails[node.type]) {
            node.displayName = pipelineTaskActionDetails[node.type].displayName;
            node.logoUrl = pipelineTaskActionDetails[node.type].logoUrl;
          }
          node.isType = function isType(type: string, isPrefixMatch?: boolean) {
            const isEqualType = type === node.type;
            return isPrefixMatch ? (node.type && node.type.startsWith(`${type}-`)) || isEqualType : isEqualType;
          };
          node.findInMeta = function findInMeta(fn: any) {
            if (!node.result || node.result.metadata == null) {
              return null;
            }
            return node.result.metadata.find(fn);
          };
          return node;
        }),
      );
    });

    update({
      stagesData: stageTask,
    });
  }, [update, data, changeType]);

  const getLastRunParams = () => {
    const { runParams } = data || {};

    const res: Obj = {};
    if (runParams?.length) {
      runParams.forEach((item) => {
        res[item.name] = item.value;
      });
    }
    return res;
  };

  React.useEffect(() => {
    update((prev) => ({
      displayData: resetData({ stagesData }),
      dataKey: prev.dataKey + 1,
    }));
  }, [stagesData, update]);

  const chartConfig = {
    NODE: CHART_NODE_SIZE,
  };

  return (
    <YmlChart
      chartId="app-pipeline"
      data={displayData}
      border
      chartConfig={chartConfig}
      key={`pipeline-${dataKey}`}
      onClickNode={onClickNode}
      external={{
        nodeEleMap: {
          pipeline: PipelineNode,
          startNode: () => {
            const inParams = getLastRunParams();
            const inKeys = Object.keys(inParams);
            return (
              <StartNode
                text={
                  <Popover
                    placement="right"
                    content={
                      <div className="">
                        <h4>{i18n.t('dop:Input')}</h4>
                        {inKeys.map((item) => (
                          <div key={item}>{`${item} = ${JSON.stringify(inParams[item])}`}</div>
                        ))}
                        {!inKeys.length ? <div>{i18n.t('None')}</div> : null}
                      </div>
                    }
                  >
                    <div className="w-full text-center">{i18n.t('dop:Input')}</div>
                  </Popover>
                }
              />
            );
          },
          endNode: () => <EndNode disabled />,
        },
      }}
    />
  );
};

export default AppPipelineChart;

interface IResetObj {
  stagesData?: any[][];
  inParamsData?: PIPELINE.IPipelineInParams[];
  outParamsData?: PIPELINE.IPipelineOutParams[];
}
export const resetData = (data: IResetObj) => {
  const { stagesData = [], inParamsData = [], outParamsData = [] } = data || {};
  const reData = [[{ data: inParamsData, [externalKey]: { nodeType: NodeType.startNode } }]] as any[][];
  map(stagesData, (item, index) => {
    reData.push(
      map(item, (subItem, subIndex) => ({
        ...subItem,
        [externalKey]: { nodeType: 'pipeline', name: subItem.alias, xIndex: index, yIndex: subIndex },
      })),
    );
  });
  reData.push([{ data: outParamsData, [externalKey]: { nodeType: NodeType.endNode } }]);

  return reData;
};
