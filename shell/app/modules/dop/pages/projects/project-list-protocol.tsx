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
import DiceConfigPage, { useMock } from 'config-page/index';
import { useUpdate } from 'common/use-hooks';
import ApplyUnblockModal, { IMetaData } from 'dop/pages/projects/apply-unblock-modal';
import { ErdaIcon } from 'common';

const ProjectList = () => {
  const [state, updater, update] = useUpdate({
    visible: false,
    metaData: {} as IMetaData,
  });
  const reloadRef = React.useRef<{ reload: () => void }>({} as { reload: () => void });

  const closeModal = () => {
    update({
      visible: false,
      metaData: {} as IMetaData,
    });
  };

  const reloadProjectsList = () => {
    if (reloadRef.current && reloadRef.current.reload) {
      reloadRef.current.reload();
    }
  };

  const handleShowApplyModal = ({ name, id }: PROJECT.Detail) => {
    update({
      visible: true,
      metaData: {
        projectId: id,
        projectName: name,
      },
    });
  };
  return (
    <>
      <DiceConfigPage
        scenarioType="project-list-all"
        scenarioKey="project-list-all"
        ref={reloadRef}
        customProps={{
          list: {
            props: {
              wrapperClassName: 'bg-white',
              defaultLogo: <ErdaIcon type="morenxiangmu" size={28} />,
            },
            op: {
              clickItem: (op: CP_COMMON.Operation, data: { record: { id: number; title: string } }) => {
                if (op.id === 'applyDeploy') {
                  const { record } = data;
                  const pId = record.id;
                  const pName = record.title;
                  if (pId && pName) {
                    handleShowApplyModal({ name: pName, id: pId } as PROJECT.Detail);
                  }
                }
              },
            },
          },
          emptyContainer: {
            props: {
              className: 'bg-white flex-all-center py-4',
            },
          },
          emptyPublicContainer: {
            props: {
              className: 'bg-white flex-all-center py-4',
            },
          },
          alert: {
            props: {
              className: 'mb-2',
            },
          },
        }}
      />
      <ApplyUnblockModal
        visible={state.visible}
        metaData={state.metaData as IMetaData}
        onCancel={closeModal}
        afterSubmit={reloadProjectsList}
      />
    </>
  );
};

export default ProjectList;
