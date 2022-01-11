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
import DiceConfigPage, { useMock } from 'app/config-page';
import { usePerm } from 'user/common';
import routeInfoStore from 'core/stores/route';
import { goTo } from 'common/utils';
import PipelineForm from './form';

interface IProps {
  applicationID?: number;
}

const PipelineProtocol = ({ applicationID }: IProps) => {
  const [{ projectId }] = routeInfoStore.useStore((s) => [s.params]);
  const inParams = {
    projectID: +projectId,
    applicationID,
  };

  const [visible, setVisible] = React.useState(false);

  const reloadRef = React.useRef<{ reload: () => void }>(null);

  React.useEffect(() => {
    reloadRef.current?.reload();
  }, [applicationID]);

  const onClose = React.useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <>
      <DiceConfigPage
        scenarioKey="release-manage"
        scenarioType="release-manage"
        showLoading
        inParams={inParams}
        ref={reloadRef}
        useMock={useMock}
        forceMock
        customProps={{
          PageHeader: {
            props: {
              className: 'mx-2',
            },
          },
          pipelineTable: {
            props: {
              onRow: (record: RELEASE.ApplicationDetail) => ({
                onClick: () => {
                  record.id && goTo(`${record.id}`);
                },
              }),
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
        <PipelineForm onCancel={onClose} />
      </Drawer>
    </>
  );
};

export default PipelineProtocol;
