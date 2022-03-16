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
import { Drawer, Tabs, Modal, Form, message } from 'antd';
import { get, isEmpty } from 'lodash';
import i18n from 'i18n';
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import projectStore from 'project/stores/project';
import { updateSearch } from 'common/utils';
import fileTreeStore from 'project/stores/file-tree';
import { EmptyHolder, RenderFormItem, ErdaAlert } from 'common';
import { getINodeByPipelineId } from 'application/services/build';
import PipelineForm from './form';
import PipelineBasic from './basic';
import PipelineRunDetail from 'application/pages/pipeline/run-detail';
import appStore from 'application/stores/application';
import { getAllBranch, editPipelineName } from 'project/services/pipeline';
import { decode } from 'js-base64';

interface IProps {
  application: { ID: number; name?: string };
  getApps: () => void;
  setApp: ({ ID }: { ID: number }) => void;
}

const { TabPane } = Tabs;

const PipelineProtocol = ({ application, getApps, setApp }: IProps) => {
  const [form] = Form.useForm();
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const { name: projectName } = projectStore.useStore((s) => s.info);
  const { updateTreeNodeDetail } = fileTreeStore;
  const { updateAppDetail } = appStore.reducers;
  const { ID: applicationID } = application;
  const inParams = {
    projectId,
    appId: `${applicationID}`,
  };

  const [visible, setVisible] = React.useState(false);
  const [detailVisible, setDetailVisible] = React.useState(false);
  const [editVisible, setEditVisible] = React.useState(false);
  const [editData, setEditData] = React.useState<{ id: string; name: string }>({});

  const [detail, setDetail] = React.useState<
    Partial<{ id: string; appId: string; pipelineId: string; branchExist: boolean }>
  >({});

  const reloadRef = React.useRef<{ reload: () => void }>(null);

  React.useEffect(() => {
    reloadRef.current?.reload();
  }, [applicationID]);

  const onClose = React.useCallback(() => {
    setVisible(false);
  }, []);

  const onDetailClose = React.useCallback(() => {
    setDetailVisible(false);
    setDetail({});
  }, []);

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
          const { component, operationData, operation } = event || {};
          if (component === 'pipelineTable') {
            const id = get(operationData, 'clientData.dataRef.id');
            if (['run', 'cancelRun', 'batchRun'].includes(id)) {
              getApps();
            }
          } else if (component === 'customFilter') {
            const app = get(operationData, 'clientData.values.app');
            if (operation === 'filter' && applicationID !== 0 && isEmpty(app)) {
              setApp({ ID: 0 });
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
            },
          },
          pipelineTable: {
            op: {
              clickRow: async (record: {
                operations: { click: { serverData: { pipelineID: string; inode: string; appName: string } } };
              }) => {
                setDetailVisible(true);
                const { operations } = record;
                const serverData = get(operations, 'click.serverData');
                const { pipelineID: pipelineId, inode, appName } = serverData;
                if (inode) {
                  const path = decode(inode).split('/');
                  path.pop();
                  const appId = path[1];
                  const branchName = path.join('/').split('tree/')[1].split('/.dice')[0].split('/.erda')[0]; // such as '1/12/tree/feature/0.17.x-treeOrder/.dice', take the 'feature/0.17.x-treeOrder' of it
                  const res = await getAllBranch.fetch({ appID: +appId });
                  let branchExist = false;
                  if (res.data) {
                    const branch = res.data.find((item: { name: string }) => item.name === branchName);
                    branch && (branchExist = true);
                  }
                  updateSearch({ nodeId: inode, applicationId: appId, pipelineID: pipelineId });
                  setDetail({ id: inode, appId, pipelineId, branchExist });
                  updateAppDetail({ id: appId, gitRepoAbbrev: `${projectName}/${appName}` });

                  if (pipelineId && branchExist) {
                    const res = await getINodeByPipelineId({ pipelineId });
                    updateTreeNodeDetail(res.data);
                  }
                }
              },
              operations: {
                updateName: (
                  _op,
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
                setVisible(true);
              },
            },
          },
        }}
      />
      <Drawer
        onClose={onClose}
        visible={visible}
        width="80%"
        bodyStyle={{ padding: 0 }}
        destroyOnClose
        closable={false}
      >
        <PipelineForm
          onCancel={onClose}
          application={application}
          onOk={() => {
            onClose();
            reloadRef.current?.reload();
            getApps();
          }}
        />
      </Drawer>
      <Drawer onClose={onDetailClose} visible={detailVisible} width="80%" destroyOnClose>
        <Tabs defaultActiveKey="basic">
          {detail.branchExist ? (
            <TabPane tab={i18n.t('basic information')} key="basic">
              <PipelineBasic nodeId={detail.id} appId={detail.appId} />
            </TabPane>
          ) : null}

          {detail.pipelineId ? (
            <TabPane tab={i18n.t('execute detail')} key="2">
              <PipelineRunDetail deployAuth={{ hasAuth: false }} isMobileInit={false} />
            </TabPane>
          ) : null}
        </Tabs>
        {!detail.branchExist && !detail.pipelineId ? <EmptyHolder /> : null}
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
              placeholder: i18n.t('please enter {name}', { name: i18n.t('name') }),
            }}
          />
        </Form>
      </Modal>
    </>
  );
};

export default PipelineProtocol;
