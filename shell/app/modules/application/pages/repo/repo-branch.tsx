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

import { Spin, Button, Tooltip, Dropdown, Menu, Alert, Input } from 'nusi';
import { Icon as CustomIcon, EmptyHolder, Avatar, DeleteConfirm, IF } from 'common';
import * as React from 'react';
import { fromNow, replaceEmoji } from 'common/utils';
import { mergeRepoPathWith } from './util';
import GotoCommit, { getCommitPath } from 'application/common/components/goto-commit';
import { goTo } from 'app/common/utils';
import { Link } from 'react-router-dom';
import { get, find, debounce } from 'lodash';
import { WithAuth, usePerm } from 'app/user/common';
import i18n from 'i18n';
import './repo-branch.scss';
import repoStore from 'application/stores/repo';
import { useLoading } from 'app/common/stores/loading';
import appStore from 'application/stores/application';

const { Search } = Input;

export const BRANCH_TABS = [
  {
    key: 'branches',
    name: i18n.t('application:branch'),
  },
  {
    key: 'tags',
    name: i18n.t('application:tag'),
  },
];

const RepoBranch = () => {
  const permMap = usePerm(s => s.app.repo.branch);
  const [info, list] = repoStore.useStore(s => [s.info, s.branch]);
  const branchInfo = appStore.useStore(s => s.branchInfo);
  const { deleteBranch, getListByType, setDefaultBranch } = repoStore.effects;
  const { clearListByType } = repoStore.reducers;
  const [isFetching] = useLoading(repoStore, ['getListByType']);
  React.useEffect(() => {
    getListByType({ type: 'branch' });
    return () => {
      clearListByType('branch');
    };
  }, [getListByType, clearListByType]);
  if (!list.length) {
    return <EmptyHolder relative style={{ justifyContent: 'start' }} />;
  }
  const goToCompare = (branch: string) => {
    goTo(`./compare/${info.defaultBranch}...${encodeURIComponent(branch)}`);
  };
  const getList = debounce((branch: string) => {
    getListByType({ type: 'branch', findBranch: branch });
  }, 300);

  const handleChangeBranchName = (e:React.ChangeEvent<HTMLInputElement>) => {
    getList(e.target.value);
  };

  return (
    <Spin spinning={isFetching}>
      <Search
        className="repo-branch-search-input mb16"
        placeholder={i18n.t('common:search by {name}', { name: i18n.t('application:branch') })}
        onChange={handleChangeBranchName}
      />
      <IF check={info.isLocked}>
        <Alert message={i18n.t('lock-repository-tip')} type="error" />
      </IF>
      <div className="repo-branch-list">
        {
          list.map((item) => {
            const { name, id, commit, isProtect, isDefault, isMerged } = item;
            const { commitMessage, author = {} } = commit || {};
            const { name: committerName, when } = author as any;
            const isProtectBranch = get(find(branchInfo, { name }), 'isProtect');
            const curAuth = isProtectBranch ? permMap.writeProtected.pass : permMap.writeNormal.pass;
            return (
              <div key={name} className="branch-item flex-box">
                <div className="branch-item-left">
                  <div className="bold-500 v-align fz16 mb12">
                    {
                      isProtect ? (
                        <Tooltip title={i18n.t('protected branch')}>
                          <CustomIcon className="fz22 color-green" type="baohu" />
                        </Tooltip>
                      ) : <CustomIcon className="fz22" type="fz" />
                    }
                    <Link to={mergeRepoPathWith(`/tree/${name}`)}><span className="color-text hover-active">{name}</span></Link>
                    {isDefault && <span className='tag-primary'>{i18n.t('default')}</span>}
                    {isMerged && <span className='tag-success'>{i18n.t('application:Merged')}</span>}
                  </div>
                  <div className="v-align color-text-sub">
                    <span className="inline-v-align"><Avatar showName name={committerName} />&nbsp;{i18n.t('committed at')}</span>
                    <span className="ml4">{fromNow(when)}</span>
                    <span className="ml24 color-text-desc nowrap flex-1">
                      <GotoCommit length={6} commitId={id} />
                      &nbsp;·&nbsp;
                      <Tooltip title={commitMessage.length > 50 ? commitMessage : null}>
                        <Link className="color-text-desc hover-active" to={getCommitPath(id)}>{replaceEmoji(commitMessage)}</Link>
                      </Tooltip>
                    </span>
                  </div>
                </div>
                <div className="branch-item-right">
                  <Button className="mr12" disabled={info.isLocked} onClick={() => goToCompare(name)}>{i18n.t('application:compare')}</Button>
                  <DeleteConfirm
                    onConfirm={() => {
                      deleteBranch({ branch: name });
                    }}
                  >
                    <WithAuth pass={curAuth} >
                      <Button disabled={info.isLocked || isDefault} className="mr12" ghost type="danger">{i18n.t('delete')}</Button>
                    </WithAuth>
                  </DeleteConfirm>
                  <Dropdown overlay={(
                    <Menu
                      onClick={(e) => {
                        switch (e.key) {
                          case 'setDefault':
                            setDefaultBranch(name);
                            break;
                          default:
                            break;
                        }
                      }}
                    >
                      <Menu.Item key="setDefault" disabled={!curAuth || info.isLocked || isDefault}>{i18n.t('application:set default')}</Menu.Item>
                    </Menu>
                  )}
                  >
                    <Button>
                      <CustomIcon type="more" />
                    </Button>
                  </Dropdown>
                </div>
              </div>
            );
          })
        }
      </div>
    </Spin>
  );
};


export default RepoBranch;
