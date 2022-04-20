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
import { Drawer } from 'antd';
import { get } from 'lodash';
import i18n from 'i18n';
import DiceConfigPage from 'app/config-page';
import { updateSearch } from 'common/utils';
import projectStore from 'project/stores/project';
import { getAllBranch, runPipeline } from 'project/services/pipeline';
import PipelineDetail from 'project/common/components/pipeline-new/detail';
import { decode } from 'js-base64';
import { getTreeNodeDetailNew } from 'project/services/file-tree';
import InParamsForm from './detail/in-params-form';

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
  pipelineId: string;
  branchExist: boolean;
  pipelineName: string;
  projectName: string;
  appName: string;
}

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

    const [detailVisible, setDetailVisible] = React.useState(false);
    const [newPipelineUsed, setNewPipelineUsed] = React.useState(false);
    const [detail, setDetail] = React.useState<Detail | null>(null);
    const [executeRecordId, setExecuteRecordId] = React.useState('');

    const reloadRef = React.useRef<{ reload: () => void }>(null);

    const executeRef = React.useRef<{
      execute: (_ymlStr: string, extra: { pipelineID?: string; pipelineDetail?: BUILD.IPipelineDetail }) => void;
    }>(null);

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
      setDetailVisible(false);
      setDetail(null);
      if (newPipelineUsed) {
        reloadRef.current?.reload();
        setNewPipelineUsed(false);
      }
    }, [newPipelineUsed]);

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
                    // url search 'applicationId' use for action-config-form some action with member-selector
                    updateSearch({ applicationId: appId });
                    setDetail({
                      nodeId: inode,
                      appId: _appId,
                      pipelineId,
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
          title={`${i18n.t('Pipeline')} ${detail?.pipelineName || ''}`}
          onClose={onDetailClose}
          visible={detailVisible}
          width="80%"
          destroyOnClose
        >
          {detail ? <PipelineDetail {...detail} setNewPipelineUsed={setNewPipelineUsed} /> : null}
        </Drawer>
        <InParamsForm ref={executeRef} onExecute={runBuild} />
      </>
    );
  },
);

export default PipelineProtocol;
