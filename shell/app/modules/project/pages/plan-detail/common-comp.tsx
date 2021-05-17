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

import i18n from 'i18n';
import SelectEnv from 'project/pages/test-manage/case/case-drawer/select-env';
import React from 'react';
import testCaseStore from 'project/stores/test-case';
import { Avatar, UserInfo } from 'common';
import { useEffectOnce } from 'react-use';
import { Progress, Popover } from 'app/nusi';
import testPlanStore from 'project/stores/test-plan';
import testEnvStore from 'project/stores/test-env';
import routeInfoStore from 'common/stores/route';
import moment from 'moment';

const noEnv = [{
  id: 0,
  name: i18n.t('project:no environment'),
  domain: i18n.t('project:none'),
  header: {},
  global: {},
}] as TEST_ENV.Item[];

interface IPropsOfEnvSelect {
  children: JSX.Element
  execute(data: Omit<TEST_PLAN.CaseApi, 'testPlanID'>):void
}
export const EnvSelect = ({ execute, children }:IPropsOfEnvSelect) => {
  const projectEnvList = testEnvStore.useStore(s => s.projectEnvList);
  const { getProjectTestEnvList, clearProjectEnvList } = testEnvStore;
  const params = routeInfoStore.useStore(s => s.params);
  
  useEffectOnce(() => {
    getProjectTestEnvList({ envID: +params.projectId, envType: 'project' });
    return () => {
      clearProjectEnvList();
    }
  });

  const caseList = testCaseStore.useStore(s => s.caseList);
  const { primaryKeys } = testCaseStore.useStore(s => s.choosenInfo);
  const handleExecute = React.useCallback((env:TEST_ENV.Item) => {
    const testCaseIDs: number[] = [];
    caseList.forEach(({ testCases }) => {
      testCases.forEach(cases => {
        if (primaryKeys.includes(cases.id)) {
          testCaseIDs.push(cases.testCaseID);
        }
      });
    });
    execute({ envID: env.id, testCaseIDs });
  }, [caseList, execute, primaryKeys]);
  return (
    <SelectEnv
      noEnv={noEnv}
      envList={projectEnvList}
      onClick={handleExecute}
    >
      {children}
    </SelectEnv>
  );
};

export const BaseInfo = () => {
  const planItemDetail = testPlanStore.useStore(s => s.planItemDetail);
  const partnerIDs = planItemDetail.partnerIDs || [];
  const percent = React.useMemo(() => {
    const { succ, total } = planItemDetail.relsCount;
    return Math.floor((succ / total) * 100 || 0);
  }, [planItemDetail.relsCount]);
  const createTime = planItemDetail.createdAt ? moment(planItemDetail.createdAt).format('YYYY-MM-DD HH:mm:ss') : '';
  const content = (
    <div>
      <span className="color-text bold-500 mb8">{i18n.t('project:participant')}</span>
      <div className="center-flex-box participant-items flex-start">
        {
          partnerIDs.map((value, index) => {
            return <span key={`${String(index)}-${value}`} className="mr8 mb8"><Avatar showName name={<UserInfo id={value} />} /></span>;
          })
        }
      </div>
    </div>
  );
  return (
    <div className="common-list-item px0">
      <div>
        <div className="title">{planItemDetail.id} - {planItemDetail.name}</div>
        <div className="sub member">
          <span className="ml4">{i18n.t('project:principal')}：</span>
          <Avatar showName name={<UserInfo id={planItemDetail.ownerID} render={data => data.nick || data.name} />} />
          <span className="ml24">{i18n.t('project:participant')}：</span>
          <Popover overlayStyle={{ width: 280 }} overlayClassName="participant-popover" content={content}>
            <span className="participant flex-box hover-active">
              {partnerIDs.slice(0, 4).map((p, index) => <Avatar key={`${String(index)}-${p}`} />)}
              {partnerIDs.length > 4 ? <span className="count px4 bold-500">+{partnerIDs.length - 4}</span> : null}
            </span>
          </Popover>
          {/* <span>{planItemDetail.relatedIterative} 迭代</span> */}
        </div>
      </div>
      <div>
        <div className="color-text"><Progress strokeWidth={12} style={{ width: '230px' }} percent={percent} showInfo={false} /> {i18n.t('project:passing rate')} {percent}%</div>
        <div className="sub pull-right">{<UserInfo id={planItemDetail.creatorID} />} {i18n.t('project:built in')} {createTime}</div>
      </div>
    </div>
  );
};
