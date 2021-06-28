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

import React, { useMemo } from 'react';
import moment from 'moment';
import i18n from 'i18n';
import { Select, RangePicker } from 'app/nusi';
import { map, find, get, compact, isArray } from 'lodash';
import { MemberSelector } from 'common';
import { insertWhen, getTimeRanges } from 'common/utils';
import { ISSUE_PRIORITY_MAP, BUG_SEVERITY_MAP, ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import LabelSelect from 'project/common/components/issue/label-select';
import routeInfoStore from 'core/stores/route';
import userMapStore from 'core/stores/userMap';
import userStore from 'app/user/stores';
import RequirementSelect from 'project/common/components/issue/requirement-select';
import issueWorkflowStore from 'project/stores/issue-workflow';
import issueFieldStore from 'org/stores/issue-field';

interface IProps {
  type: ISSUE_TYPE;
  queryCondition: Obj;
  listView?: string;
}

const { Option } = Select;
interface IOptionItem {
  name: string;
  value: string;
}

export default ({ queryCondition, type, listView }: IProps) => {
  const [projectId, query] = routeInfoStore.getState((s) => [s.params.projectId, s.query]);
  const totalWorkflowStateList = issueWorkflowStore.useStore((s) => s.totalWorkflowStateList);
  const [bugStageList, taskTypeList] = issueFieldStore.useStore((s) => [s.bugStageList, s.taskTypeList]);

  const taskTypeOption = React.useMemo(() => {
    return map(taskTypeList, ({ id, name }) => {
      return {
        name,
        value: id,
      };
    });
  }, [taskTypeList]);

  const bugStageOption = React.useMemo(() => {
    return map(bugStageList, ({ id, name }) => {
      return {
        name,
        value: id,
      };
    });
  }, [bugStageList]);

  const workflowStateOption = React.useMemo(() => {
    const tempOptionList: IOptionItem[] = [];
    map(totalWorkflowStateList, ({ stateID, stateName, issueType }) => {
      if (issueType === query.type) {
        tempOptionList.push({
          name: stateName,
          value: stateID,
        });
      }
    });
    return tempOptionList || [];
  }, [query.type, totalWorkflowStateList]);

  const userMap = userMapStore.getState((s) => s);
  const loginUser = userStore.getState((s) => s.loginUser);

  const filterList: any[] = useMemo(() => {
    const inRequirement = type === ISSUE_TYPE.REQUIREMENT;
    const inTask = type === ISSUE_TYPE.TASK;
    const inBug = type === ISSUE_TYPE.BUG;
    const inTicket = type === ISSUE_TYPE.TICKET;

    const existUser = {
      ...(userMap || {}),
      [loginUser.id]: { ...loginUser },
    };

    const { label, assignee, creator, startCreatedAt, endCreatedAt, startFinishedAt, endFinishedAt } = queryCondition;

    const userValueConvert = (val: string[] | string, options: any[]) => {
      return map(isArray(val) ? val : [val], (item) => {
        const curUser = existUser[item] || find(options, (opt) => opt.userId === `${item}`) || {};
        return curUser.nick || curUser.name || item;
      }).join(', ');
    };

    const temp: any[] = [
      {
        type: 'custom',
        name: 'label',
        label: i18n.t('project:label'),
        Comp: <LabelSelect type="issue" value={label} fullWidth />,
        filterBarValueConvert: (val: string[], options: any[] = []) => {
          const reVal = compact(map(options, (item) => item.props.children)).join(',');
          return reVal;
        },
      },
      {
        type: 'select',
        name: 'priority',
        label: i18n.t('project:priority'),
        allowClear: true,
        placeholder: i18n.t('please choose {name}', { name: i18n.t('project:priority') }),
        mode: 'multiple',
        options: () =>
          map(ISSUE_PRIORITY_MAP, ({ value, iconLabel }) => (
            <Option key={value} value={value}>
              {iconLabel}
            </Option>
          )),
        filterBarValueConvert: (val: string[] | string) => {
          return map(isArray(val) ? val : [val], (item) => ISSUE_PRIORITY_MAP[item].label).join(', ');
        },
      },
      ...insertWhen(inBug || inTicket, [
        {
          type: 'select',
          name: 'severity',
          label: i18n.t('project:severity'),
          allowClear: true,
          placeholder: i18n.t('please choose {name}', { name: i18n.t('project:severity') }),
          mode: 'multiple',
          options: () =>
            map(BUG_SEVERITY_MAP, ({ iconLabel, value }) => (
              <Option key={value} value={value}>
                {iconLabel}
              </Option>
            )),
          filterBarValueConvert: (val: string[] | string) => {
            return map(isArray(val) ? val : [val], (item) => BUG_SEVERITY_MAP[item].label).join(', ');
          },
        },
      ]),
      {
        type: 'custom',
        name: 'creator',
        label: i18n.t('project:creator'),
        value: creator,
        Comp: <MemberSelector mode="multiple" scopeType="project" scopeId={projectId} />,
        filterBarValueConvert: userValueConvert,
      },
      {
        type: 'custom',
        name: 'assignee',
        label: i18n.t('project:assignee'),
        value: assignee,
        Comp: <MemberSelector mode="multiple" scopeType="project" scopeId={projectId} />,
        filterBarValueConvert: userValueConvert,
      },
      ...insertWhen(inBug, [
        {
          type: 'custom',
          name: 'owner',
          label: i18n.t('project:responsible person'),
          Comp: <MemberSelector mode="multiple" scopeType="project" scopeId={projectId} />,
          filterBarValueConvert: userValueConvert,
        },
        {
          type: 'select',
          name: 'bugStage',
          mode: 'multiple',
          allowClear: true,
          label: i18n.t('project:import source'),
          options: bugStageOption,
          filterBarValueConvert: (val: string[] | string) => {
            return map(isArray(val) ? val : [val], (item) =>
              get(find(bugStageOption, { value: Number(item) }), 'name'),
            ).join(', ');
          },
        },
      ]),
      {
        type: 'custom',
        name: 'startCreatedAt,endCreatedAt',
        label: i18n.t('project:created at'),
        value: startCreatedAt ? [moment(+startCreatedAt), moment(+endCreatedAt)] : [],
        Comp: <RangePicker borderTime format={['MM-DD', 'MM-DD']} ranges={getTimeRanges()} />,
        filterBarValueConvert: (val: string[]) => {
          return map(val, (item) => moment(item).format('MM-DD')).join(' ~ ');
        },
      },
      {
        type: 'custom',
        name: 'startFinishedAt,endFinishedAt',
        label: i18n.t('project:completed time'),
        value: startFinishedAt ? [moment(+startFinishedAt), moment(+endFinishedAt)] : [],
        Comp: <RangePicker borderTime format={['MM-DD', 'MM-DD']} ranges={getTimeRanges()} />,
        filterBarValueConvert: (val: string[]) => {
          return map(val, (item) => moment(item).format('MM-DD')).join(' ~ ');
        },
      },
      ...insertWhen(!(inRequirement || (inTask && listView !== 'table')), [
        {
          type: 'select',
          name: 'state',
          mode: 'multiple',
          label: i18n.t('common:state'),
          options: workflowStateOption,
          filterBarValueConvert: (val: string[] | string) => {
            return map(isArray(val) ? val : [val], (item) =>
              get(find(totalWorkflowStateList, { stateID: Number(item) }), 'stateName'),
            ).join(', ');
          },
        },
      ]),
      ...insertWhen(inTask, [
        {
          type: 'custom',
          name: 'relatedIssueId',
          label: i18n.t('project:related requirement'),
          Comp: <RequirementSelect />,
          filterBarValueConvert: (val: string, option: any) => {
            return option ? (`${val}` === `${option.value}` ? option.label : '') : val;
          },
        },
        {
          type: 'select',
          name: 'taskType',
          label: i18n.t('task type'),
          mode: 'multiple',
          allowClear: true,
          options: taskTypeOption,
          filterBarValueConvert: (val: string[] | string) => {
            return map(isArray(val) ? val : [val], (item) =>
              get(find(taskTypeOption, { value: Number(item) }), 'name'),
            ).join(', ');
          },
        },
      ]),
    ];
    return temp;
  }, [
    type,
    userMap,
    loginUser,
    queryCondition,
    projectId,
    bugStageOption,
    listView,
    workflowStateOption,
    taskTypeOption,
    totalWorkflowStateList,
  ]);
  return filterList;
};
