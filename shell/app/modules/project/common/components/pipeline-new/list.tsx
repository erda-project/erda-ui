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
import { Drawer, Popover } from 'antd';
import { get } from 'lodash';
import i18n from 'i18n';
import { Copy, ErdaIcon, Table, Badge } from 'common';
import DiceConfigPage from 'app/config-page';
import { updateSearch, mergeSearch, secondsToTime, goTo } from 'common/utils';
import routeInfoStore from 'core/stores/route';
import projectStore from 'project/stores/project';
import { getAllBranch, runPipeline } from 'project/services/pipeline';
import PipelineDetail from 'project/common/components/pipeline-new/detail';
import { getTreeNodeDetailNew } from 'project/services/file-tree';
import InParamsForm from './detail/in-params-form';
import { encode, decode } from 'js-base64';
import { getPipelineRecord, PipelineRecord } from 'project/services/pipeline';
import { useUserMap } from 'core/stores/userMap';
import { ciStatusMap, getIsInApp } from './config';
import moment from 'moment';

interface IProps {
  pipelineCategory: string;
  onAddPipeline: (data?: { id: string; name: string; fileName: string; app: number; inode: string }) => void;
  updateCategory?: () => void;
  projectId: string;
  appId?: string;
}

interface Detail {
  nodeId: string;
  projectId: string;
  pipelineDefinitionID: string;
  appId: string;
  definitionID: string;
  pipelineId: string;
  branchExist: boolean;
  pipelineName: string;
  projectName: string;
  appName: string;
}

const parseDetailSearch = (v: string) => {
  if (v) {
    try {
      const res = JSON.parse(decode(v));
      return res;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    }
  }
  return null;
};

const getDetailId = (detail: Obj | null) => {
  if (detail) {
    try {
      const res = encode(JSON.stringify(detail));
      return res;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      return null;
    }
  }
  return '';
};

const emptyHistory = {
  total: 0,
  execHistories: [],
};
const PipelineProtocol = React.forwardRef(
  (
    { pipelineCategory, updateCategory, onAddPipeline, projectId, appId }: IProps,
    ref: React.Ref<{ reload: () => void }>,
  ) => {
    const { name: projectName } = projectStore.useStore((s) => s.info);
    const inParams = {
      projectId,
      appId,
      pipelineCategoryKey: pipelineCategory === 'all' ? undefined : pipelineCategory,
    };

    const detailId = routeInfoStore.useStore((s) => s.query.detailId);
    const initDetail = parseDetailSearch(detailId);

    const [detailVisible, setDetailVisible] = React.useState(!!initDetail);
    const [newPipelineUsed, setNewPipelineUsed] = React.useState(false);
    const [detail, setDetail] = React.useState<Detail | null>(initDetail);
    const [executeRecordId, setExecuteRecordId] = React.useState('');
    const [record, setRecord] = React.useState<{ total: number; execHistories: PipelineRecord[] }>(emptyHistory);
    const [chosenPipelineId, setChosenPipeineId] = React.useState('');

    const reloadRef = React.useRef<{ reload: () => void }>(null);

    const executeRef = React.useRef<{
      execute: (_ymlStr: string, extra: { pipelineID?: string; pipelineDetail?: BUILD.IPipelineDetail }) => void;
    }>(null);

    const userMap = useUserMap();

    React.useEffect(() => {
      reloadRef.current?.reload();
    }, [pipelineCategory]);

    React.useImperativeHandle(ref, () => ({
      reload: () => {
        reloadRef.current?.reload();
      },
    }));

    const runBuild = (_v?: { runParams: Obj<string | number> }) => {
      runPipeline({ pipelineDefinitionID: executeRecordId, projectID: +projectId, ..._v }).then(() => {
        reloadRef.current?.reload();
      });
    };

    const onDetailClose = React.useCallback(() => {
      updateSearch({
        detailId: undefined,
      });
      setDetailVisible(false);
      setRecord(emptyHistory);
      setChosenPipeineId('');
      setDetail(null);
      if (newPipelineUsed) {
        reloadRef.current?.reload();
        setNewPipelineUsed(false);
      }
    }, [newPipelineUsed]);

    const shareLink = `${location.href.split('?')[0]}?${mergeSearch({ detailId: getDetailId(detail) }, true)}`;

    const columns = [
      {
        title: i18n.t('dop:pipeline ID'),
        dataIndex: 'pipelineID',
      },
      {
        title: i18n.t('Status'),
        dataIndex: 'pipelineStatus',
        render: (status: string) => (
          <span>
            <span className="nowrap">{ciStatusMap[status].text}</span>
            <Badge className="ml-1" onlyDot status={ciStatusMap[status].status} />
          </span>
        ),
      },
      {
        title: i18n.t('dop:Time'),
        dataIndex: 'costTimeSec',
        render: (costTimeSec: number) => {
          return costTimeSec !== -1 ? secondsToTime(+costTimeSec) : '';
        },
      },
      { title: i18n.t('dop:branch'), dataIndex: 'branch' },
      {
        title: i18n.s('Trigger infor', 'dop'),
        dataIndex: 'executor',
        render: (val: string, record: PipelineRecord) => {
          const { triggerMode } = record;
          const { nick, name } = userMap[val] || {};
          const text =
            triggerMode === 'cron'
              ? i18n.s('automatic execution', 'dop')
              : `${nick || name || i18n.t('common:None')} ${i18n.s('manually execution', 'dop')}`;
          return text;
        },
      },
      {
        title: i18n.t('Trigger time'),
        dataIndex: 'timeBegin',
        render: (timeBegin: number) => (timeBegin ? moment(new Date(timeBegin)).format('YYYY/MM/DD HH:mm:ss') : '-'),
      },
    ];

    const setRowClassName = (record: PipelineRecord) => {
      return `${record.pipelineID}` !== `${chosenPipelineId}`
        ? 'cursor-pointer'
        : 'bg-default-06 font-medium cursor-pointer';
    };
    const curRecord = chosenPipelineId
      ? record?.execHistories?.find((item) => `${item.pipelineID}` === `${chosenPipelineId}`)
      : null;
    const curUser = curRecord ? userMap[curRecord.executor] : null;
    const isLatestPipeline = `${chosenPipelineId}` === `${detail?.pipelineId}`;
    const isInApp = getIsInApp();
    return (
      <>
        <DiceConfigPage
          scenarioKey="project-pipeline"
          scenarioType="project-pipeline"
          showLoading
          inParams={inParams}
          ref={reloadRef}
          operationCallBack={(reqConfig) => {
            const { event } = reqConfig;
            const { component, operationData } = event || {};
            if (component === 'pipelineTable') {
              const id = get(operationData, 'clientData.dataRef.id');
              if (['run', 'cancelRun', 'batchRun'].includes(id)) {
                updateCategory?.();
              }
            }
          }}
          customProps={{
            myPage: {
              props: {
                fullHeight: true,
              },
            },
            pageHeader: {
              props: {
                className: 'mx-2',
                isTopHead: true,
              },
            },
            pipelineTable: {
              op: {
                clickRow: async (record: {
                  id: string;
                  operations: { click: { serverData: { pipelineID: string; inode: string; appName: string } } };
                }) => {
                  setDetailVisible(true);
                  const { operations, id } = record;
                  const serverData = get(operations, 'click.serverData');
                  const { pipelineID: pipelineId, inode, appName, pipelineName } = serverData;

                  if (inode) {
                    const path = decode(inode).split('/');
                    path.pop();
                    const _appId = path[1];
                    const branchName = path.join('/').split('tree/')[1].split('/.dice')[0].split('/.erda')[0]; // such as '1/12/tree/feature/0.17.x-treeOrder/.dice', take the 'feature/0.17.x-treeOrder' of it
                    const res = await getAllBranch.fetch({ appID: +_appId });
                    let branchExist = false;
                    if (res.data) {
                      const branch = res.data.find((item: { name: string }) => item.name === branchName);
                      branch && (branchExist = true);
                    }

                    getPipelineRecord({
                      projectID: projectId,
                      pageNo: 1,
                      pageSize: 20,
                      definitionID: id,
                    }).then((res) => {
                      setRecord(res?.data || emptyHistory);
                    });
                    // url search 'applicationId' use for action-config-form some action with member-selector
                    updateSearch({ applicationId: appId });
                    setChosenPipeineId(pipelineId);
                    setDetail({
                      nodeId: inode,
                      appId: _appId,
                      pipelineId,
                      definitionID: id,
                      pipelineDefinitionID: id,
                      branchExist,
                      pipelineName,
                      projectId,
                      projectName,
                      appName,
                    });
                  }
                },
                operations: {
                  run: async (
                    op: {
                      operations: { click: { serverData: { inode: string; pipelineID: string } } };
                    },
                    record: { id: string },
                  ) => {
                    setExecuteRecordId(record.id);
                    const { inode, pipelineID } = op.operations?.click?.serverData || {};
                    if (inode) {
                      const path = decode(inode).split('/');
                      path.pop();
                      const _appId = path[1];
                      const res = await getTreeNodeDetailNew({ id: inode, scopeID: _appId, scope: 'project-app' });
                      const ymlStr = res?.data?.meta?.pipelineYml;
                      executeRef?.current?.execute(ymlStr, { pipelineID });
                    }
                  },
                  update: (
                    op: Obj,
                    record: {
                      id: string;
                      pipeline: {
                        data: { pipelineName: { data: { text: string } }; sourceFile: { data: { text: string } } };
                      };
                    },
                  ) => {
                    const { appID, inode } = op.operations.click.serverData;
                    const { id, pipeline } = record;
                    const { data } = pipeline;
                    const { pipelineName, sourceFile } = data;
                    onAddPipeline({
                      id,
                      name: pipelineName.data.text,
                      fileName: sourceFile.data.text,
                      app: appID,
                      inode,
                    });
                  },
                },
              },
              props: {
                tableProps: {
                  whiteHead: true,
                  whiteFooter: true,
                  styleNames: 'h-full',
                  wrapperClassName: 'flex-1',
                  tableKey: 'project-pipeline',
                },
                columnsRender: {
                  source: (_val: string, _record: string, map: { [key: string]: React.ReactNode }) => {
                    return (
                      <div>
                        <div className="leading-5 text-default-9">{map.applicationName}</div>
                        <div className="flex-h-center">
                          <div className="mr-1 flex-h-center text-default-4">{map.icon}</div>
                          <div className="text-default-6">{map.branch}</div>
                        </div>
                      </div>
                    );
                  },
                  pipeline: (_val: string, _record: string, map: { [key: string]: React.ReactNode }) => {
                    return (
                      <div>
                        <div className="leading-5 text-default-9">{map.pipelineName}</div>
                        <div className="text-default-6">{map.sourceFile}</div>
                      </div>
                    );
                  },
                },
              },
            },
            addPipelineBtn: {
              op: {
                click: () => {
                  onAddPipeline();
                },
              },
            },
          }}
        />

        <Drawer
          title={
            <div className="flex justify-between items-center">
              <div className="flex-h-center">
                <span>
                  {i18n.t('Pipeline')} {detail?.pipelineName || ''}
                </span>
                {detail?.pipelineId ? (
                  <>
                    <div className="w-[1px] h-[18px] bg-default-3 mx-8" />
                    <Popover
                      content={
                        <div className="w-[800px]">
                          <Table
                            pagination={false}
                            wrapperClassName="max-h-80"
                            dataSource={record.execHistories}
                            columns={columns}
                            rowKey="pipelineID"
                            scroll={{ y: 230 }}
                            rowClassName={setRowClassName}
                            onReload={() => {
                              detail?.pipelineName &&
                                getPipelineRecord({
                                  projectID: projectId,
                                  pageNo: 1,
                                  pageSize: 20,
                                  definitionID: detail.definitionID,
                                }).then((res) => {
                                  setRecord(res?.data || emptyHistory);
                                });
                            }}
                            onRow={(r: PipelineRecord) => {
                              return {
                                onClick: () => {
                                  setChosenPipeineId(`${r.pipelineID}`);
                                },
                              };
                            }}
                          />
                          {record.total > 20 ? (
                            <div className="flex justify-center mt-2 ">
                              <span
                                className="text-purple-deep cursor-pointer"
                                onClick={() => {
                                  const params = {
                                    projectId,
                                    query: {
                                      // fix with base64 RFC 4648
                                      customFilter__urlQuery: encode(`{"title":"${detail?.pipelineName}"}`)
                                        .replaceAll('/', '_')
                                        .replaceAll('+', '-'),
                                    },
                                    jumpOut: true,
                                  };
                                  if (isInApp) {
                                    goTo(goTo.pages.appPipelineRecords, { ...params, appId });
                                  } else {
                                    goTo(goTo.pages.projectPipelineRecords, params);
                                  }
                                }}
                              >
                                {i18n.s('Check more records', 'dop')}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      }
                    >
                      <div className="flex-h-center group text-sm cursor-pointer">
                        <Badge
                          showDot={false}
                          text={isLatestPipeline ? i18n.s('newest', 'dop') : i18n.s('history', 'dop')}
                          status={isLatestPipeline ? 'processing' : 'warning'}
                          className="mr-1"
                        />
                        <span className="text-default-8">{`${chosenPipelineId} - ${
                          curUser?.nick || curUser?.name || curRecord?.executor || ''
                        }`}</span>
                        <ErdaIcon
                          type="caret-down"
                          className="ml-0.5 text-default-3 group-hover:text-default-8"
                          size="14"
                        />
                      </div>
                    </Popover>
                  </>
                ) : null}
              </div>
              <div>
                <Copy selector=".copy-share-link" tipName={i18n.t('dop:link-share')} />
                <ErdaIcon
                  type="lianjie"
                  className="cursor-copy hover-active copy-share-link ml-4 text-default-6"
                  size="20"
                  data-clipboard-text={shareLink}
                />
                <ErdaIcon
                  type="guanbi"
                  className="ml-4 hover-active text-default-6"
                  size="20"
                  onClick={onDetailClose}
                />
              </div>
            </div>
          }
          onClose={onDetailClose}
          visible={detailVisible}
          closable={false}
          width="80%"
          destroyOnClose
        >
          {detail ? (
            <PipelineDetail
              key={chosenPipelineId}
              {...detail}
              pipelineId={chosenPipelineId}
              isLatestPipeline={isLatestPipeline}
              setNewPipelineUsed={setNewPipelineUsed}
            />
          ) : null}
        </Drawer>
        <InParamsForm ref={executeRef} onExecute={runBuild} />
      </>
    );
  },
);

export default PipelineProtocol;
