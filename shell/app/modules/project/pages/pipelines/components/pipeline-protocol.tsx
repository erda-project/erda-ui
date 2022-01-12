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
import DiceConfigPage from 'app/config-page';
import routeInfoStore from 'core/stores/route';
import PipelineForm from './form';
import PipelineBasic from './basic';

interface IProps {
  application: { ID: number };
}

const PipelineProtocol = ({ application }: IProps) => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
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
        scenarioKey="project-pipeline-manage"
        scenarioType="project-release-manage"
        showLoading
        inParams={inParams}
        ref={reloadRef}
        customProps={{
          myPage: {
            props: {
              fullHeight: true,
            },
          },
          PageHeader: {
            props: {
              className: 'mx-2',
            },
          },
          pipelineTable: {
            op: {
              clickRow: (record: { id: string; appId: string }) => {
                setDetail(record);
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
        <PipelineBasic nodeId={detail.id} appId={detail.appId} />
      </Drawer>
    </>
  );
};

export default PipelineProtocol;
