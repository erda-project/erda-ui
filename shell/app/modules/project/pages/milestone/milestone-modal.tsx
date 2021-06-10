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

import { FormModal, MemberSelector } from 'common';
import routeInfoStore from 'common/stores/route';
import i18n from 'i18n';
import { ISSUE_TYPE } from 'project/common/issue-config';
import issueStore from 'project/stores/issues';
import * as React from 'react';

interface IProps {
  visible: boolean;
  data?: ISSUE.Epic | null;
  reload: () => void;
  onCancel: () => void;
}
export const MilestoneModal = ({ visible, data, reload, onCancel }: IProps) => {
  const params = routeInfoStore.useStore((s) => s.params);
  const { updateIssue, createIssue } = issueStore.effects;

  const fieldsList = [
    {
      name: 'title',
      label: i18n.t('name'),
      itemProps: {
        maxLength: 255,
      },
    },
    {
      name: 'planFinishedAt',
      label: i18n.t('project:plan finish at'),
      type: 'datePicker',
    },
    {
      name: 'assignee',
      label: i18n.t('project:assignee to'),
      getComp: () => {
        return <MemberSelector scopeType="project" scopeId={params.projectId} />;
      },
    },
    {
      name: 'content',
      label: i18n.t('content'),
      type: 'textArea',
      required: false,
      itemProps: {
        maxLength: 1000,
      },
    },
  ];

  const handleSubmit = (formData: { title: string; content: string; assignee: string; planFinishedAt: string }) => {
    if (data) {
      updateIssue({ ...data, ...formData }).finally(() => {
        reload();
        onCancel();
      });
    } else {
      createIssue({
        ...(formData as any),
        projectID: +params.projectId,
        type: ISSUE_TYPE.EPIC,
        iterationID: -1,
      }).finally(() => {
        reload();
        onCancel();
      });
    }
  };

  return (
    <FormModal
      title={i18n.t('project:create milestone')}
      visible={visible}
      fieldsList={fieldsList}
      formData={data}
      onOk={handleSubmit}
      onCancel={onCancel}
    />
  );
};
