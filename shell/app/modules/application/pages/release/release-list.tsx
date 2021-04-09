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
import i18n from 'i18n';
import { Pagination, Spin, Input, Select, Tooltip } from 'nusi';
import { map, get } from 'lodash';
import { SearchTable, EmptyListHolder, EmptyHolder, IF, useUpdate } from 'common';
import { updateSearch } from 'common/utils';
import { useLoading } from 'app/common/stores/loading';
import { ReleaseItem } from './components/release-item';
import ReleaseDetail from './components/release-detail';
import releaseStore from 'application/stores/release';
import { useEffectOnce } from 'react-use';
import routeInfoStore from 'app/common/stores/route';
import { getBranchInfo } from 'application/services/application';

import './release-list.scss';

const { ELSE } = IF;
const { Search } = Input;
const { Option } = Select;

const ReleaseList = () => {
  const [list, paging] = releaseStore.useStore(s => [s.list, s.paging]);
  const { pageNo: initPageNo, pageSize, total } = paging;
  const { getReleaseList } = releaseStore.effects;
  const { clearReleaseList } = releaseStore.reducers;
  const [params, query] = routeInfoStore.useStore(s => [s.params, s.query]);
  const [loading] = useLoading(releaseStore, ['getReleaseList']);
  const [state, updater] = useUpdate({
    pageNo: initPageNo,
    projectId: undefined as unknown as string,
    applicationId: params.appId as unknown as string,
    chosenPos: 0, // TODO: use id
    branchInfo: [] as APPLICATION.IBranchInfo[],
    queryObj: {
      q: query.q,
      branchName: query.branchName as unknown as string,
    },
  });
  const {
    pageNo,
    projectId,
    applicationId,
    queryObj,
    chosenPos,
    branchInfo,
  } = state;

  React.useEffect(() => {
    const arg: any = {
      pageNo,
      pageSize,
      ...queryObj,
    };
    if (projectId) {
      arg.projectId = +projectId;
    }
    if (applicationId) {
      arg.applicationId = +applicationId;
    }
    getReleaseList(arg);
  }, [applicationId, getReleaseList, pageNo, pageSize, projectId, queryObj]);

  useEffectOnce(() => {
    return () => clearReleaseList();
  });

  React.useEffect(() => {
    const { q, branchName } = queryObj;
    const urlObj = { branchName } as any;
    urlObj.q = q || undefined;
    updateSearch(urlObj);
  }, [queryObj]);

  React.useEffect(() => {
    applicationId && getBranchInfo({ appId: +applicationId }).then((res:any) => {
      updater.branchInfo(res.data || []);
    });
  }, [applicationId, updater]);

  const changePage = (num: number) => {
    if (num !== pageNo) {
      updater.pageNo(num);
    }
  };

  const releaseId = get(list, `[${chosenPos}].releaseId`) || '' as string;
  return (
    <div className="release-list-container">
      <div className="release-list-page column-flex-box">
        <IF check={!params.appId}>
          <div className="search-group">
            <Search
              value={projectId}
              className="mb12"
              placeholder={i18n.t('search by project id')}
              onChange={(e) => !isNaN(+e.target.value) && updater.projectId(e.target.value)}
            />
            <Search
              value={applicationId}
              className="mb12"
              placeholder={i18n.t('search by application id')}
              onChange={(e) => !isNaN(+e.target.value) && updater.applicationId(e.target.value)}
            />
          </div>
        </IF>
        <Select
          className='mb8 mx16'
          value={queryObj.branchName}
          onChange={(v: any) => updater.queryObj({ ...queryObj, branchName: v })}
          placeholder={i18n.t('filter by {name}', { name: i18n.t('application:branch') })}
          allowClear
        >
          {map(branchInfo, branch => (
            <Option key={branch.name} value={branch.name}>
              <Tooltip title={branch.name}>{branch.name}</Tooltip>
            </Option>
          ))}
        </Select>
        <SearchTable
          onSearch={v => { updater.queryObj({ ...queryObj, q: v }); }}
          searchValue={query.q}
          placeholder={i18n.t('search by keywords')}
          needDebounce
          searchFullWidth
        >
          <Spin spinning={loading}>
            {
              map(list, (item, index) => (
                <ReleaseItem data={item} key={item.releaseId} isActive={index === chosenPos} onClick={() => updater.chosenPos(index)} />
              ))
            }
            <IF check={list.length === 0 && !query.q}><EmptyListHolder /></IF>
          </Spin>
          <IF check={query.q}>
            <div className="search-tip">
              <span>{i18n.t('org:no-result-try')}</span>
            </div>
            <ELSE />
            <Pagination className="release-pagination" simple defaultCurrent={1} total={total} onChange={changePage} />
          </IF>
        </SearchTable>
      </div>
      <div className="release-detail-container">
        <IF check={releaseId}>
          <ReleaseDetail releaseId={releaseId} data={list[chosenPos]} />
          <ELSE />
          <EmptyHolder relative style={{ justifyContent: 'start' }} />
        </IF>
      </div>
    </div>
  );
};


export default ReleaseList;
