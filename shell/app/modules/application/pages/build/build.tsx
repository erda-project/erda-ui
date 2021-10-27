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
import { Button, List, Select, Spin, Tooltip } from 'antd';
import BuildDetail from 'application/pages/build-detail';
import classnames from 'classnames';
import { get, toNumber, isEmpty, pick, isEqual, isEqualWith } from 'lodash';
import { Icon as CustomIcon, IF } from 'common';
import { fromNow } from 'common/utils';
import { SplitPage } from 'app/layout/common';
import i18n from 'i18n';
import buildStore from 'application/stores/build';
import routeInfoStore from 'core/stores/route';
import { useLoading } from 'core/stores/loading';
import { useUpdateEffect, useUnmount } from 'react-use';

import './build.scss';

const { Option } = Select;

const statusMap = [
  // { status: 'Initializing', msg: '初始化中' },
  { status: 'Analyzed', msg: i18n.t('analysis completed'), colorClass: 'darkgray' },
  { status: 'AnalyzeFailed', msg: i18n.t('analysis failed'), colorClass: 'red' },
  { status: 'WaitCron', msg: i18n.t('cron has started, waiting for execution'), colorClass: 'blue' },
  { status: 'StopCron', msg: i18n.t('cron has stopped'), colorClass: 'yellow' },
  { status: 'Born', msg: i18n.t('pending execution'), colorClass: 'darkgray', jumping: true },
  { status: 'Mark', msg: i18n.t('pending execution'), colorClass: 'darkgray', jumping: true },
  { status: 'Created', msg: i18n.t('established successfully'), colorClass: 'darkgray', jumping: true },
  { status: 'Queue', msg: i18n.t('queuing for resources'), colorClass: 'blue' },
  { status: 'Running', msg: i18n.t('running'), colorClass: 'blue', jumping: true },
  // { status: 'Success' 成功 },
  { status: 'Failed', msg: i18n.t('failed'), colorClass: 'red' },
  { status: 'Timeout', msg: i18n.t('timeout'), colorClass: 'red' },
  { status: 'StopByUser', msg: i18n.t('stop by user'), colorClass: 'red' },
  { status: 'NoNeedBySystem', msg: i18n.t('no need to execute'), colorClass: 'red' },
  { status: 'CreateError', msg: i18n.t('establish error'), colorClass: 'red' },
  { status: 'StartError', msg: i18n.t('startup error'), colorClass: 'red' },
  { status: 'Error', msg: i18n.t('error'), colorClass: 'red' },
  { status: 'DBError', msg: i18n.t('DB error'), colorClass: 'red' },
  { status: 'Unknown', msg: i18n.t('unknown'), colorClass: 'red' },
  { status: 'LostConn', msg: i18n.t('still unable to connect after trying again'), colorClass: 'red' },
  { status: 'CancelByRemote', msg: i18n.t('stop by system'), colorClass: 'red' },
];
interface IProps {
  setup: { type: string; addTitle: string; categoryTitle: string; iconType: string };
  goToDetailLink: Function;
  showModal: (event: React.MouseEvent<HTMLElement, MouseEvent>) => void;
  renderCreateModal: () => any;
}

interface IState {
  chosenCategory: string; // selected branch/workflow
  activeItem: BUILD.IActiveItem | null; // active item in combo pipeline list
  pipelines: BUILD.IComboPipeline[]; // comboPipelines filter by selected branch/workflow
  categoryOptions: Array<{ value: string; label: string }>; // remove duplicate item of comboPipelines
}

const disableStatus = ['Initializing'];

const extractData = (data: any) => pick(data, ['source', 'branch', 'ymlName', 'workspace']);

const initialState: IState = {
  chosenCategory: '',
  activeItem: null,
  pipelines: [],
  categoryOptions: [],
};

export const Build = (props: IProps) => {
  const [pipelineDetail, comboPipelines] = buildStore.useStore((s) => [s.pipelineDetail, s.comboPipelines]);
  const { getPipelineDetail, getComboPipelines, getExecuteRecords } = buildStore.effects;
  const { clearComboPipelines, clearPipelineDetail } = buildStore.reducers;
  const params = routeInfoStore.useStore((s) => s.params);
  const [getComboPipelinesLoading, addPipelineLoading, batchCreateTaskLoading] = useLoading(buildStore, [
    'getComboPipelines',
    'addPipeline',
    'batchCreateTask',
  ]);
  const {
    setup: { categoryTitle, type, iconType, addTitle },
    goToDetailLink,
    renderCreateModal,
    showModal,
  } = props;
  const keyProp = type === 'dataTask' ? 'ymlName' : 'branch';

  const reducer = (state: IState, action: { type: string; data: any }): IState => {
    switch (action.type) {
      case 'changeCategory': {
        let filteredPipelines = comboPipelines;
        if (action.data) {
          filteredPipelines = comboPipelines.filter((data) => {
            const { source, ymlName } = data;
            const keyValue = data[keyProp];
            return `${keyValue}-${source}-${ymlName}` === action.data;
          });
        }
        return {
          ...state,
          chosenCategory: action.data,
          pipelines: filteredPipelines,
          activeItem: extractData(filteredPipelines[0]),
        };
      }
      case 'comboPipelinesUpdate': {
        return {
          ...state,
          pipelines: comboPipelines,
          categoryOptions: comboPipelines.map((data: any) => {
            const { source, ymlName } = data;
            const keyValue = data[keyProp];
            return {
              label: `${keyValue}${
                source !== 'dice'
                  ? source === 'qa'
                    ? `（${i18n.t('dop:code quality analysis')}: ${ymlName}）`
                    : `（${source}: ${ymlName}）`
                  : `（${ymlName}）`
              }`,
              value: `${keyValue}-${source}-${ymlName}`,
            };
          }),
          activeItem: params.pipelineID ? state.activeItem : extractData(comboPipelines[0]),
        };
      }
      case 'switchPipeline': {
        const { activeItem: newActiveItem } = action.data;
        if (!newActiveItem || isEqual(state.activeItem, newActiveItem)) {
          return state;
        }
        return { ...state, activeItem: newActiveItem };
      }
      default:
        return state;
    }
  };

  const [states, dispatch] = React.useReducer(reducer, initialState);
  const { chosenCategory, activeItem, pipelines, categoryOptions } = states;

  useUnmount(() => {
    clearComboPipelines();
    clearPipelineDetail();
  });

  React.useEffect(() => {
    getComboPipelines();
  }, [getComboPipelines]);

  React.useEffect(() => {
    const { pipelineID } = params;
    if (pipelineID) {
      const id = toNumber(pipelineID);
      getPipelineDetail({ pipelineID: id }).then((res) => {
        if (res) {
          const detailType = { ...extractData(res), workspace: res.extra.diceWorkspace };
          if (!isEqual(activeItem, detailType)) {
            // when add new for different branch / refresh
            dispatch({ type: 'switchPipeline', data: { activeItem: detailType } });
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getPipelineDetail, params]); // when switch pipeline or create new

  const isTargetComboPipeline = React.useCallback(
    ({ branch, pagingYmlNames, source, workspace }: any) => {
      return (
        activeItem &&
        isEqualWith(
          { branch, source, workspace },
          activeItem,
          (v1, v2) => v1.source === v2.source && v1.branch === v2.branch && v1.workspace === v2.workspace,
        ) &&
        pagingYmlNames.includes(activeItem.ymlName)
      );
    },
    [activeItem],
  );

  const getExecuteRecordsByPageNo = React.useCallback(
    ({ pageNo }: { pageNo: number }) => {
      if (isEmpty(comboPipelines)) {
        return;
      }
      const targetCombo = comboPipelines.find(isTargetComboPipeline);
      if (targetCombo && activeItem) {
        getExecuteRecords({ ...activeItem, pagingYmlNames: targetCombo.pagingYmlNames, pageNo });
      }
    },
    [activeItem, comboPipelines, getExecuteRecords, isTargetComboPipeline],
  );

  useUpdateEffect(() => {
    activeItem && !isEmpty(comboPipelines) && getExecuteRecordsByPageNo({ pageNo: 1 });
  }, [activeItem, comboPipelines]);

  useUpdateEffect(() => {
    if (activeItem && !isEqual(extractData(pipelineDetail), activeItem)) {
      const target = pipelines.find((p) => isEqual(extractData(p), activeItem));
      target && goToDetailLink({ pipelineID: target.pipelineID }, isEmpty(pipelineDetail));
    }
  }, [activeItem]);

  useUpdateEffect(() => {
    // update pipeline list and select source according to comboPipelines
    comboPipelines && dispatch({ type: 'comboPipelinesUpdate', data: null });
  }, [comboPipelines, dispatch]);

  const renderBuildStatus = ({
    status: inputStatus,
    cancelUser,
  }: {
    status: string;
    cancelUser: { name?: string };
  }) => {
    const definedStatus = statusMap.find((s) => s.status === inputStatus);
    if (definedStatus) {
      const { jumping, colorClass } = definedStatus;
      let { msg } = definedStatus;
      if (inputStatus === 'StopByUser') {
        const { name = '' } = cancelUser || {};
        msg = i18n.t('user {name} canceled', { name });
      }
      const statusStyle = `flow-${colorClass} ${jumping ? 'jumping' : ''}`;
      return (
        <Tooltip title={msg}>
          <div className={`${statusStyle} status-icon`} />
        </Tooltip>
      );
    }
    return null;
  };

  const renderList = () => {
    return (
      <List
        itemLayout="horizontal"
        dataSource={pipelines}
        renderItem={({
          pipelineID,
          commit,
          status,
          cancelUser,
          timeCreated,
          branch,
          ymlName,
          pagingYmlNames,
          source,
          triggerMode,
          workspace,
        }: BUILD.IComboPipeline) => {
          const limitedCommitId = commit ? commit.slice(0, 6) : '';
          const isDisable = disableStatus.includes(status);
          const liProps: any = {};
          const isBigData = source === 'bigdata';
          const displayName = isBigData ? ymlName.slice(ymlName.lastIndexOf('/') + 1) : branch;
          const toolTipName = isBigData ? ymlName : branch;
          if (!isDisable) {
            liProps.onClick = () =>
              dispatch({ type: 'switchPipeline', data: { activeItem: { branch, source, ymlName, workspace } } });
          }

          const cls = classnames({
            'build-item': true,
            'build-item-yml': !isBigData,
            disable: isDisable,
            active: !isDisable && isTargetComboPipeline({ branch, source, pagingYmlNames, workspace }),
          });
          return (
            <div key={pipelineID} className={cls} {...liProps}>
              <div className="list-item flex justify-between items-center">
                <div className="title flex justify-between items-center">
                  <Tooltip title={toolTipName} overlayClassName="commit-tip">
                    <span className="branch-name font-medium nowrap">
                      <CustomIcon type={iconType} />
                      <span className="nowrap">{displayName}</span>
                    </span>
                  </Tooltip>
                  {!isBigData && renderBuildStatus({ status, cancelUser })}
                </div>
                <IF check={!isBigData}>
                  <div className="yml-name nowrap flex justify-between items-center">
                    <Tooltip title={ymlName} overlayClassName="commit-tip">
                      <span className="name nowrap">
                        <CustomIcon type="wj" />
                        <span className="nowrap">{ymlName}</span>
                      </span>
                    </Tooltip>
                    <div className="workspace">{workspace}</div>
                  </div>
                </IF>
                <div className="item-footer">
                  {!isBigData && (
                    <span>
                      <CustomIcon type="commit" />
                      <span>{limitedCommitId || ''}</span>
                    </span>
                  )}
                  <span className="time">
                    {fromNow(timeCreated)}
                    {triggerMode === 'cron' && <CustomIcon type="clock" />}
                  </span>
                  {isBigData && renderBuildStatus({ status, cancelUser })}
                </div>
              </div>
            </div>
          );
        }}
      />
    );
  };

  const renderLeftSection = () => {
    return (
      <Spin spinning={getComboPipelinesLoading || addPipelineLoading || batchCreateTaskLoading}>
        <div className="build-list-wrap">
          <div className="mr-8 mb-3 ml-3">
            <Select
              showSearch
              className="w-full"
              optionFilterProp="children"
              value={chosenCategory}
              onChange={(e: any) => dispatch({ type: 'changeCategory', data: e })}
              dropdownClassName="branch-select"
              filterOption={(input: any, option: any) => {
                return get(option, 'props.title').toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              <Option value="" title="">
                {categoryTitle}
              </Option>
              {categoryOptions.map(({ label, value }: { label: string; value: string }) =>
                type === 'dataTask' ? (
                  <Option key={value} title={label} value={value}>
                    {label.slice(label.lastIndexOf('/') + 1)}
                  </Option>
                ) : (
                  <Option key={value} title={label} value={value}>
                    {label}
                  </Option>
                ),
              )}
            </Select>
          </div>
          <div className="build-list">{renderList()}</div>
        </div>
      </Spin>
    );
  };

  const getList = (pipelineID: number, buildDetailItem: BUILD.IActiveItem, isRerun: boolean) => {
    getComboPipelines();
    if (isEqual(activeItem, buildDetailItem)) {
      if (isRerun) {
        goToDetailLink({ pipelineID });
      } else {
        getPipelineDetail({ pipelineID });
      }
      getExecuteRecordsByPageNo({ pageNo: 1 });
    }
  };

  const renderRightSection = () => (
    <BuildDetail
      getPipelines={getList}
      activeItem={activeItem}
      goToDetailLink={goToDetailLink}
      getExecuteRecordsByPageNo={getExecuteRecordsByPageNo}
    />
  );

  return (
    <SplitPage className="runtime-build-main">
      <SplitPage.Left width={300} className="pr-0 spin-h-full">
        {renderLeftSection()}
      </SplitPage.Left>
      <SplitPage.Right pl32>{renderRightSection()}</SplitPage.Right>
      <div className="top-button-group">
        <Button type="primary" onClick={showModal}>
          {addTitle}
        </Button>
      </div>
      {renderCreateModal()}
    </SplitPage>
  );
};
