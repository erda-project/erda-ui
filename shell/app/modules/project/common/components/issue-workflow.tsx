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
import i18n from 'i18n';
import { useUpdate } from 'common';
import { map, find, get } from 'lodash';
import { IssueIcon } from 'project/common/components/issue/issue-icon';
import issueWorkflowStore from 'project/stores/issue-workflow';
import { issueStateMap } from 'project/common/config';
import IssueWorkflowSettingModal from 'project/common/components/issue-workflow-setting-modal';
import routeInfoStore from 'core/stores/route';
import { useEffectOnce } from 'react-use';
import { ISSUE_TYPE, ISSUE_STATE_MAP } from 'project/common/components/issue/issue-config';
import './issue-workflow.scss';

const IssueWorkflow = () => {
  const { projectId: projectID } = routeInfoStore.getState((s) => s.params);

  const [issueList, workflowStateList] = issueWorkflowStore.useStore((s) => [s.issueList, s.workflowStateList]);
  const { getStatesByIssue, getIssueList, clearIssueList } = issueWorkflowStore;

  useEffectOnce(() => {
    getIssueList({ projectID: +projectID });
    return () => clearIssueList();
  });

  const [{ modalVisible, issueType }, updater] = useUpdate({
    modalVisible: false,
    issueType: 'EPIC' as ISSUE_TYPE,
  });

  const onCloseModal = React.useCallback(() => {
    updater.modalVisible(false);
    getIssueList({ projectID: +projectID });
  }, [getIssueList, projectID, updater]);

  const onEditHandle = React.useCallback(
    (type: ISSUE_TYPE) => {
      getStatesByIssue({ projectID: +projectID }).then(() => {
        updater.modalVisible(true);
        updater.issueType(type);
      });
    },
    [getStatesByIssue, projectID, updater],
  );

  return (
    <div className="issue-workflow">
      {map(issueList, (item) => {
        return (
          <div
            className="panel hover-active-bg"
            key={item.issueType}
            onClick={() => {
              onEditHandle(item.issueType);
            }}
          >
            <div className="common-list-item">
              <div className="list-item-left">
                <div className="flex justify-between items-center">
                  <div className="panel-title justify-start">
                    <IssueIcon type={item.issueType} withName />
                  </div>
                </div>
                <div className="sub">
                  <span>{i18n.t('common:state')}：</span>
                  <div>
                    {map(Object.entries(issueStateMap[item.issueType]), (data: string[]) => {
                      return (
                        <span className="tag-default" key={data[1]}>
                          {data[1]}
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div className="sub default-workflow">
                  <div className="default-workflow-title">{i18n.t('project:default workflow')}：</div>
                  <div className="default-workflow-content">
                    {map(item.state, (name: string) => {
                      const curStateBelong = get(find(workflowStateList, { stateName: name }), 'stateBelong');
                      return (
                        <div className="flex items-center mr-3 mb-2">
                          {ISSUE_STATE_MAP[curStateBelong]?.icon}
                          {name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <IssueWorkflowSettingModal visible={modalVisible} onCloseModal={onCloseModal} issueType={issueType} />
    </div>
  );
};

export default IssueWorkflow;
