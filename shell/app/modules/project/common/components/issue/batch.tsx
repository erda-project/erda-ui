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

import { DropdownSelect, useUpdate, FormModal, MemberSelector } from 'common';
import i18n from 'i18n';
import React from 'react';
import issueStore from 'project/stores/issues';
import { ISSUE_TYPE, REQUIREMENT_STATE_MAP, BUG_STATE_MAP } from 'project/common/components/issue/issue-config';
import IterationSelect from 'project/common/components/issue/iteration-select';
import { map } from 'lodash';
import routeInfoStore from 'app/common/stores/route';
import { usePerm } from 'user/common';

interface IProps {
  ids: any[];
  all: boolean;
  mine: boolean;
  type: string;
  iterationID?: number;
  currentIterationIDs?: number[];
  projectID: number;
  onSubmit?: () => void;
}
export default ({ ids, all, mine, type, iterationID, currentIterationIDs, projectID, onSubmit }: IProps) => {
  const { batchUpdateIssue } = issueStore.effects;
  const { params } = routeInfoStore.getState((s) => s);

  const [state, updater] = useUpdate({
    formProps: {
      visible: false,
      title: 'update', // 为空时formModal里会提示i18n问题
      fieldsList: [],
    },
  });
  let hasAuth = false;
  const authObj = usePerm((s) => s.project);
  let stateMap = {};
  switch (type) {
    case ISSUE_TYPE.REQUIREMENT:
      stateMap = REQUIREMENT_STATE_MAP;
      hasAuth = authObj.requirement.batchOperation.pass;
      break;
    case ISSUE_TYPE.BUG:
      stateMap = BUG_STATE_MAP;
      hasAuth = authObj.bug.batchOperation.pass;
      break;

    default:
      break;
  }

  const onClick = React.useCallback(({ key }: any) => {
    switch (key) {
      case 'assign':
        updater.formProps({
          visible: true,
          title: i18n.t('update assign'),
          fieldsList: [
            {
              name: 'assignee',
              label: i18n.t('project:assignee'),
              getComp: () => <MemberSelector scopeType="project" scopeId={params.projectId} />,
            },
          ],
        });
        break;
      case 'state':
        updater.formProps({
          visible: true,
          title: i18n.t('update state'),
          fieldsList: [
            {
              label: i18n.t('common:state'),
              name: 'state',
              type: 'select',
              options: map(stateMap, (s, k) => ({ name: s.label, value: k })),
            },
          ],
        });
        break;
      case 'move':
        updater.formProps({
          visible: true,
          title: i18n.t('project:move to iteration'),
          fieldsList: [
            {
              label: i18n.t('project:iteration'),
              name: 'newIterationID',
              type: 'custom',
              getComp: () => <IterationSelect fullWidth />,
            },
          ],
        });
        break;
      default:
        break;
    }
  }, [params.projectId, stateMap, updater]);

  const handleSubmit = (values: any) => {
    batchUpdateIssue({
      ...values,
      all,
      mine,
      ids: all ? [] : ids,
      currentIterationID: iterationID,
      currentIterationIDs,
      projectID,
      newIterationID: values.newIterationID ? +values.newIterationID : undefined,
      type,
    }).then(() => {
      closeModal();
      onSubmit && onSubmit();
    });
  };

  const closeModal = () => {
    updater.formProps((prev: any) => ({ ...prev, visible: false }));
  };

  return (
    <>
      <DropdownSelect
        menuList={[
          { key: 'assign', name: i18n.t('project:update assignee') },
          { key: 'state', name: i18n.t('project:update state') },
          { key: 'move', name: i18n.t('project:move to iteration') },
        ]}
        onClickMenu={onClick}
        disabled={!hasAuth || !ids.length}
        buttonText={i18n.t('project:batch processing')}
        btnProps={{
          type: 'primary',
          ghost: true,
        }}
      />
      <FormModal
        width={520}
        {...state.formProps}
        onOk={handleSubmit}
        onCancel={() => closeModal()}
      />
    </>
  );
};

