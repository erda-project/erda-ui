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
import { Drawer, Modal, Form, message } from 'antd';
import { get } from 'lodash';
import i18n from 'i18n';
import DiceConfigPage from 'app/config-page';
import { updateSearch } from 'common/utils';
import projectStore from 'project/stores/project';
import { RenderFormItem } from 'common';
import { getAllBranch, editPipelineName } from 'project/services/pipeline';
import PipelineDetail from 'project/common/components/pipeline-new/detail';
import { decode } from 'js-base64';

interface IProps {
  pipelineCategory: string;
  onAddPipeline: () => void;
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
    const [form] = Form.useForm();
    const { name: projectName } = projectStore.useStore((s) => s.info);
    const inParams = {
      projectId,
      appId,
      pipelineCategoryKey: pipelineCategory === 'all' ? undefined : pipelineCategory,
    };

    const [detailVisible, setDetailVisible] = React.useState(false);
    const [editVisible, setEditVisible] = React.useState(false);
    const [newPipelineUsed, setNewPipelineUsed] = React.useState(false);
    const [editData, setEditData] = React.useState<{ id: string; name: string }>({} as { id: string; name: string });
    const [detail, setDetail] = React.useState<Detail | null>(null);

    const reloadRef = React.useRef<{ reload: () => void }>(null);

    React.useEffect(() => {
      reloadRef.current?.reload();
    }, [pipelineCategory]);

    React.useImperativeHandle(ref, () => ({
      reload: () => {
        reloadRef.current?.reload();
      },
    }));

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
                  updateName: (
                    _: Obj,
                    record: {
                      id: string;
                      pipeline: { data: { pipelineName: { data: { text: string } } } };
                    },
                  ) => {
                    const { id, pipeline } = record || {};
                    const { data } = pipeline || {};
                    const { pipelineName } = data || {};
                    setEditData({ id, name: pipelineName.data.text });
                    form.setFieldsValue({ name: pipelineName.data.text });
                    setEditVisible(true);
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
          title={`${i18n.t('pipeline')} ${detail?.pipelineName || ''}`}
          onClose={onDetailClose}
          visible={detailVisible}
          width="80%"
          destroyOnClose
        >
          {detail ? <PipelineDetail {...detail} setNewPipelineUsed={setNewPipelineUsed} /> : null}
        </Drawer>
        <Modal
          title={i18n.t('edit {name}', { name: i18n.t('pipeline') })}
          visible={editVisible}
          onCancel={() => setEditVisible(false)}
          onOk={() => {
            form.validateFields().then(async (value) => {
              const { id } = editData;
              editPipelineName({ id, projectID: projectId, ...value }).then(() => {
                message.success(i18n.t('edited successfully'));
                reloadRef.current?.reload();
                setEditVisible(false);
              });
            });
          }}
        >
          <Form form={form}>
            <RenderFormItem
              name={'name'}
              type={'input'}
              rules={[
                { required: true, message: i18n.t('please enter {name}', { name: i18n.t('pipeline') }) },
                { max: 30, message: i18n.t('dop:no more than 30 characters') },
                {
                  pattern: /^[\u4e00-\u9fa5A-Za-z0-9._-]+$/,
                  message: i18n.t('dop:Must be composed of Chinese, letters, numbers, underscores, hyphens and dots.'),
                },
              ]}
              itemProps={{
                placeholder: i18n.t('please enter {name}', { name: i18n.t('Name') }),
              }}
            />
          </Form>
        </Modal>
      </>
    );
  },
);

export default PipelineProtocol;
