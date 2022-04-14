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
import { ISSUE_TYPE, ISSUE_PRIORITY_MAP, BUG_SEVERITY_MAP } from 'project/common/components/issue/issue-config';
import routeInfoStore from 'core/stores/route';
import projectLabelStore from 'project/stores/label';
import issueStore from 'project/stores/issues';
import EditIssueDrawer, { CloseDrawerParam } from 'project/common/components/issue/edit-issue-drawer';
import { map, isEmpty, omit } from 'lodash';

import { useMount } from 'react-use';
import IssueState from 'project/common/components/issue/issue-state';
import { Filter, MemberSelector, ConfigurableFilter } from 'common';
import ErdaTable from 'common/components/table';
import { useUpdate, useUpdateSearch } from 'common/use-hooks';
import { mergeSearch, getTimeRanges } from 'common/utils';
import { ColumnProps } from 'antd/lib/table';
import { Button, Tooltip } from 'antd';
import { useLoading } from 'core/stores/loading';
import { usePerm, WithAuth, getAuth, isCreator, isAssignee } from 'app/user/common';
import i18n from 'i18n';
import { FieldSelector, memberSelectorValueItem } from 'project/pages/issue/component/table-view';
import moment from 'moment';
import issueWorkflowStore from 'project/stores/issue-workflow';

const formatFormData = (query: Obj = {}) => {
  const _q = { ...query };
  if (!isEmpty(_q.createdAt)) {
    const [start, end] = _q.createdAt;
    _q.startCreatedAt = start;
    _q.endCreatedAt = end;
  }
  return _q;
};

const Ticket = () => {
  const [{ projectId }, query] = routeInfoStore.getState((s) => [s.params, s.query]);
  const { id: queryId } = query;
  const [loading] = useLoading(issueStore, ['getIssues']);
  const workflowStateList = issueWorkflowStore.useStore((s) => s.workflowStateList);
  const ticketStateList = React.useMemo(() => {
    const temp: any[] = [];

    map(workflowStateList, ({ issueType, stateName, stateID, stateBelong }) => {
      if (issueType === ISSUE_TYPE.TICKET) {
        temp.push({
          stateName,
          stateID,
          stateBelong,
        });
      }
    });
    return temp;
  }, [workflowStateList]);

  const [list, paging] = issueStore.useStore((s) => [s.ticketList, s.ticketPaging]);
  const { getIssues, updateIssue } = issueStore.effects;
  const ticketPerm = usePerm((s) => s.project.ticket);
  const { getLabels } = projectLabelStore.effects;
  const labelList = projectLabelStore.useStore((s) => s.list);
  useMount(() => {
    if (queryId) {
      update({
        drawerVisible: true,
        detailId: queryId,
      });
    }
    getLabels({ type: 'issue', projectID: Number(projectId) });
    getList({ pageNo: paging.pageNo });
  });

  const [{ drawerVisible, detailId, filterData }, updater, update] = useUpdate({
    drawerVisible: false,
    detailId: undefined as undefined | number,
    filterData: formatFormData(query) || ({} as Obj),
  });

  const closeDrawer = ({ hasEdited, isCreate, isDelete }: CloseDrawerParam) => {
    update({
      drawerVisible: false,
      detailId: undefined,
    });
    if (hasEdited || isCreate || isDelete) {
      getList(isDelete || isCreate ? { pageNo: 1 } : { pageNo: paging.pageNo });
    }
  };

  const filterField = React.useMemo(
    () => [
      {
        type: 'input',
        key: 'title',
        label: i18n.t('Title'),
        outside: true,
        placeholder: i18n.t('filter by {name}', { name: i18n.t('Title') }),
      },
      {
        type: 'input',
        key: 'source',
        label: i18n.t('dop:Source'),
        placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:Source') }),
      },
      {
        type: 'select',
        key: 'state',
        label: i18n.t('status'),
        options: ticketStateList.map(({ stateID }) => ({ label: <IssueState stateID={stateID} />, value: stateID })),
        mode: 'multiple',
        placeholder: i18n.t('filter by {name}', { name: i18n.t('status') }),
      },
      {
        type: 'select',
        key: 'priority',
        mode: 'multiple',
        label: i18n.t('dop:Priority'),
        placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:Priority') }),
        options: map(ISSUE_PRIORITY_MAP, (item) => ({ label: item.iconLabel, value: item.value })),
      },
      {
        type: 'select',
        key: 'severity',
        label: i18n.t('dop:Severity'),
        placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:Severity') }),
        options: map(BUG_SEVERITY_MAP, (item) => ({ label: item.iconLabel, value: item.value })),
      },
      {
        type: 'custom',
        key: 'creator',
        label: i18n.t('Submitter'),
        placeholder: i18n.t('filter by {name}', { name: i18n.t('Submitter') }),
        getComp: () => <MemberSelector mode={'multiple'} scopeType={'project'} size={'small'} scopeId={projectId} />,
      },
      {
        type: 'custom',
        key: 'assignee',
        label: i18n.t('dop:assignee'),
        placeholder: i18n.t('filter by {name}', { name: i18n.t('dop:assignee') }),
        getComp: () => <MemberSelector mode={'multiple'} scopeType={'project'} size={'small'} scopeId={projectId} />,
      },
      {
        type: 'dateRange',
        key: 'createdAt',
        label: i18n.t('Date'),
        customProps: {
          ranges: getTimeRanges(),
        },
      },
      {
        type: 'select',
        key: 'label',
        label: i18n.t('label'),
        placeholder: i18n.t('filter by {name}', { name: i18n.t('label') }),
        options: labelList.map((item) => ({ label: item.name, value: item.id })),
      },
    ],
    [ticketStateList, labelList, projectId],
  );

  const getList = (query: Obj = {}) => {
    getIssues({ type: ISSUE_TYPE.TICKET, ...omit(filterData, 'createdAt'), ...query });
  };

  const clickTicket = (val: ISSUE.Issue) => {
    update({
      drawerVisible: true,
      detailId: val.id,
    });
  };
  const updateIssueRecord = (val: ISSUE.Ticket) => {
    updateIssue(val).then(() => {
      getList({ pageNo: paging.pageNo });
    });
  };

  const columns: Array<ColumnProps<ISSUE.Issue>> = [
    {
      title: i18n.t('dop:Title-ticket'),
      dataIndex: 'title',
      render: (val: string, record: ISSUE.Issue) => {
        return (
          <Tooltip title={val}>
            <div className="cursor-pointer pl-2 w-full truncate leading-8" onClick={() => clickTicket(record)}>
              {val}
            </div>
          </Tooltip>
        );
      },
    },
    // {
    //   title: i18n.t('dop:Source'),
    //   dataIndex: 'source',
    // },
    // {
    //   title: i18n.t('label'),
    //   dataIndex: 'labels',
    //   render: (labels = []) => (
    //     <>
    //       {
    //         labels.map(label => <Tag key={label}>{label}</Tag>)
    //       }
    //     </>
    //   ),
    // },
    // {
    //   title: i18n.t('Submitter'),
    //   dataIndex: 'creator',
    //   width: 120,
    //   render: (v: string) => {
    //     const creatorObj = userMap[v] || {};
    //     return <Avatar name={creatorObj.nick || creatorObj.name} showName />;
    //   },
    // },
    {
      title: i18n.t('status'),
      dataIndex: 'state',
      width: 120,
      render: (v: string, record: ISSUE.Ticket) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const updateStatusAuth = getAuth(ticketPerm.updateStatus, checkRole);
        const { issueButton } = record;
        const opts = [] as any;
        map(issueButton, (item) => {
          opts.push({
            disabled: !item.permission,
            value: item.stateID,
            iconLabel: <IssueState stateID={item.stateID} />,
          });
        });

        return (
          <FieldSelector
            field="state"
            hasAuth={updateStatusAuth}
            value={v}
            record={record}
            updateRecord={(_val: string) => {
              updateIssueRecord({ ...record, state: +_val });
            }}
            options={opts}
          />
        );
      },
    },
    {
      title: i18n.t('dop:Priority'),
      dataIndex: 'priority',
      width: 120,
      render: (val: string, record: ISSUE.Ticket) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const editAuth = getAuth(ticketPerm.edit, checkRole);
        return (
          <FieldSelector
            field="priority"
            hasAuth={editAuth}
            value={val || ISSUE_PRIORITY_MAP.NORMAL.value}
            record={record}
            updateRecord={(_val: string) => updateIssueRecord({ ...record, priority: _val })}
            options={map(ISSUE_PRIORITY_MAP)}
          />
        );
      },
    },
    {
      title: i18n.t('dop:Severity'),
      dataIndex: 'severity',
      width: 120,
      render: (val: string, record: ISSUE.Issue) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const editAuth = getAuth(ticketPerm.edit, checkRole);
        return (
          <FieldSelector
            field="severity"
            hasAuth={editAuth}
            value={val}
            record={record}
            updateRecord={(_val: string) => updateIssueRecord({ ...record, severity: _val })}
            options={map(BUG_SEVERITY_MAP)}
          />
        );
      },
    },
    {
      title: i18n.t('dop:assignee'),
      dataIndex: 'assignee',
      width: 160,
      render: (v: string, record: ISSUE.Ticket) => {
        const checkRole = [isCreator(record.creator), isAssignee(record.assignee)];
        const editAuth = getAuth(ticketPerm.edit, checkRole);
        return (
          <WithAuth pass={editAuth}>
            <MemberSelector
              scopeType="project"
              scopeId={projectId}
              dropdownMatchSelectWidth={false}
              valueItemRender={memberSelectorValueItem}
              className="issue-member-selector"
              allowClear={false}
              disabled={!editAuth}
              value={v}
              onChange={(val) => {
                updateIssueRecord({ ...record, assignee: val });
              }}
            />
          </WithAuth>
        );
      },
    },
    {
      title: i18n.t('dop:Creation time'),
      dataIndex: 'createdAt',
      width: 180,
      render: (v: string) => moment(v).format('YYYY-MM-DD HH:mm:ss'),
    },
  ];

  const pagination = {
    total: paging.total,
    current: paging.pageNo,
    pageSize: paging.pageSize,
    showSizeChanger: true,
    onChange: (no: number, size: number) => getList({ pageNo: no, pageSize: size }),
  };

  const onFilter = ({ createdAt, ...rest }: Obj = {}) => {
    const _q = { ...rest };
    const [start, end] = createdAt || [];
    if (start) {
      const startCreatedAt = moment(+start)
        .startOf('day')
        .valueOf();
      _q.startCreatedAt = startCreatedAt;
    } else {
      _q.startCreatedAt = undefined;
    }
    if (end) {
      const endCreatedAt = moment(+end)
        .endOf('day')
        .valueOf();
      _q.endCreatedAt = endCreatedAt;
    } else {
      _q.endCreatedAt = undefined;
    }

    updater.filterData({ createdAt, ...rest });
    getList({ pageNo: 1, ..._q });
  };

  const [setUrlQuery] = useUpdateSearch({ reload: onFilter });

  React.useEffect(() => {
    setUrlQuery(filterData);
  }, [filterData, setUrlQuery]);

  return (
    <div className="project-ticket">
      <div className="top-button-group">
        <WithAuth pass={ticketPerm.create.pass} tipProps={{ placement: 'bottom' }}>
          <Button type="primary" onClick={() => updater.drawerVisible(true)}>
            {i18n.t('dop:Add-ticket')}
          </Button>
        </WithAuth>
      </div>
      <ErdaTable
        tableKey="project-ticket"
        loading={loading}
        columns={columns}
        dataSource={list}
        rowKey="id"
        size="small"
        pagination={pagination}
        slot={<ConfigurableFilter value={filterData} hideSave fieldsList={filterField} onFilter={onFilter} />}
      />
      <EditIssueDrawer
        id={detailId}
        issueType={ISSUE_TYPE.TICKET}
        visible={drawerVisible}
        iterationID={-1}
        closeDrawer={closeDrawer}
        shareLink={`${location.href.split('?')[0]}?${mergeSearch({ id: detailId }, true)}`}
      />
    </div>
  );
};

export default Ticket;
