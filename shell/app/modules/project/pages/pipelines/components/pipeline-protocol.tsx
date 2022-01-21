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
import { Drawer, Tabs, message } from 'antd';
import { get, isEmpty } from 'lodash';
import i18n from 'i18n';
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import projectStore from 'project/stores/project';
import { updateSearch } from 'common/utils';
import fileTreeStore from 'common/stores/file-tree';
import { getINodeByPipelineId } from 'application/services/build';
import PipelineForm from './form';
import PipelineBasic from './basic';
import PipelineRunDetail from 'application/pages/pipeline/run-detail';
import appStore from 'application/stores/application';

interface IProps {
  application: { ID: number; name?: string };
  getApps: () => void;
  setApp: ({ ID }: { ID: number }) => void;
}

const { TabPane } = Tabs;

const PipelineProtocol = ({ application, getApps, setApp }: IProps) => {
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
  const [detail, setDetail] = React.useState<Partial<{ id: string; appId: string; pipelineId: string }>>(
    {} as { id: string; appId: string; pipelineId: string },
  );

  const reloadRef = React.useRef<{ reload: () => void }>(null);

  React.useEffect(() => {
    reloadRef.current?.reload();
  }, [applicationID]);

  const onClose = React.useCallback(() => {
    setVisible(false);
  }, []);

  const onDetailClose = React.useCallback(() => {
    setDetailVisible(false);
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
            if (['run', 'cancelRun'].includes(id)) {
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
                const appId = inode && atob(decodeURI(inode)).split('/')[1];
                inode && updateSearch({ nodeId: inode, applicationId: appId, pipelineID: pipelineId });
                setDetail({ id: inode, appId, pipelineId });
                updateAppDetail({ id: appId, gitRepoAbbrev: `${projectName}/${appName}` });
                if (pipelineId) {
                  const res = await getINodeByPipelineId({ pipelineId });
                  updateTreeNodeDetail(res.data);
                }
              },
            },
            props: {
              styleNames: 'h-full',
              wrapperClassName: 'flex-1',
              columnsRender: {
                source: (val, record, map) => {
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
          <TabPane tab={i18n.t('basic information')} key="basic">
            <PipelineBasic nodeId={detail.id} appId={detail.appId} />
          </TabPane>
          {detail.pipelineId ? (
            <TabPane tab={i18n.t('execute detail')} key="2">
              <div className="m-3 bg-white rounded-xl p-4">
                <PipelineRunDetail deployAuth={{ hasAuth: false }} isMobileInit={false} />
              </div>
            </TabPane>
          ) : null}
        </Tabs>
      </Drawer>
    </>
  );
};

export default PipelineProtocol;
