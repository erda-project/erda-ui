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
import { Drawer, Tabs } from 'antd';
import i18n from 'i18n';
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import { updateSearch } from 'common/utils';
import fileTreeStore from 'common/stores/file-tree';
import { getINodeByPipelineId, getPipelineDetail } from 'application/services/build';
import PipelineForm from './form';
import PipelineBasic from './basic';
import PipelineRunDetail from 'application/pages/pipeline/run-detail';

interface IProps {
  application: { ID: number; name?: string };
}

const { TabPane } = Tabs;

const PipelineProtocol = ({ application }: IProps) => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const { updateTreeNodeDetail } = fileTreeStore;
  const { ID: applicationID } = application;
  const inParams = {
    projectID: +projectId,
    applicationID,
  };

  const [visible, setVisible] = React.useState(false);
  const [detailVisible, setDetailVisible] = React.useState(false);
  const [detail, setDetail] = React.useState<{ id: string; appId: string }>({} as { id: string; appId: string });

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
              clickRow: async (record: { id: string }) => {
                const res = await getINodeByPipelineId({ pipelineId: record.id });
                const inode = res?.data?.inode;
                updateTreeNodeDetail(res.data);
                const response = await getPipelineDetail({ pipelineID: +record.id });
                const appId = response.data.applicationID;
                inode && updateSearch({ nodeId: inode, applicationId: appId, pipelineID: record.id });
                setDetail({ id: inode, appId });
                setDetailVisible(true);
              },
            },
            props: {
              styleNames: 'h-full',
              wrapperClassName: 'flex-1',
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
        <PipelineForm onCancel={onClose} application={application} />
      </Drawer>
      <Drawer onClose={onDetailClose} visible={detailVisible} width="80%" destroyOnClose>
        <Tabs defaultActiveKey="basic">
          <TabPane tab={i18n.t('basic information')} key="basic">
            <PipelineBasic nodeId={detail.id} appId={detail.appId} />
          </TabPane>
          <TabPane tab={i18n.t('execute detail')} key="2">
            <PipelineRunDetail deployAuth={{ hasAuth: false }} isMobileInit={false} />
          </TabPane>
        </Tabs>
      </Drawer>
    </>
  );
};

export default PipelineProtocol;
