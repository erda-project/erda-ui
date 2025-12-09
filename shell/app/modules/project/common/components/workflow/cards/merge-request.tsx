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
import { ErdaIcon } from 'common';
import i18n from 'i18n';
import { Mr, Branch, Status } from './base';
import classnames from 'classnames';
import { goTo } from 'app/common/utils';

interface CardProps {
  data: DEVOPS_WORKFLOW.DevFlowInfo;
  className?: string;
  disabled: boolean;
  index: number;
  projectID: string;
  reload?: () => void;
}

const mrStatus = {
  merged: {
    icon: (
      <div className="text-xs text-green flex-h-center">
        <ErdaIcon type="tongguo" disableCurrent size={12} />
        {i18n.t('dop:Merged')}
      </div>
    ),
    stepStates: 'success',
  },
  open: {
    icon: (
      <div className="text-xs text-blue flex-h-center">
        <ErdaIcon type="zhuyiattention" className="mr-0.5" fill={'blue'} size={12} />
        {i18n.t('dop:Open')}
      </div>
    ),
    stepStates: 'process',
  },
  closed: {
    icon: (
      <div className="text-xs text-red flex-h-center">
        <ErdaIcon type="butongguo" disableCurrent size={12} />
        {i18n.t('Closed')}
      </div>
    ),
    stepStates: 'error',
  },
  uncreate: {
    icon: (
      <div className="text-xs text-yellow flex-h-center">
        <ErdaIcon type="tishi" fill={'yellow'} size={14} />
        {i18n.t('dop:Not create')}
      </div>
    ),
    stepStates: 'uncreate',
  },
};

const MergeRequestCard = (props: CardProps) => {
  const { data, projectID, index, className, disabled } = props;
  const { appID } = data.devFlow || {};
  const {
    currentBranch,
    desc: createDesc,
    mergeRequestInfo,
    targetBranch,
    title: createTitle,
  } = data?.mergeRequestNode || {};
  const { changeBranch } = data?.tempMergeNode || {};
  const { commit } = data?.codeNode;
  const { mergeId, state, title = '' } = mergeRequestInfo || {};
  const curMrState = state && mrStatus[state];
  const stepStatus =
    curMrState?.stepStates || (changeBranch?.find((item) => item.commit?.id === commit?.id) ? 'process' : 'wait');
  const cls = {
    'bg-default-04': disabled,
  };
  return (
    <div className={classnames(className, cls, 'hover:shadow flex w-[320px] h-[108px] border-all p-4 rounded')}>
      <Status status={stepStatus} index={index} />
      <div className="ml-2 flex-1 overflow-hidden">
        <div className="mb-3 flex-h-center justify-between">
          <div className="flex-h-center">
            <span>{i18n.t('dop:merge request')}</span>
          </div>
          {!disabled && targetBranch ? (
            <div
              onClick={() => {
                mergeRequestInfo
                  ? goTo(goTo.pages.appMr, { appId: appID, projectId: projectID, mrId: mergeId, state, jumpOut: true })
                  : goTo(goTo.pages.appCreateMr, {
                      appId: appID,
                      projectId: projectID,
                      jumpOut: true,
                      query: {
                        sourceBranch: encodeURIComponent(currentBranch),
                        targetBranch: encodeURIComponent(targetBranch),
                        title: encodeURIComponent(createTitle),
                        desc: encodeURIComponent(createDesc),
                      },
                    });
              }}
              className={`px-3 rounded cursor-pointer bg-blue-deep text-white`}
            >
              {mergeRequestInfo ? i18n.t('dop:check merge request', 'dop') : i18n.t('dop:create merge request')}
            </div>
          ) : null}
        </div>
        {targetBranch ? (
          <Branch className="mb-2" appId={appID} projectId={projectID} branch={targetBranch} />
        ) : (
          <div className="text-xs text-default-8">{i18n.t('dop:target branch is empty')}</div>
        )}
        <div className="flex-h-center text-xs">
          {mergeRequestInfo ? (
            state ? (
              <>
                {curMrState?.icon || null}
                <Mr
                  className="ml-1 flex-1 overflow-hidden"
                  title={title}
                  state={state}
                  mrId={`${mergeId}`}
                  appId={appID}
                  projectId={projectID}
                />
              </>
            ) : null
          ) : (
            mrStatus.uncreate.icon
          )}
        </div>
      </div>
    </div>
  );
};

export default MergeRequestCard;
