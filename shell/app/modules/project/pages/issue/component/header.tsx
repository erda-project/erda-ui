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

import * as React from 'react';
import IterationSelect from 'project/common/components/issue/iteration-select';
import { useUpdate, ToolBarWithFilter, Icon as CustomIcon } from 'common';
import { Input, Radio, Tooltip, Button, Dropdown, Menu, Switch } from 'app/nusi';
import { ISSUE_TYPE } from 'project/common/components/issue/issue-config';
import i18n from 'i18n';
import { map, debounce, find, get } from 'lodash';
import { useEffectOnce } from 'react-use';
import userStore from 'user/stores';
import orgStore from 'app/org-home/stores/org';
import { qs } from 'app/common/utils';
import moment from 'moment';
import useFilterList from '../../iteration/filter-field';
import routeInfoStore from 'app/common/stores/route';
import { WithAuth, usePerm } from 'user/common';
import ImportFile from 'project/pages/issue/component/import-file';
import './header.scss';

interface IProps {
  issueType: ISSUE_TYPE;
  withPageNo?: boolean;
  reloadData: () => void;
  onFilter: (val: Obj) => void;
  changeViewType: (val: { viewType: string; viewGroup: string }) => void;
}

const { FilterButton } = ToolBarWithFilter;

const VIEW_GROUP = [
  { value: 'priority', name: i18n.t('project:priority') },
  { value: 'assignee', name: i18n.t('project:assignee') },
  { value: 'time', name: i18n.t('deadline') },
  { value: 'custom', name: i18n.t('customize') },
];

const viewGroupMap = {
  [ISSUE_TYPE.ALL]: [...VIEW_GROUP],
  [ISSUE_TYPE.REQUIREMENT]: [
    { value: 'status', name: i18n.t('status') },
    ...VIEW_GROUP,
  ],
  [ISSUE_TYPE.TASK]: [
    { value: 'status', name: i18n.t('status') },
    ...VIEW_GROUP,
  ],
  [ISSUE_TYPE.BUG]: [
    { value: 'status', name: i18n.t('status') },
    ...VIEW_GROUP,
  ],
};

export const ViewTypeMap = {
  table: { name: i18n.t('table'), tip: i18n.t('table view'), value: 'table', icon: 'default-list', group: undefined },
  kanban: {
    tip: i18n.t('board view'),
    value: 'kanban',
    icon: 'data-matrix',
  },
};


const filterFixOut = (val: Obj) => {
  const reVal = {};
  map(val, (v, k) => {
    if (k.includes(',')) { // 时间的filter
      const [start, end] = k.split(',');
      const [startVal, endVal] = v || [];
      if (start && end) {
        reVal[start] = startVal ? moment(startVal).valueOf() : startVal;
        reVal[end] = endVal ? moment(endVal).valueOf() : endVal;
      }
    } else {
      reVal[k] = v;
    }
  });
  return reVal;
};

const IssueHeader = (props: IProps) => {
  const { onFilter, changeViewType, withPageNo, issueType, reloadData } = props;
  const [params, query] = routeInfoStore.useStore(s => [s.params, s.query]);
  const curViewGroup = viewGroupMap[issueType];
  const [{ filterObj, viewType, viewGroup }, updater, update] = useUpdate({
    filterObj: { ...(withPageNo ? { pageNo: 1 } : {}), ...(query || {}) } as Obj,
    viewType: query.viewType || ViewTypeMap.table.value,
    viewGroup: find(curViewGroup, { value: query.viewGroup }) ? query.viewGroup : curViewGroup[0].value,
  });
  const orgID = orgStore.getState(s => s.currentOrg.id);
  const filterBarRef = React.useRef(null as any);

  useEffectOnce(() => {
    doFilter();
  });

  React.useEffect(() => {
    let _viewGroup = viewGroup;
    const _viewGroupObj = find(curViewGroup, { value: _viewGroup });

    if (!_viewGroupObj) {
      _viewGroup = curViewGroup[0].value;
    }
    changeViewType({ viewType, viewGroup: _viewGroup });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewType, viewGroup]);

  const doFilter = (val?: Obj) => {
    debounceFilter(val || filterObj);
  };

  const debounceFilter = React.useCallback(debounce((filterData: Obj) => {
    onFilter(filterData);
    // onFilter(omit(filterData, [FilterBarHandle.filterDataKey]));
  }, 500), []);

  const updateFilter = (val: Obj = {}) => {
    const newVal = filterFixOut({ ...filterObj, ...val });
    updater.filterObj(newVal);
    doFilter({ ...newVal, ...(withPageNo ? { pageNo: 1 } : {}) });
  };

  const loginUserId = userStore.getState(s => s.loginUser.id);
  const requirementAuth = usePerm(s => s.project.requirement);

  const getDownloadUrl = () => {
    return `/api/issues/actions/export-excel?${qs.stringify({ ...filterObj, pageNo: 1, projectID: params.projectId, type: issueType, IsDownload: false, orgID }, { arrayFormat: 'none' })}`;
  };

  const downloadTemplate = `/api/issues/actions/export-excel?${qs.stringify({ ...filterObj, pageNo: 1, projectID: params.projectId, type: issueType, IsDownload: true, orgID }, { arrayFormat: 'none' })}`;


  return (
    <div className='issue-header'>
      <div>
        {params.iterationId === undefined &&
          <IterationSelect
            className="mr8"
            mode="multiple"
            allowClear
            value={filterObj.iterationIDs}
            onChange={(ids) => updateFilter({ iterationIDs: ids })}
            placeholder={i18n.t('project:owing iteration')}
          />
        }
        <Input.Search
          style={{ width: '268px' }}
          value={filterObj.title}
          placeholder={i18n.t('search by name')}
          onChange={(e) => updateFilter({ title: e.target.value || undefined })}
        />
      </div>
      <ToolBarWithFilter
        className='ml12-group'
        list={useFilterList({ type: issueType, queryCondition: filterObj })}
        filterValue={filterObj}
        syncUrlOnSearch={false}
        onSearch={(val: Obj) => updateFilter(val)}
        ref={filterBarRef}
      >
        <Switch
          checked={filterObj.assignee ? filterObj.assignee.toString() === loginUserId : false}
          onChange={(enable: boolean) => {
            if (filterBarRef.current && filterBarRef.current.onSearchWithFilterBar) {
              filterBarRef.current.onSearchWithFilterBar({ assignee: enable ? [loginUserId] : undefined });
            }
          }}
          checkedChildren={i18n.t('own')}
          unCheckedChildren={i18n.t('own')}
        />
        <Radio.Group
          value={viewType}
          buttonStyle="solid"
          onChange={(e) => {
            updater.viewType(e.target.value);
          }}
        >
          {map(ViewTypeMap, view => {
            if (view.value === 'kanban') {
              const curGrouName = get(find(curViewGroup, { value: viewGroup }), 'name');
              const getMenu = () => {
                return (
                  <Menu className='issue-view-type' onClick={(e: any) => update({ viewGroup: e.key, viewType: view.value })}>
                    {map(curViewGroup, g => {
                      return <Menu.Item className={`group-item ${curViewGroup === g.value ? 'chosen-group' : ''}`} key={g.value}>{g.name}</Menu.Item>;
                    })}
                  </Menu>
                );
              };
              return (
                <Tooltip key={view.value} title={view.tip}>
                  <Dropdown overlay={getMenu()}>
                    <Radio.Button value={view.value}>
                      <div className='flex-box'>
                        <CustomIcon type={view.icon} className='mr4' />
                        <span className='nowrap' style={{ width: 56 }}>{curGrouName}</span>
                      </div>
                    </Radio.Button>
                  </Dropdown>
                </Tooltip>
              );
            } else {
              return (
                <Tooltip key={view.value} title={view.tip}>
                  <Radio.Button value={view.value}>
                    <div className='flex-box'>
                      <CustomIcon type={view.icon} className='mr4' />
                      {view.name}
                    </div>
                  </Radio.Button>
                </Tooltip>
              );
            }
          })}
        </Radio.Group>
        {
          [ISSUE_TYPE.BUG, ISSUE_TYPE.REQUIREMENT, ISSUE_TYPE.TASK].includes(issueType) &&
          <ImportFile
            issueType={issueType}
            download={downloadTemplate}
            projectID={params.projectId}
            afterImport={() => {
              reloadData();
            }}
            pass={requirementAuth.import.pass}
          />
        }
        <Tooltip title={i18n.t('export')}>
          <WithAuth pass={requirementAuth.export.pass} >
            <Button className='ml8' onClick={() => window.open(getDownloadUrl())}>
              <CustomIcon type="export" />
            </Button>
          </WithAuth>
        </Tooltip>
        <FilterButton />
      </ToolBarWithFilter>
    </div>
  );
};

export default IssueHeader;
