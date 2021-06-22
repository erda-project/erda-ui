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

import { Input, Tooltip, List } from 'app/nusi';
import { useDebounce, useUnmount } from 'react-use';
import * as React from 'react';
import { Icon as CustomIcon, EmptyListHolder, LoadMore, IF, useUpdate } from 'common';
import { goTo, fromNow, ossImg } from 'app/common/utils';
import { theme } from 'app/themes';
import classnames from 'classnames';
import i18n from 'i18n';
import userStore from 'app/user/stores';
import { useLoading } from 'app/common/stores/loading';
import './project-list.scss';
import BlockNetworkStatus, { BlockNetworkTips } from 'dop/pages/projects/block-comp';
import ApplyUnblockModal, { IMetaData } from 'dop/pages/projects/apply-unblock-modal';

const { Search } = Input;
export const ProjectList = () => {
  const [projectList, projectPaging] = userStore.useStore((s) => [s.projectList, s.projectPaging]);
  const { getJoinedProjects } = userStore.effects;
  const { clearProjectList } = userStore.reducers;
  const [loading] = useLoading(userStore, ['getJoinedProjects']);
  const [state, , update] = useUpdate({
    visible: false,
    metaData: {} as IMetaData,
  });

  const [searchKey, setSearchKey] = React.useState('');

  useUnmount(clearProjectList);

  useDebounce(
    () => {
      getJoinedProjects({
        searchKey,
        pageNo: 1,
      });
    },
    600,
    [searchKey],
  );

  const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchKey(value);
  };

  const goToProject = ({ id }: PROJECT.Detail) => {
    goTo(goTo.pages.project, { projectId: id });
  };

  const reloadProjectsList = () => {
    getJoinedProjects({
      searchKey,
      pageNo: 1,
    });
  };

  const load = () => {
    return getJoinedProjects({
      searchKey,
      loadMore: true,
      pageNo: projectPaging.pageNo + 1,
    });
  };

  const closeModal = () => {
    update({
      visible: false,
      metaData: {},
    });
  };

  const handleShowApplyModal = (_status: string, { name, id }: PROJECT.Detail) => {
    update({
      visible: true,
      metaData: {
        projectId: id,
        projectName: name,
      },
    });
  };

  const Holder = ({ children }: any) =>
    loading.getJoinedProjects || projectList.length ? children : <EmptyListHolder />;

  const renderProjectItem = (item: PROJECT.Detail) => {
    return (
      <div className="project-item">
        <div className="item-container" onClick={() => goToProject(item)}>
          <div className="item-left">
            <div className={classnames('item-img', item.logo && 'img')}>
              <IF check={item.logo}>
                <img src={ossImg(item.logo, { w: 100 })} alt="logo" />
                <IF.ELSE />
                <CustomIcon color type={theme.projectIcon} />
              </IF>
            </div>
            <div className="item-content">
              <div className="item-name nowrap flex-box justify-start">
                <Tooltip title={item.name}>
                  <span className="font-medium mr24">{item.displayName}</span>
                </Tooltip>
              </div>
              <div className="item-desc nowrap">{item.desc || i18n.t('project:edit description in setting')}</div>
              <div className="item-footer">
                <Tooltip title={i18n.t('dop:number of application')}>
                  <span>
                    <CustomIcon type="yy-4" />
                    <span>{item.stats.countApplications}</span>
                  </span>
                </Tooltip>
                <span>
                  <CustomIcon type="sj" />
                  <span>
                    {item.updatedAt ? fromNow(item.updatedAt, { prefix: `${i18n.t('update time')}:` }) : i18n.t('none')}
                  </span>
                </span>
                <BlockNetworkStatus
                  scope="project"
                  canOperate={item.canUnblock}
                  status={item.blockStatus}
                  onClick={(k) => {
                    handleShowApplyModal(k, item);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="project-list-section">
      <BlockNetworkTips />
      <Search
        className="search-input"
        placeholder={i18n.t('dop:search by project name')}
        value={searchKey}
        onChange={onSearch}
      />
      <Holder>
        <List dataSource={projectList} renderItem={renderProjectItem} />
      </Holder>
      <LoadMore load={load} hasMore={projectPaging.hasMore} isLoading={loading} />
      <ApplyUnblockModal
        visible={state.visible}
        metaData={state.metaData as IMetaData}
        onCancel={closeModal}
        afterSubmit={reloadProjectsList}
      />
    </div>
  );
};
